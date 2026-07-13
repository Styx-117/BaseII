const pool = require('../config/db');

const obtenerProveedores = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM proveedores ORDER BY id_proveedor DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener proveedores:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const crearProveedor = async (req, res) => {
    const { ruc, razon_social, nombre_comercial, telefono, correo, direccion, ciudad } = req.body;
    try {
        const query = `
            INSERT INTO proveedores (ruc, razon_social, nombre_comercial, telefono, correo, direccion, ciudad) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const result = await pool.query(query, [ruc, razon_social, nombre_comercial, telefono, correo, direccion, ciudad]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear proveedor:", error);
        if (error.code === '23505') { 
            return res.status(400).json({ error: 'Ya existe un proveedor registrado con este RUC o Correo' });
        }
        res.status(500).json({ error: 'Error al registrar el proveedor' });
    }
};

const actualizarProveedor = async (req, res) => {
    const { id } = req.params;
    const { ruc, razon_social, nombre_comercial, telefono, correo, direccion, ciudad } = req.body;
    try {
        const query = `
            UPDATE proveedores 
            SET ruc = $1, razon_social = $2, nombre_comercial = $3, telefono = $4, correo = $5, direccion = $6, ciudad = $7 
            WHERE id_proveedor = $8 RETURNING *
        `;
        const result = await pool.query(query, [ruc, razon_social, nombre_comercial, telefono, correo, direccion, ciudad, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar proveedor:", error);
        res.status(500).json({ error: 'Error al actualizar datos del proveedor' });
    }
};

const cambiarEstadoProveedor = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; 
    try {
        await pool.query('UPDATE proveedores SET estado = $1 WHERE id_proveedor = $2', [estado, id]);
        res.json({ mensaje: `Proveedor ${estado ? 'activado' : 'desactivado'} correctamente` });
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({ error: 'Error al modificar el estado' });
    }
};

module.exports = { obtenerProveedores, crearProveedor, actualizarProveedor, cambiarEstadoProveedor };