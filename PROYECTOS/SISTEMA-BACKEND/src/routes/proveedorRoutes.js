const express = require('express');
const router = express.Router();
const { obtenerProveedores, crearProveedor, actualizarProveedor, cambiarEstadoProveedor } = require('../controllers/proveedorController');
const { verificarToken } = require('../middleware/authMiddleware');

const verificarLogistica = (req, res, next) => {
    if (req.user.rol !== 'ADMIN' && req.user.rol !== 'ALMACEN') {
        return res.status(403).json({ error: 'Acceso denegado: Exclusivo para Logística y Administración' });
    }
    next();
};

router.get('/', verificarToken, verificarLogistica, obtenerProveedores);
router.post('/', verificarToken, verificarLogistica, crearProveedor);
router.put('/:id', verificarToken, verificarLogistica, actualizarProveedor);
router.patch('/:id/estado', verificarToken, verificarLogistica, cambiarEstadoProveedor);

module.exports = router;