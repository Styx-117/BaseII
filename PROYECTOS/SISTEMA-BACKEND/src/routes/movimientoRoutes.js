const express = require('express');
const router = express.Router();
const { registrarMovimiento, obtenerHistorialMovimientos } = require('../controllers/movimientoController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const verificarLogistica = (req, res, next) => {
    if (req.user.rol !== 'ADMIN' && req.user.rol !== 'ALMACEN') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
};

router.get('/', verificarToken, verificarLogistica, obtenerHistorialMovimientos);
router.post('/', verificarToken, verificarLogistica, registrarMovimiento);

module.exports = router;