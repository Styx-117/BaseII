const pool = require('../config/db');

const obtenerVentas = async (req, res) => {
    try {
        const usuarioRol = req.user.rol; 

        
        let query = `
            SELECT 
                v.id, 
                v.fecha_venta, 
                v.total, 
                v.estado,
                c.nombre AS cliente_nombre, 
                u.nombre_completo AS vendedor_nombre
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            JOIN usuarios u ON v.usuario_id = u.id
            WHERE 1=1
        `;

        if (usuarioRol === 'CAJERO') {
            query += ` AND v.fecha_venta >= CURRENT_DATE - INTERVAL '3 days'`;
        }

        query += ` ORDER BY v.id DESC`;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error en obtenerVentas:", error);
        res.status(500).json({ error: 'Error al obtener el historial de ventas' });
    }
};

const registrarVenta = async (req, res) => {
    const { cliente_id, metodo_pago = 'EFECTIVO', items } = req.body;
    if (!Array.isArray(items) || !items.length || !['EFECTIVO','TARJETA','YAPE','PLIN','TRANSFERENCIA'].includes(metodo_pago)) return res.status(400).json({error:'Revisa los productos y el método de pago.'});
    const cantidades = new Map();
    for (const item of items) {
        const id = Number(item.producto_id), cantidad = Number(item.cantidad);
        if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(cantidad) || cantidad <= 0) return res.status(400).json({error:'Producto o cantidad no válida.'});
        cantidades.set(id, (cantidades.get(id) || 0) + cantidad);
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const productos = [];
        let totalCentimos = 0;
        for (const [id, cantidad] of [...cantidades].sort((a,b) => a[0]-b[0])) {
            const result = await client.query('SELECT id,nombre,precio,stock_actual FROM productos WHERE id=$1 AND activo=TRUE FOR UPDATE', [id]);
            const producto = result.rows[0];
            if (!producto || producto.stock_actual < cantidad) { const err = new Error(producto ? `Stock insuficiente para ${producto.nombre}` : 'Producto no disponible'); err.status=400; throw err; }
            totalCentimos += Math.round(Number(producto.precio)*100)*cantidad;
            productos.push({id,cantidad,precio:producto.precio});
        }
        const venta = await client.query('INSERT INTO ventas(cliente_id,usuario_id,total,metodo_pago) VALUES($1,$2,$3,$4) RETURNING id',[cliente_id || null,req.user.id,(totalCentimos/100).toFixed(2),metodo_pago]);
        const id = venta.rows[0].id;
        for (const producto of productos) {
            await client.query('INSERT INTO detalle_ventas(venta_id,producto_id,cantidad,precio_unitario) VALUES($1,$2,$3,$4)',[id,producto.id,producto.cantidad,producto.precio]);
            await client.query('UPDATE productos SET stock_actual=stock_actual-$1 WHERE id=$2',[producto.cantidad,producto.id]);
            await client.query("INSERT INTO movimientos_inventario(producto_id,usuario_id,tipo_movimiento,cantidad,motivo) VALUES($1,$2,'SALIDA',$3,$4)",[producto.id,req.user.id,producto.cantidad,`Venta POS #${id}`]);
        }
        await client.query('COMMIT');
        res.status(201).json({mensaje:'Venta registrada y stock actualizado',venta_id:id});
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en venta:',error.message);
        res.status(error.status || 500).json({error:error.status ? error.message : 'No se pudo procesar la venta.'});
    } finally { client.release(); }
};

const obtenerVentaConId = async (req, res) => {
    const { id } = req.params;
    try {
        const ventaQuery = `
            SELECT 
                v.id, v.fecha_venta AS fecha, v.total, v.estado,
                c.nombre AS cliente_nombre, 
                u.nombre_completo AS vendedor_nombre
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            JOIN usuarios u ON v.usuario_id = u.id
            WHERE v.id = $1
        `;
        const ventaResult = await pool.query(ventaQuery, [id]);
        
        if (ventaResult.rows.length === 0) {
            return res.status(404).json({ error: 'La boleta solicitada no existe' });
        }

        const venta = ventaResult.rows[0];

        const detallesQuery = `
            SELECT 
                p.nombre AS producto_nombre,
                d.cantidad,
                d.precio_unitario,
                (d.cantidad * d.precio_unitario) AS subtotal
            FROM detalle_ventas d
            JOIN productos p ON d.producto_id = p.id
            WHERE d.venta_id = $1
        `;
        const detallesResult = await pool.query(detallesQuery, [id]);
        
        venta.productos = detallesResult.rows;

        res.json(venta);
    } catch (error) {
        console.error("Error en obtenerVentaConId:", error);
        res.status(500).json({ error: 'Error al obtener el detalle de la venta' });
    }
};

module.exports = { obtenerVentas, registrarVenta, obtenerVentaConId };