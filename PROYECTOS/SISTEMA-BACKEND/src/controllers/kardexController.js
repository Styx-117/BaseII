//kardexController.js
const pool = require('../config/db');

const obtenerKardex = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.id,
                m.fecha_movimiento,
                m.tipo_movimiento,
                m.cantidad,
                m.motivo,
                p.nombre AS producto_nombre,
                u.nombre_completo AS usuario_nombre
            FROM movimientos_inventario m
            JOIN productos p ON m.producto_id = p.id
            JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.fecha_movimiento DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Kardex' });
    }
};

const registrarAjusteKardex = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { producto_id, tipo_movimiento, cantidad, motivo } = req.body;
        const usuario_id = 1; 

        await client.query('BEGIN');

        const insertKardexQuery = `
            INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo_movimiento, cantidad, motivo)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(insertKardexQuery, [producto_id, usuario_id, tipo_movimiento, cantidad, motivo]);

        const operador = tipo_movimiento === 'INGRESO' ? '+' : '-';
        const updateStockQuery = `
            UPDATE productos 
            SET stock_actual = stock_actual ${operador} $1 
            WHERE id = $2
        `;
        await client.query(updateStockQuery, [cantidad, producto_id]);

        await client.query('COMMIT');
        res.status(201).json({ mensaje: 'Ajuste de Kardex guardado y stock actualizado correctamente' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en registrarAjusteKardex:', error);
        res.status(500).json({ error: 'Error interno al procesar el ajuste de Kardex' });
    } finally {
        client.release();
    }
};

module.exports = { obtenerKardex, registrarAjusteKardex };
