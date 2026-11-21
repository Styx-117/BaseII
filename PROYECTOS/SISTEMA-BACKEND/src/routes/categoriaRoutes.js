//categoriaRoutes.js
const express = require('express');
const router = express.Router();
const gestion = (req, res, next) => ['ADMIN', 'ALMACENERO'].includes(req.user.rol) ? next() : res.status(403).json({error: 'Acceso restringido a logística'});
const { obtenerCategorias, crearCategoria } = require('../controllers/categoriaController');

router.get('/', obtenerCategorias);
router.post('/', gestion, crearCategoria);

module.exports = router;