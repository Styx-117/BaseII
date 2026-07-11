const pool = require('../config/db');

const obtenerCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

const crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
            [nombre, descripcion]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El nombre de esta categoría ya está en uso' });
        }
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

module.exports = { obtenerCategorias, crearCategoria };