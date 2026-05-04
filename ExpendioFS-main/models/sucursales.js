const db = require('../config/db');
class sucursales {
  static async getAll() { const [rows] = await db.execute('SELECT * FROM sucursales'); return rows; }
  static async getById(id) { const [rows] = await db.execute('SELECT * FROM sucursales WHERE id = ?', [id]); return rows[0]; }
  static async create(data) {
    const formattedData = [data.id || null, data.nombre || null, data.telefono || null, data.email || null, data.calle || null, data.numero || null, data.colonia || null, data.ciudad || null, data.estado || null, data.codigo_postal || null, data.fecha_apertura || null, data.activa || null];
    const sql = 'INSERT INTO sucursales (id, nombre, telefono, email, calle, numero, colonia, ciudad, estado, codigo_postal, fecha_apertura, activa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.execute(sql, formattedData);
    return result;
  }
  static async update(id, data) {
    const formattedData = [data.nombre || null, data.telefono || null, data.email || null, data.calle || null, data.numero || null, data.colonia || null, data.ciudad || null, data.estado || null, data.codigo_postal || null, data.fecha_apertura || null, data.activa || null, id];
    const sql = 'UPDATE sucursales SET nombre=?, telefono=?, email=?, calle=?, numero=?, colonia=?, ciudad=?, estado=?, codigo_postal=?, fecha_apertura=?, activa=? WHERE id=?';
    await db.execute(sql, formattedData);
  }
  static async delete(id) { await db.execute('DELETE FROM sucursales WHERE id = ?', [id]); }
}
module.exports = sucursales;