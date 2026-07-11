const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { subirImagen, obtenerImagenes } = require('../controllers/imagenController');

router.post('/', upload.single('archivoImagen'), subirImagen);
router.get('/', obtenerImagenes);

module.exports = router;