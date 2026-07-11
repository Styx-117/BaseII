const express = require('express');
const router = express.Router();
const { obtenerCategorias, crearCategoria } = require('../controllers/CategoriaController');

router.get('/', obtenerCategorias);
router.post('/', crearCategoria);

module.exports = router;