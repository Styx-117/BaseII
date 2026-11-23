const cloudinary = require('cloudinary').v2;

// El SDK también admite la URL de conexión estándar de Cloudinary.
const opciones = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};
if (Object.values(opciones).every(Boolean)) cloudinary.config(opciones);

function configurado() {
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    return Boolean(cloud_name && api_key && api_secret);
}

module.exports = { cloudinary, configurado };
