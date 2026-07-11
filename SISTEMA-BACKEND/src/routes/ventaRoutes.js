const express = require('express');
const router = express.Router();
const { obtenerVentas, registrarVenta, obtenerVentaConId } = require('../controllers/ventaController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

router.get('/', verificarToken, obtenerVentas);
router.get('/:id', verificarToken, obtenerVentaConId);
router.post('/', verificarToken, registrarVenta); 

// router.delete('/:id', verificarToken, verificarAdmin, eliminarVenta);

module.exports = router;