//authMiddleware.js
const jwt = require('jsonwebtoken');

const pool = require('../config/db');

const verificarToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado: No se proporcionó un token de seguridad' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({error: 'Token inválido o expirado. Vuelve a iniciar sesión.'});
    }
    const result = await pool.query('SELECT rol FROM usuarios WHERE id=$1 AND activo', [decoded.id]);
    if (!result.rowCount) return res.status(401).json({error: 'La cuenta está inactiva.'});
    req.user = { ...decoded, rol: result.rows[0].rol };
    pool.actor.run(decoded.id, next);
};

const verificarAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== 'ADMIN') {
        return res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de Administrador para realizar esta acción' });
    }
    next(); 
};

module.exports = { verificarToken, verificarAdmin };