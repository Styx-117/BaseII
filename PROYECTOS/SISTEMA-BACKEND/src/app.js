//app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/ventas', require('./routes/ventaRoutes'));
app.use('/api/categorias', require('./routes/categoriaRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/kardex', require('./routes/kardexRoutes'));
app.use('/api/auditoria', require('./routes/auditoriaRoutes'));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Ventas e Inventario corriendo correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});