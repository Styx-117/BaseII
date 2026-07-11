const express = require('express');
const router = express.Router();
const { obtenerProductos, crearProducto, eliminarProducto, actualizarPrecio } = require('../controllers/productoController');

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.delete('/:id', eliminarProducto);
router.patch('/:id/precio', actualizarPrecio);

module.exports = router;