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

app.get('/health', (req, res) => res.json({ ok: true }));
app.use(express.static(path.join(__dirname, '../../SISTEMA-FRONTED')));

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});