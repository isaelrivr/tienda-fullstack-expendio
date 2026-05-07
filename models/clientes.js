const db = require('../config/db');

class Cliente {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM clientes');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM clientes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    let id = data.id;
    if (!id) {
      const [[{ nextId }]] = await db.execute('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM clientes');
      id = nextId;
    }
    const sql = `
      INSERT INTO clientes
        (id, nombre, apellido_paterno, apellido_materno, telefono, email,
         calle, numero, colonia, ciudad, fecha_registro, puntos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      id,
      data.nombre          || '',
      data.apellido_paterno|| '',
      data.apellido_materno|| '',
      data.telefono        || '',
      data.email           || '',
      data.calle           || '',
      data.numero          || '',
      data.colonia         || '',
      data.ciudad          || '',
      data.fecha_registro  || new Date().toISOString().split('T')[0],
      data.puntos          ?? 0
    ];
    await db.execute(sql, values);
    return { insertId: id };
  }

  static async update(id, data) {
    const sql = `
      UPDATE clientes
      SET nombre=?, apellido_paterno=?, apellido_materno=?, telefono=?, email=?,
          calle=?, numero=?, colonia=?, ciudad=?, fecha_registro=?, puntos=?
      WHERE id=?
    `;
    const values = [
      data.nombre          || null,
      data.apellido_paterno|| null,
      data.apellido_materno|| null,
      data.telefono        || null,
      data.email           || null,
      data.calle           || null,
      data.numero          || null,
      data.colonia         || null,
      data.ciudad          || null,
      data.fecha_registro  || null,
      data.puntos          ?? null,
      id
    ];
    await db.execute(sql, values);
  }

  static async delete(id) {
    await db.execute('DELETE FROM clientes WHERE id = ?', [id]);
  }
}

module.exports = Cliente;