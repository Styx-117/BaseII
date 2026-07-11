const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const obtenerUsuarios = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre_completo, email, rol, genero, activo FROM usuarios ORDER BY id DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

const crearUsuario = async (req, res) => {
    const { nombre_completo, email, password, rol, genero } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO usuarios (nombre_completo, email, password_hash, rol, genero) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre_completo, email, rol, genero, activo`,
            [nombre_completo, email, passwordHash, rol, genero]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === '23505') { 
            return res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico' });
        }
        res.status(500).json({ error: 'Error interno al crear usuario' });
    }
};

const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, email, password, rol, genero } = req.body;

    try {
        let query, values;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            query = `UPDATE usuarios SET nombre_completo = $1, email = $2, rol = $3, genero = $4, password_hash = $5 WHERE id = $6 RETURNING id, nombre_completo`;
            values = [nombre_completo, email, rol, genero, passwordHash, id];
        } else {
            query = `UPDATE usuarios SET nombre_completo = $1, email = $2, rol = $3, genero = $4 WHERE id = $5 RETURNING id, nombre_completo`;
            values = [nombre_completo, email, rol, genero, id];
        }

        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso por otro usuario' });
        }
        res.status(500).json({ error: 'Error interno al actualizar usuario' });
    }
};

const cambiarEstadoUsuario = async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body; 
    try {
        await pool.query('UPDATE usuarios SET activo = $1 WHERE id = $2', [activo, id]);
        res.json({ mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente` });
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({ error: 'Error al cambiar el estado del usuario' });
    }
};

module.exports = { obtenerUsuarios, crearUsuario, actualizarUsuario, cambiarEstadoUsuario };