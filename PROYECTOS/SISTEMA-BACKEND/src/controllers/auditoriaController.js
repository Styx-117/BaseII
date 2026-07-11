//auditoriaController.js
const pool = require('../config/db');

const obtenerAuditoriaPrecios = async (req, res) => {
    try {
        const query = `
            SELECT a.id, p.nombre AS producto, a.precio_anterior, a.precio_nuevo, a.fecha_cambio
            FROM auditoria_precios a
            JOIN productos p ON a.producto_id = p.id
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