const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos WHERE activo = TRUE ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock_actual, categoria_id, etiquetas } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock_actual, categoria_id, etiquetas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion, precio, stock_actual, categoria_id, etiquetas]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params; 
    try {
        await pool.query('UPDATE productos SET activo = FALSE WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto eliminado correctamente (oculto del sistema)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};
    
const actualizarPrecio = async (req, res) => {
    const { id } = req.params;
    const { nuevo_precio } = req.body;

    try {
        const result = await pool.query(
            'UPDATE productos SET precio = $1 WHERE id = $2 RETURNING *',
            [nuevo_precio, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ 
            mensaje: 'Precio actualizado con éxito', 
            producto: result.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el precio' });
    }

};

module.exports = { obtenerProductos, crearProducto, eliminarProducto, actualizarPrecio };