const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM usuarios WHERE email = $1 AND activo = true';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'El correo electrónico no está registrado o el usuario está inactivo' });
        }

        const usuario = result.rows[0];

        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordValido) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const payload = {
            id: usuario.id,
            nombre_completo: usuario.nombre_completo,
            rol: usuario.rol,
            genero: usuario.genero || 'M' 
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({
            mensaje: '¡Bienvenido al sistema!',
            token: token,
            user: payload
        });

    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ error: 'Error interno del servidor al intentar iniciar sesión' });
    }
};

module.exports = { login };