const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

/**
 * GET /api/next-id/:tabla
 * Devuelve el siguiente ID numérico disponible para una tabla.
 * Útil para pre-rellenar el campo ID en los formularios del frontend.
 */
router.get('/next-id/:tabla', async (req, res) => {
  const tablasPermitidas = ['clientes','empleados','productos','proveedores','sucursales','ventas'];
  const tabla = req.params.tabla;

  if (!tablasPermitidas.includes(tabla)) {
    return res.status(400).json({ message: 'Tabla no permitida' });
  }

  try {
    const [rows] = await db.execute(`SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM \`${tabla}\``);
    res.json({ nextId: rows[0].nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/stats
 * Devuelve conteos generales para el dashboard de administración.
 */
router.get('/stats', async (req, res) => {
  try {
    const [sucursales]  = await db.execute('SELECT COUNT(*) as c FROM sucursales');
    const [empleados]   = await db.execute('SELECT COUNT(*) as c FROM empleados');
    const [clientes]    = await db.execute('SELECT COUNT(*) as c FROM clientes');
    const [proveedores] = await db.execute('SELECT COUNT(*) as c FROM proveedores');
    const [productos]   = await db.execute('SELECT COUNT(*) as c FROM productos');
    const [ventas]      = await db.execute('SELECT COUNT(*) as c FROM ventas');
    const [totalVentas] = await db.execute('SELECT COALESCE(SUM(subtotal), 0) as s FROM ventas');

    res.json({
      sucursales:  sucursales[0].c,
      empleados:   empleados[0].c,
      clientes:    clientes[0].c,
      proveedores: proveedores[0].c,
      productos:   productos[0].c,
      ventas:      ventas[0].c,
      totalVentas: totalVentas[0].s
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
