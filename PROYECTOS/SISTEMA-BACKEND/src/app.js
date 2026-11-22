//app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const { verificarToken, verificarAdmin } = require('./middleware/authMiddleware'); 

const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/productos', verificarToken, require('./routes/productoRoutes'));
app.use('/api/ventas', require('./routes/ventaRoutes'));
app.use('/api/categorias', verificarToken, require('./routes/categoriaRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/kardex', require('./routes/kardexRoutes'));
app.use('/api/auditoria', verificarToken, verificarAdmin, require('./routes/auditoriaRoutes'));
app.use('/api/proveedores', require('./routes/proveedorRoutes'));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

const pool = require('./config/db');
app.get('/health', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    await pool.query('SELECT 1 FROM usuarios LIMIT 1');
    res.json({ok: true, database: 'connected'});
  } catch {
    res.status(503).json({ok: false, database: 'unavailable'});
  }
});
// Cuando Express sirve la interfaz, las peticiones pertenecen a esta misma instancia.
app.get('/js/api-base.js', (req, res) => {
  res.type('application/javascript').send("export const apiBase = '/api';");
});
app.use(express.static(path.join(__dirname, '../../SISTEMA-FRONTED')));

require('./migrate')().then(() => app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
 })).catch(async error => {
  console.error('No se pudo preparar PostgreSQL:', error.message);
  await pool.end();
  process.exitCode = 1;
});
