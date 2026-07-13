// usuarioController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Obtener usuarios con su URL de imagen (si existe)
const obtenerUsuarios = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.nombre_completo, u.email, u.rol, u.genero, u.activo, i.url AS imagen_url
            FROM usuarios u
            LEFT JOIN imagenes i ON u.imagen_id = i.id
            ORDER BY u.id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// Crear usuario con imagen (opcional)
const crearUsuario = async (req, res) => {
    const { nombre_completo, email, password, rol, genero } = req.body;
    let imagen_id = null;

    try {
        // Si se subió un archivo, guardar en tabla imagenes
        if (req.file) {
            const result = await pool.query(
                'INSERT INTO imagenes (url, public_id) VALUES ($1, $2) RETURNING id',
                [req.file.path, req.file.filename]
            );
            imagen_id = result.rows[0].id;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO usuarios (nombre_completo, email, password_hash, rol, genero, imagen_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nombre_completo, email, rol, genero, activo
        `;
        const values = [nombre_completo, email, passwordHash, rol, genero, imagen_id];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico' });
        }
        res.status(500).json({ error: 'Error interno al crear usuario' });
    }
};

// Actualizar usuario (incluyendo imagen)
const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, email, password, rol, genero } = req.body;
    let imagen_id = null;

    try {
        // Si se subió una nueva imagen, guardar en tabla imagenes
        if (req.file) {
            const result = await pool.query(
                'INSERT INTO imagenes (url, public_id) VALUES ($1, $2) RETURNING id',
                [req.file.path, req.file.filename]
            );
            imagen_id = result.rows[0].id;
        }

        // Construir consulta dinámica
        let query, values;

        // Caso 1: Se actualiza también la contraseña
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            query = `
                UPDATE usuarios 
                SET nombre_completo = $1, email = $2, rol = $3, genero = $4, 
                    password_hash = $5${imagen_id ? ', imagen_id = $6' : ''}
                WHERE id = $${imagen_id ? 7 : 6}
                RETURNING id, nombre_completo, email, rol, genero, activo
            `;
            values = imagen_id
                ? [nombre_completo, email, rol, genero, passwordHash, imagen_id, id]
                : [nombre_completo, email, rol, genero, passwordHash, id];
        } else {
            // Caso 2: No se actualiza contraseña
            query = `
                UPDATE usuarios 
                SET nombre_completo = $1, email = $2, rol = $3, genero = $4${imagen_id ? ', imagen_id = $5' : ''}
                WHERE id = $${imagen_id ? 6 : 5}
                RETURNING id, nombre_completo, email, rol, genero, activo
            `;
            values = imagen_id
                ? [nombre_completo, email, rol, genero, imagen_id, id]
                : [nombre_completo, email, rol, genero, id];
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

// Cambiar estado del usuario (activo/inactivo)
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

const actualizarMiPerfil = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, email, password } = req.body;

    if (req.user.id !== parseInt(id) && req.user.rol !== 'ADMIN') {
        return res.status(403).json({ error: 'Acceso denegado: Solo puedes editar tu propio perfil.' });
    }

    try {
        let query, values;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            
            query = `
                UPDATE usuarios 
                SET nombre_completo = $1, email = $2, password_hash = $3 
                WHERE id = $4 RETURNING id, nombre_completo, email, rol
            `;
            values = [nombre_completo, email, password_hash, id];
        } else {
            query = `
                UPDATE usuarios 
                SET nombre_completo = $1, email = $2 
                WHERE id = $3 RETURNING id, nombre_completo, email, rol
            `;
            values = [nombre_completo, email, id];
        }

        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ 
            mensaje: 'Perfil actualizado con éxito', 
            usuario: result.rows[0] 
        });

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Este correo electrónico ya está en uso por otra persona.' });
        }
        res.status(500).json({ error: 'Error interno al actualizar el perfil' });
    }
};

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarEstadoUsuario,
    actualizarMiPerfil
};