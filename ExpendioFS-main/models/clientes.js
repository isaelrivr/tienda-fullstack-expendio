const db = require('../config/db');
class clientes {
  static async getAll() { const [rows] = await db.execute('SELECT * FROM clientes'); return rows; }
  static async getById(id) { const [rows] = await db.execute('SELECT * FROM clientes WHERE id = ?', [id]); return rows[0]; }
  static async create(data) {
    const formattedData = [data.id || null, data.nombre || null, data.apellido_paterno || null, data.apellido_materno || null, data.telefono || null, data.email || null, data.calle || null, data.numero || null, data.colonia || null, data.ciudad || null, data.fecha_registro || null, data.puntos || null];
    const sql = 'INSERT INTO clientes (id, nombre, apellido_paterno, apellido_materno, telefono, email, calle, numero, colonia, ciudad, fecha_registro, puntos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.execute(sql, formattedData);
    return result;
  }
  static async update(id, data) {
    const formattedData = [data.nombre || null, data.apellido_paterno || null, data.apellido_materno || null, data.telefono || null, data.email || null, data.calle || null, data.numero || null, data.colonia || null, data.ciudad || null, data.fecha_registro || null, data.puntos || null, id];
    const sql = 'UPDATE clientes SET nombre=?, apellido_paterno=?, apellido_materno=?, telefono=?, email=?, calle=?, numero=?, colonia=?, ciudad=?, fecha_registro=?, puntos=? WHERE id=?';
    await db.execute(sql, formattedData);
  }
  static async delete(id) { await db.execute('DELETE FROM clientes WHERE id = ?', [id]); }
}
module.exports = clientes;