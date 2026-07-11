const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente, actualizarCliente, cambiarEstadoCliente } = require('../controllers/clienteController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

router.get('/', verificarToken, obtenerClientes);
router.post('/', verificarToken, crearCliente);
router.put('/:id', verificarToken, actualizarCliente);

router.patch('/:id/estado', verificarToken, verificarAdmin, cambiarEstadoCliente);

module.exports = router;