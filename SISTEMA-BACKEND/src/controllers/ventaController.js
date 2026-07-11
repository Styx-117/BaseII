const pool = require('../config/db');

const obtenerVentas = async (req, res) => {
    try {
        const query = `
            SELECT 
                v.id, 
                v.fecha_venta, 
                v.total, 
                c.nombre AS cliente_nombre, 
                u.nombre_completo AS vendedor_nombre
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.fecha_venta DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error en getVentas:", error);
        res.status(500).json({ error: 'Error al obtener el historial de ventas' });
    }
};

const registrarVenta = async (req, res) => {
    const client = await pool.connect();

    try {
        const { cliente_id, usuario_id, total, metodo_pago, detalles } = req.body;

        await client.query('BEGIN');

        const insertVentaQuery = `
            INSERT INTO ventas (cliente_id, usuario_id, total, metodo_pago) 
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const resVenta = await client.query(insertVentaQuery, [cliente_id, usuario_id, total, metodo_pago]);
        const ventaId = resVenta.rows[0].id;

        for (let i = 0; i < detalles.length; i++) {
            const item = detalles[i];

            const insertDetalle = 'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)';
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
        console.error('Error en la transacción:', error);
        res.status(500).json({ error: 'Error interno al procesar la venta' });
    } finally {
        client.release();
    }
};

const obtenerVentaConId = async (req, res) => {
    const { id } = req.params;
    try {
        const ventaQuery = `
            SELECT 
                v.id, v.fecha_venta AS fecha, v.total, 
                c.nombre AS cliente_nombre, 
                u.nombre_completo AS vendedor_nombre
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            JOIN usuarios u ON v.usuario_id = u.id
            WHERE v.id = $1
        `;
        const ventaResult = await pool.query(ventaQuery, [id]);
        
        if (ventaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
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
        console.error("Error en getVentaById:", error);
        res.status(500).json({ error: 'Error al obtener el detalle de la venta' });
    }
};

module.exports = {obtenerVentas, registrarVenta, obtenerVentaConId};