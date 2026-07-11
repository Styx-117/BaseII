const pool = require('../config/db');

const subirImagen = async (req, res) => {
    try {
        // multer dejará el archivo en req.file
        if (!req.file) {
            return res.status(400).json({ error: 'No se envió ninguna imagen' });
        }

        const nombre = req.file.originalname;
        const tipo_mime = req.file.mimetype;
        const datos = req.file.buffer; // El archivo en binario

        const query = `
            INSERT INTO imagenes (nombre, tipo_mime, datos) 
            VALUES ($1, $2, $3) 
            RETURNING id, nombre, tipo_mime
        `;
        
        const result = await pool.query(query, [nombre, tipo_mime, datos]);
        res.status(201).json({ mensaje: 'Imagen subida con éxito', imagen: result.rows[0] });

    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ error: 'Error interno al guardar la imagen' });
    }
};

const obtenerImagenes = async (req, res) => {
    try {
        const query = 'SELECT id, nombre, tipo_mime, datos FROM imagenes ORDER BY fecha_subida DESC';
        const result = await pool.query(query);

        const imagenes = result.rows.map(img => {
            const base64Img = Buffer.from(img.datos).toString('base64');
            return {
                id: img.id,
                nombre: img.nombre,
                src: `data:${img.tipo_mime};base64,${base64Img}` 
            };
        });

        res.json(imagenes);
    } catch (error) {
        console.error('Error al obtener imágenes:', error);
        res.status(500).json({ error: 'Error al recuperar las imágenes' });
    }
};

module.exports = { subirImagen, obtenerImagenes };