const express = require('express');
const router = express.Router();
const { obtenerUsuarios, crearUsuario, actualizarUsuario, cambiarEstadoUsuario } = require('../controllers/usuarioController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

router.get('/', verificarToken, verificarAdmin, obtenerUsuarios);
router.post('/', verificarToken, verificarAdmin, crearUsuario);
router.put('/:id', verificarToken, verificarAdmin, actualizarUsuario);
router.patch('/:id/estado', verificarToken, verificarAdmin, cambiarEstadoUsuario);

module.exports = router;