require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Archivos estáticos de cada sección
app.use('/admin',  express.static(path.join(__dirname, 'public/admin')));
app.use('/tienda', express.static(path.join(__dirname, 'public/tienda')));
app.use('/css',    express.static(path.join(__dirname, 'public/css')));

// Ruta raíz → redirige al admin
app.get('/', (req, res) => {
  res.redirect('/admin/index.html');
});

// Rutas de la API (admin)
app.use('/api/clientes',    require('./routes/clientesRoutes'));
app.use('/api/sucursales',  require('./routes/sucursalesRoutes'));
app.use('/api/empleados',   require('./routes/empleadosRoutes'));
app.use('/api/proveedores', require('./routes/proveedoresRoutes'));
app.use('/api/productos',   require('./routes/productosRoutes'));
app.use('/api/ventas',      require('./routes/ventasRoutes'));

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Ruta no encontrada' });
  }
  next();
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Admin  → http://localhost:${PORT}/admin/index.html`);
  console.log(`   Tienda → http://localhost:${PORT}/tienda/index.html`);
});