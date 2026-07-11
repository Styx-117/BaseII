const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/stats', verificarToken, getStats);

module.exports = router;