// productoController.js
const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
    const { categoria_id, proveedor_id } = req.query;

    try {
        let query = `
            SELECT 
                p.*, 
                c.nombre AS categoria_nombre, 
                pr.nombre_comercial AS proveedor_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
            WHERE p.activo = TRUE
        `;
        
        const values = [];
        let counter = 1;

        if (categoria_id) {
            query += ` AND p.categoria_id = $${counter}`;
            values.push(categoria_id);
            counter++;
        }

        if (proveedor_id) {
            query += ` AND p.id_proveedor = $${counter}`;
            values.push(proveedor_id);
            counter++;
        }

        query += ` ORDER BY p.id ASC`;

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, id_proveedor } = req.body;
    const imagen_url = req.file ? req.file.path : null;

    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, imagen_url, id_proveedor) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, imagen_url, id_proveedor || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params; 
    try {
        await pool.query('UPDATE productos SET activo = FALSE WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto eliminado correctamente (oculto del sistema)' });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
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
        console.error("Error al actualizar precio:", error);
        res.status(500).json({ error: 'Error al actualizar el precio' });
    }
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, id_proveedor } = req.body;
    
    const imagen_url = req.file ? req.file.path : null;

    try {
        let result;
        
        if (imagen_url) {
            result = await pool.query(
                'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock_actual = $4, categoria_id = $5, etiquetas = $6, imagen_url = $7, id_proveedor = $8 WHERE id = $9 RETURNING *',
                [nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, imagen_url, id_proveedor || null, id]
            );
        } else {
            result = await pool.query(
                'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock_actual = $4, categoria_id = $5, etiquetas = $6, id_proveedor = $7 WHERE id = $8 RETURNING *',
                [nombre, descripcion, precio, stock_actual, categoria_id, etiquetas, id_proveedor || null, id]
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
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

module.exports = { obtenerProductos, crearProducto, eliminarProducto, actualizarPrecio, actualizarProducto };