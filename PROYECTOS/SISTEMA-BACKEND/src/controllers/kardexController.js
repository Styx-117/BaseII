const pool = require('../config/db');

const registrarMovimiento = async (req, res) => {
    const client = await pool.connect();

    try {
        const { producto_id, tipo_movimiento, cantidad, motivo } = req.body;
        const usuario_id = req.user.id; 

        if (cantidad <= 0) {
            return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
        }
        if (!['INGRESO', 'AJUSTE', 'SALIDA'].includes(tipo_movimiento)) {
            return res.status(400).json({ error: 'Tipo de movimiento no válido' });
        }

        await client.query('BEGIN'); 

        if (tipo_movimiento === 'AJUSTE' || tipo_movimiento === 'SALIDA') {
            const stockRes = await client.query('SELECT stock_actual, nombre FROM productos WHERE id = $1', [producto_id]);
            const producto = stockRes.rows[0];
            
            if (!producto) throw new Error('Producto no encontrado');
            if (producto.stock_actual < cantidad) {
                throw new Error(`Stock insuficiente. Solo hay ${producto.stock_actual} unidades de ${producto.nombre}`);
            }
        }

        const insertMovimiento = `
            INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo_movimiento, cantidad, motivo) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;
        await client.query(insertMovimiento, [producto_id, usuario_id, tipo_movimiento, cantidad, motivo]);

        let updateStockQuery;
        if (tipo_movimiento === 'INGRESO') {
            updateStockQuery = 'UPDATE productos SET stock_actual = stock_actual + $1 WHERE id = $2';
        } else {
            updateStockQuery = 'UPDATE productos SET stock_actual = stock_actual - $1 WHERE id = $2';
        }
        await client.query(updateStockQuery, [cantidad, producto_id]);

        await client.query('COMMIT'); 
        
        res.status(201).json({ mensaje: `Movimiento de ${tipo_movimiento} registrado con éxito` });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Error en la transacción de inventario:', error);
        const mensaje = error.message.includes('Stock') ? error.message : 'Error interno al procesar el movimiento';
        res.status(500).json({ error: mensaje });
    } finally {
        client.release(); 
    }
};

const obtenerHistorialMovimientos = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.id, 
                p.nombre AS producto, 
                m.tipo_movimiento, 
                m.cantidad, 
                m.motivo, 
                m.fecha_movimiento,
                u.nombre_completo AS responsable
            FROM movimientos_inventario m
            JOIN productos p ON m.producto_id = p.id
            JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener kardex:", error);
        res.status(500).json({ error: 'Error al cargar el historial de movimientos' });
    }
};

module.exports = { registrarMovimiento, obtenerHistorialMovimientos };