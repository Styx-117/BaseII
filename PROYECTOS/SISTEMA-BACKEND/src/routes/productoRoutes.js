// productoRoutes.js
const express = require('express');
const router = express.Router();
const gestion = (req, res, next) => ['ADMIN', 'ALMACENERO'].includes(req.user.rol) ? next() : res.status(403).json({error: 'Acceso restringido a logística'});
const upload = require('../middleware/upload'); // <-- Importante
const {
    obtenerProductos,
    crearProducto,
    eliminarProducto,
    actualizarPrecio,
    actualizarProducto
} = require('../controllers/productoController');

// Rutas
router.get('/', obtenerProductos);
router.post('/', gestion, upload.single('imagen'), crearProducto);        // <-- con upload
router.delete('/:id', gestion, eliminarProducto);
router.patch('/:id/precio', gestion, actualizarPrecio);
router.put('/:id', gestion, upload.single('imagen'), actualizarProducto); // <-- con upload

module.exports = router;