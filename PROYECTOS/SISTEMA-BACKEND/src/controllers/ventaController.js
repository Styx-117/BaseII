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
    const client = await pool.connect();

    try {
        const { cliente_id, metodo_pago, items } = req.body;
        const usuario_id = req.user.id; 

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No se puede procesar una venta sin productos en el carrito.' });
        }

        await client.query('BEGIN');
        let totalCalculado = 0;
        items.forEach(item => {
            totalCalculado += item.cantidad * parseFloat(item.precio_unitario);
        });

        const insertVentaQuery = `
            INSERT INTO ventas (cliente_id, usuario_id, total, metodo_pago) 
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const resVenta = await client.query(insertVentaQuery, [
            cliente_id, 
            usuario_id, 
            totalCalculado, 
            metodo_pago || 'EFECTIVO'
        ]);
        const ventaId = resVenta.rows[0].id;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const insertDetalle = `
                INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) 
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(insertDetalle, [ventaId, item.producto_id, item.cantidad, item.precio_unitario]);

            const updateStock = 'UPDATE productos SET stock_actual = stock_actual - $1 WHERE id = $2';
            await client.query(updateStock, [item.cantidad, item.producto_id]);
            const insertKardex = `
                INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo_movimiento, cantidad, motivo) 
                VALUES ($1, $2, $3, $4, $5)
            `;
            const motivoVenta = `Venta POS #${ventaId}`;
            await client.query(insertKardex, [item.producto_id, usuario_id, 'SALIDA', item.cantidad, motivoVenta]);
        }

        await client.query('COMMIT'); 
        res.status(201).json({ mensaje: 'Venta registrada y Kardex actualizado con éxito', venta_id: ventaId });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Error en la transacción de venta:', error);
        res.status(500).json({ error: 'Error interno al procesar la transacción de la venta' });
    } finally {
        client.release(); 
    }
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