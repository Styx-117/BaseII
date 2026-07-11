//clienteController.js
const pool = require('../config/db');

const obtenerClientes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

const crearCliente = async (req, res) => {
    const { nombre, documento, email, telefonos_secundarios = [] } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clientes (nombre, documento, email, telefonos_secundarios) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, documento, email, telefonos_secundarios]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Ya existe un cliente con ese documento' });
        }
        res.status(500).json({ error: 'Error al crear cliente' });
    }
};

const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, documento, email, telefonos_secundarios = [] } = req.body;
    try {
        const result = await pool.query(
            'UPDATE clientes SET nombre = $1, documento = $2, email = $3, telefonos_secundarios = $4 WHERE id = $5 RETURNING *',
            [nombre, documento, email, telefonos_secundarios, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El documento ingresado ya pertenece a otro cliente' });
        }
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
};

const cambiarEstadoCliente = async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body; 
    try {
        await pool.query('UPDATE clientes SET activo = $1 WHERE id = $2', [activo, id]);
        res.json({ mensaje: `Cliente ${activo ? 'activado' : 'desactivado'} correctamente` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cambiar el estado del cliente' });
    }
};

module.exports = { obtenerClientes, crearCliente, actualizarCliente, cambiarEstadoCliente };