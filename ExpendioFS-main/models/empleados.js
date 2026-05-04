const db = require('../config/db');
class empleados {
  static async getAll() { const [rows] = await db.execute('SELECT * FROM empleados'); return rows; }
  static async getById(id) { const [rows] = await db.execute('SELECT * FROM empleados WHERE id = ?', [id]); return rows[0]; }
  static async create(data) {
    const formattedData = [data.id || null, data.sucursal_id || null, data.nombre || null, data.apellido_paterno || null, data.apellido_materno || null, data.puesto || null, data.telefono || null, data.email || null, data.fecha_ingreso || null, data.salario || null, data.turno || null, data.estatus || null];
    const sql = 'INSERT INTO empleados (id, sucursal_id, nombre, apellido_paterno, apellido_materno, puesto, telefono, email, fecha_ingreso, salario, turno, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.execute(sql, formattedData);
    return result;
  }
  static async update(id, data) {
    const formattedData = [data.sucursal_id || null, data.nombre || null, data.apellido_paterno || null, data.apellido_materno || null, data.puesto || null, data.telefono || null, data.email || null, data.fecha_ingreso || null, data.salario || null, data.turno || null, data.estatus || null, id];
    const sql = 'UPDATE empleados SET sucursal_id=?, nombre=?, apellido_paterno=?, apellido_materno=?, puesto=?, telefono=?, email=?, fecha_ingreso=?, salario=?, turno=?, estatus=? WHERE id=?';
    await db.execute(sql, formattedData);
  }
  static async delete(id) { await db.execute('DELETE FROM empleados WHERE id = ?', [id]); }
}
module.exports = empleados;