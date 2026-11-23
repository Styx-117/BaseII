//ventaRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerVentas, registrarVenta, anularVenta, obtenerVentaConId } = require('../controllers/ventaController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const ventas = (req, res, next) => ['ADMIN','CAJERO','VENTAS'].includes(req.user.rol) ? next() : res.status(403).json({error: 'Acceso restringido a ventas'});
router.get('/', verificarToken, ventas, obtenerVentas);
router.get('/:id', verificarToken, ventas, obtenerVentaConId);
router.post('/', verificarToken, ventas, registrarVenta); 

router.patch('/:id/anular', verificarToken, verificarAdmin, anularVenta);
// router.delete('/:id', verificarToken, verificarAdmin, eliminarVenta);

module.exports = router;