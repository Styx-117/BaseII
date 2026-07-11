const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado: No se proporcionó un token de seguridad' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded; 
        
        next(); 
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado. Vuelve a iniciar sesión.' });
    }
};

const verificarAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== 'ADMIN') {
        return res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de Administrador para realizar esta acción' });
    }
    next(); 
};

module.exports = { verificarToken, verificarAdmin };