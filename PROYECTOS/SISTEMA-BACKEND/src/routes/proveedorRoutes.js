const express = require('express');
const router = express.Router();
const { obtenerProveedores, crearProveedor, actualizarProveedor, cambiarEstadoProveedor } = require('../controllers/proveedorController');
const { verificarToken } = require('../middleware/authMiddleware');


router.get('/', verificarToken, obtenerProveedores);
router.post('/', verificarToken, crearProveedor);
router.put('/:id', verificarToken, actualizarProveedor);
router.patch('/:id/estado', verificarToken, cambiarEstadoProveedor);

module.exports = router;