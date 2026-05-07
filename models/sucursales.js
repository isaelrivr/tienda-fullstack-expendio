const db = require('../config/db');

class Sucursal {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM sucursales');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM sucursales WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    let id = data.id;
    if (!id) {
      const [[{ nextId }]] = await db.execute('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM sucursales');
      id = nextId;
    }
    const sql = `
      INSERT INTO sucursales
        (id, nombre, telefono, email, calle, numero, colonia,
         ciudad, estado, codigo_postal, fecha_apertura, activa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      id,
      data.nombre         || '',
      data.telefono       || '',
      data.email          || '',
      data.calle          || '',
      data.numero         || '',
      data.colonia        || '',
      data.ciudad         || '',
      data.estado         || '',
      data.codigo_postal  || '',
      data.fecha_apertura || new Date().toISOString().split('T')[0],
      data.activa         ?? 1
    ];
    await db.execute(sql, values);
    return { insertId: id };
  }

  static async update(id, data) {
    const sql = `
      UPDATE sucursales
      SET nombre=?, telefono=?, email=?, calle=?, numero=?, colonia=?,
          ciudad=?, estado=?, codigo_postal=?, fecha_apertura=?, activa=?
      WHERE id=?
    `;
    const values = [
      data.nombre         || null,
      data.telefono       || null,
      data.email          || null,
      data.calle          || null,
      data.numero         || null,
      data.colonia        || null,
      data.ciudad         || null,
      data.estado         || null,
      data.codigo_postal  || null,
      data.fecha_apertura || null,
      data.activa         ?? null,
      id
    ];
    await db.execute(sql, values);
  }

  static async delete(id) {
    await db.execute('DELETE FROM sucursales WHERE id = ?', [id]);
  }
}

module.exports = Sucursal;