const db = require('../config/db');

class Empleado {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM empleados');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM empleados WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    let id = data.id;
    if (!id) {
      const [[{ nextId }]] = await db.execute('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM empleados');
      id = nextId;
    }
    const sql = `
      INSERT INTO empleados
        (id, sucursal_id, nombre, apellido_paterno, apellido_materno, puesto,
         telefono, email, fecha_ingreso, salario, turno, estatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      id,
      data.sucursal_id     || 1,
      data.nombre          || '',
      data.apellido_paterno|| '',
      data.apellido_materno|| '',
      data.puesto          || '',
      data.telefono        || '',
      data.email           || '',
      data.fecha_ingreso   || new Date().toISOString().split('T')[0],
      data.salario         || 0,
      data.turno           || 'Matutino',
      data.estatus         || 'Activo'
    ];
    await db.execute(sql, values);
    return { insertId: id };
  }

  static async update(id, data) {
    const sql = `
      UPDATE empleados
      SET sucursal_id=?, nombre=?, apellido_paterno=?, apellido_materno=?,
          puesto=?, telefono=?, email=?, fecha_ingreso=?, salario=?, turno=?, estatus=?
      WHERE id=?
    `;
    const values = [
      data.sucursal_id      || null,
      data.nombre           || null,
      data.apellido_paterno || null,
      data.apellido_materno || null,
      data.puesto           || null,
      data.telefono         || null,
      data.email            || null,
      data.fecha_ingreso    || null,
      data.salario          ?? null,
      data.turno            || null,
      data.estatus          || null,
      id
    ];
    await db.execute(sql, values);
  }

  static async delete(id) {
    await db.execute('DELETE FROM empleados WHERE id = ?', [id]);
  }
}

module.exports = Empleado;