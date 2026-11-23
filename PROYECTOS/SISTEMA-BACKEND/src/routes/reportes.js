const router = require('express').Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/authMiddleware');

const consultas = {
    ventas: `SELECT v.id AS venta, v.fecha_venta AS fecha, p.nombre AS producto,
        d.cantidad, d.precio_unitario, d.cantidad*d.precio_unitario AS subtotal,
        v.metodo_pago AS pago, v.estado, CASE WHEN v.es_demo THEN 'Demostración' ELSE 'POS' END AS origen, u.nombre_completo AS responsable
        FROM ventas v JOIN detalle_ventas d ON d.venta_id=v.id
        JOIN productos p ON p.id=d.producto_id JOIN usuarios u ON u.id=v.usuario_id
        WHERE v.fecha_venta >= $1::date AND v.fecha_venta < $2::date+1
        AND ($3::int IS NULL OR p.id=$3) ORDER BY v.id DESC,d.id`,
    ingresos: `SELECT to_char(v.fecha_venta, 'YYYY-MM-DD') AS fecha, v.metodo_pago AS pago,
        CASE WHEN v.es_demo THEN 'Demostración' ELSE 'POS' END AS origen,
        count(distinct v.id)::int AS ventas, sum(d.cantidad*d.precio_unitario) AS ingresos
        FROM ventas v JOIN detalle_ventas d ON d.venta_id=v.id
        WHERE v.fecha_venta >= $1::date AND v.fecha_venta < $2::date+1
        AND v.estado='COMPLETADO' AND ($3::int IS NULL OR d.producto_id=$3) GROUP BY 1,2,3 ORDER BY 1 DESC,2`,
    movimientos: `SELECT m.fecha_movimiento AS fecha,p.nombre AS producto,m.tipo_movimiento AS tipo,
        m.cantidad,m.saldo_despues AS saldo,m.motivo,u.nombre_completo AS responsable
        FROM movimientos_inventario m JOIN productos p ON p.id=m.producto_id
        LEFT JOIN usuarios u ON u.id=m.usuario_id
        WHERE m.fecha_movimiento >= $1::date AND m.fecha_movimiento < $2::date+1
        AND ($3::int IS NULL OR p.id=$3) ORDER BY m.id DESC`,
    operaciones: `SELECT o.fecha, o.entidad,o.registro,o.accion,coalesce(u.nombre_completo,'Sistema') AS responsable
        FROM operaciones o LEFT JOIN usuarios u ON u.id=o.usuario_id
        WHERE o.fecha >= $1::date AND o.fecha < $2::date+1 ORDER BY o.id DESC`
};

router.get('/:tipo', verificarToken, async (req,res) => {
    if (!['ADMIN','GERENCIA'].includes(req.user.rol)) return res.status(403).json({error:'Se requiere acceso a reportes.'});
    const {tipo} = req.params;
    if (!Object.hasOwn(consultas,tipo)) return res.sendStatus(404);
    const {desde,hasta,producto} = req.query;
    const fechaValida = valor => /^\d{4}-\d{2}-\d{2}$/.test(valor) && Number.isFinite(Date.parse(valor)) && new Date(valor).toISOString().startsWith(valor);
    if (!fechaValida(desde) || !fechaValida(hasta) || desde > hasta || (producto && !/^\d{1,9}$/.test(producto))) {
        return res.status(400).json({error:'Revisa el intervalo de fechas y el producto.'});
    }
    const parametros = [desde,hasta];
    if (tipo !== 'operaciones') parametros.push(producto || null);
    const datos = await pool.query(consultas[tipo],parametros);
    res.json({columnas:datos.fields.map(c => c.name),filas:datos.rows});
});
module.exports = router;
