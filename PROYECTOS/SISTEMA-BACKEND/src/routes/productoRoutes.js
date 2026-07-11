//productoRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerProductos, crearProducto, eliminarProducto, actualizarPrecio, actualizarProducto } = require('../controllers/productoController');

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.delete('/:id', eliminarProducto);
router.patch('/:id/precio', actualizarPrecio);
router.put('/:id', actualizarProducto); 

module.exports = router;