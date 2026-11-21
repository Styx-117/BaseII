const pool = require('../config/db');

async function getStats(req, res) {
    const periodo = Number(req.query.dias || 7);
    if (![7, 30].includes(periodo)) return res.status(400).json({error: 'Periodo no válido.'});

    const comercial = req.user.rol !== 'ALMACENERO';
    const vendedor = req.user.rol === 'CAJERO' ? req.user.id : null;
    const stock = await pool.query(`
        SELECT count(*)::int AS productos,
               count(*) FILTER (WHERE stock_actual <= 5)::int AS criticos,
               coalesce(sum(stock_actual), 0)::int AS unidades
        FROM productos WHERE activo`);
    const alertas = await pool.query(`
        SELECT nombre, stock_actual FROM productos
        WHERE activo AND stock_actual <= 5 ORDER BY stock_actual, nombre LIMIT 10`);
    let grafica = [];
    if (comercial) {
        const ventas = await pool.query(`
            WITH dias AS (
                SELECT generate_series(current_date - ($1::int - 1), current_date, interval '1 day') AS dia
            )
            SELECT to_char(d.dia, 'DD/MM') AS fecha, count(v.id)::int AS ventas,
                   coalesce(sum(v.total), 0)::float8 AS total_dia
            FROM dias d LEFT JOIN ventas v ON v.fecha_venta >= d.dia
                AND v.fecha_venta < d.dia + interval '1 day'
                AND ($2::int IS NULL OR v.usuario_id=$2)
            GROUP BY d.dia ORDER BY d.dia`, [periodo, vendedor]);
        grafica = ventas.rows;
    }
    res.json({ ...stock.rows[0], alertas: alertas.rows, grafica });
}

module.exports = { getStats };
