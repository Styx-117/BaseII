const multer = require('multer');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const parse = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, ['image/jpeg','image/png','image/gif','image/webp'].includes(file.mimetype)) }).single('imagen');
module.exports = { single: () => (req, res, next) => parse(req, res, err => {
  if (err) return res.status(400).json({error: 'No se pudo procesar la imagen (máximo 5 MB).'});
  if (!req.file) return next();
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return res.status(400).json({error: 'Configura Cloudinary para subir imágenes.'});
  const stream = cloudinary.uploader.upload_stream({folder:'icamarket', resource_type:'image'}, (error, result) => {
    if (error) return res.status(502).json({error:'No se pudo subir la imagen.'});
    req.file.path = result.secure_url; req.file.filename = result.public_id; next();
  });
  stream.end(req.file.buffer);
}) };
