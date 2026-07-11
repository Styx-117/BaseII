//kardexRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerKardex, registrarAjusteKardex } = require('../controllers/kardexController');

const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
router.get('/', verificarToken, obtenerKardex);
router.post('/', verificarToken, verificarAdmin, registrarAjusteKardex);

module.exports = router;