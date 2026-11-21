//auditoriaController.js
const pool = require('../config/db');

const obtenerAuditoriaPrecios = async (req, res) => {
    try {
        const query = `
            SELECT a.id, p.nombre AS producto, a.precio_anterior, a.precio_nuevo, a.fecha_cambio, u.nombre_completo AS responsable
            FROM auditoria_precios a
            JOIN productos p ON a.producto_id = p.id
            LEFT JOIN usuarios u ON u.id = a.usuario_id
            ORDER BY a.fecha_cambio DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la auditoría' });
    }
};

module.exports = { obtenerAuditoriaPrecios };