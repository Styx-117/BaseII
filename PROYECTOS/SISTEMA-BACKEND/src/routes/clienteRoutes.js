//clienteRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente, actualizarCliente, cambiarEstadoCliente } = require('../controllers/clienteController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

router.use(verificarToken, (req,res,next) => ['ADMIN','CAJERO','VENTAS'].includes(req.user.rol) ? next() : res.status(403).json({error:'Se requiere acceso comercial.'}));
router.get('/', obtenerClientes);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);

router.patch('/:id/estado', verificarAdmin, cambiarEstadoCliente);

module.exports = router;