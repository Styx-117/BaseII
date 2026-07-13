// productoRoutes.js
const express = require('express');
const router = express.Router();
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
router.post('/', upload.single('imagen'), crearProducto);        // <-- con upload
router.delete('/:id', eliminarProducto);
router.patch('/:id/precio', actualizarPrecio);
router.put('/:id', upload.single('imagen'), actualizarProducto); // <-- con upload

module.exports = router;