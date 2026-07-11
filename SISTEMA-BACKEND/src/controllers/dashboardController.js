const pool = require('../config/db');

const getStats = async (req, res) => {
    try {
        const ingresosRes = await pool.query(
            "SELECT COALESCE(SUM(total), 0) AS total_ingresos FROM ventas"
        );
        const totalIngresos = parseFloat(ingresosRes.rows[0].total_ingresos);

        const usuariosRes = await pool.query(
            "SELECT COUNT(*) AS total_usuarios FROM usuarios WHERE activo = true"
        );
        const totalUsuarios = parseInt(usuariosRes.rows[0].total_usuarios);

       const chartQuery = `
    SELECT DATE(fecha_venta) as fecha, SUM(total) as total_dia 
    FROM ventas 
    WHERE fecha_venta >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(fecha_venta) 
    ORDER BY DATE(fecha_venta) ASC
`;
        const chartRes = await pool.query(chartQuery);
        
        res.json({
            ingresos: totalIngresos,
            usuarios: totalUsuarios,
            grafica: chartRes.rows
        });
    } catch (error) {
        console.error("Error en Dashboard:", error);
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
};

module.exports = { getStats };