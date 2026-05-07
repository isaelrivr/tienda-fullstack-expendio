const db = require('../config/db');

class Proveedor {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM proveedores');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM proveedores WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    let id = data.id;
    if (!id) {
      const [[{ nextId }]] = await db.execute('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM proveedores');
      id = nextId;
    }
    const sql = `
      INSERT INTO proveedores
        (id, nombre_comercial, contacto_nombre, telefono, email,
         calle, numero, colonia, ciudad, rfc, dias_credito, estatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      id,
      data.nombre_comercial|| '',
      data.contacto_nombre || '',
      data.telefono        || '',
      data.email           || '',
      data.calle           || '',
      data.numero          || '',
      data.colonia         || '',
      data.ciudad          || '',
      data.rfc             || '',
      data.dias_credito    ?? 30,
      data.estatus         || 'Activo'
    ];
    await db.execute(sql, values);
    return { insertId: id };
  }

  static async update(id, data) {
    const sql = `
      UPDATE proveedores
      SET nombre_comercial=?, contacto_nombre=?, telefono=?, email=?,
          calle=?, numero=?, colonia=?, ciudad=?, rfc=?, dias_credito=?, estatus=?
      WHERE id=?
    `;
    const values = [
      data.nombre_comercial || null,
      data.contacto_nombre  || null,
      data.telefono         || null,
      data.email            || null,
      data.calle            || null,
      data.numero           || null,
      data.colonia          || null,
      data.ciudad           || null,
      data.rfc              || null,
      data.dias_credito     ?? null,
      data.estatus          || null,
      id
    ];
    await db.execute(sql, values);
  }

  static async delete(id) {
    await db.execute('DELETE FROM proveedores WHERE id = ?', [id]);
  }
}

module.exports = Proveedor;