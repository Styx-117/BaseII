const multer = require('multer');
const { cloudinary, configurado } = require('../config/cloudinary');
const parse = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, ['image/jpeg','image/png','image/gif','image/webp'].includes(file.mimetype)) }).single('imagen');
module.exports = { single: () => (req, res, next) => parse(req, res, err => {
  if (err) return res.status(400).json({error: 'No se pudo procesar la imagen (máximo 5 MB).'});
  if (!req.file) return next();
  if (!configurado()) return res.status(400).json({error: 'Configura Cloudinary para subir imágenes.'});
  const stream = cloudinary.uploader.upload_stream({folder:'icamarket', resource_type:'image'}, (error, result) => {
    if (error) return res.status(502).json({error:'No se pudo subir la imagen.'});
    req.file.path = result.secure_url; req.file.filename = result.public_id; next();
  });
  stream.end(req.file.buffer);
}) };
