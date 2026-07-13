//usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerUsuarios, crearUsuario, actualizarUsuario, cambiarEstadoUsuario, actualizarMiPerfil } = require('../controllers/usuarioController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Importar upload al inicio

// Rutas con upload para manejar imágenes
router.get('/', verificarToken, verificarAdmin, obtenerUsuarios);
router.post('/', verificarToken, verificarAdmin, upload.single('imagen'), crearUsuario);
router.put('/:id', verificarToken, verificarAdmin, upload.single('imagen'), actualizarUsuario);
router.patch('/:id/estado', verificarToken, verificarAdmin, cambiarEstadoUsuario);
router.put('/:id/perfil', verificarToken, actualizarMiPerfil);
module.exports = router; 