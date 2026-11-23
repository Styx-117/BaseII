const pool = require('../config/db');

async function getStats(req, res) {
    const periodo = Number(req.query.dias || 7);
    if (![1, 7, 30].includes(periodo)) return res.status(400).json({error: 'Periodo no válido.'});

    const comercial = req.user.rol !== 'ALMACENERO';
    const vendedor = ['VENTAS','CAJERO'].includes(req.user.rol) ? req.user.id : null;
    const stock = await pool.query(`
        SELECT count(*)::int AS productos,
               count(*) FILTER (WHERE stock_actual <= stock_minimo)::int AS criticos,
               coalesce(sum(stock_actual), 0)::int AS unidades
        FROM productos WHERE activo`);
    const alertas = await pool.query(`
        SELECT nombre, stock_actual FROM productos
        WHERE activo AND stock_actual <= stock_minimo ORDER BY stock_actual, nombre LIMIT 10`);
    let grafica = [];
    if (comercial) {
        const ventas = await pool.query(`
            WITH dias AS (
                SELECT generate_series(current_date - ($1::int - 1), current_date, interval '1 day') AS dia
            )
            SELECT to_char(d.dia, 'DD/MM') AS fecha, count(v.id)::int AS ventas, count(v.id) FILTER (WHERE v.es_demo)::int AS demostracion,
                   coalesce(sum(v.total), 0)::float8 AS total_dia
            FROM dias d LEFT JOIN ventas v ON v.fecha_venta >= d.dia
                AND v.fecha_venta < d.dia + interval '1 day'
                AND v.estado='COMPLETADO' AND ($2::int IS NULL OR v.usuario_id=$2)
            GROUP BY d.dia ORDER BY d.dia`, [periodo, vendedor]);
        grafica = ventas.rows;
    }
    res.json({ ...stock.rows[0], alertas: alertas.rows, grafica });
}

module.exports = { getStats };
