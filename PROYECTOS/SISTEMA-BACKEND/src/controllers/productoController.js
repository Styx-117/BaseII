// productoController.js
const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
    try {
        // Ahora al hacer SELECT *, también traerá la nueva columna imagen_url
        const result = await pool.query('SELECT * FROM productos WHERE activo = TRUE ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock_actual, categoria_id, etiquetas } = req.body;
    
    // Capturamos la URL de Cloudinary si se subió un archivo
    const imagen_url = req.file ? req.file.path : null;

    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, imagen_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, imagen_url]
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
    } // <-- Faltaba cerrar esta llave del catch
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock_actual, categoria_id, etiquetas } = req.body;
    
    const imagen_url = req.file ? req.file.path : null;

    try {
        let result;
        
        if (imagen_url) {
            // Si el usuario subió una NUEVA imagen, actualizamos también la imagen_url
            result = await pool.query(
                'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock_actual = $4, categoria_id = $5, etiquetas = $6, imagen_url = $7 WHERE id = $8 RETURNING *',
                [nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, imagen_url, id]
            );
        } else {
            // Si no subió imagen, mantenemos la que ya tenía y actualizamos solo el texto
            result = await pool.query(
                'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock_actual = $4, categoria_id = $5, etiquetas = $6 WHERE id = $7 RETURNING *',
                [nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, id]
            );
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ 
            mensaje: 'Producto actualizado con éxito',
            producto: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};



module.exports = { obtenerProductos, crearProducto, eliminarProducto, actualizarPrecio, actualizarProducto };