//auditoriaRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerAuditoriaPrecios } = require('../controllers/auditoriaController');

router.get('/', obtenerAuditoriaPrecios);
module.exports = router;