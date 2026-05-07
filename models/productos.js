const db = require('../config/db');

class Producto {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM productos');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM productos WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    let id = data.id;
    if (!id) {
      const [[{ nextId }]] = await db.execute('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM productos');
      id = nextId;
    }
    const sql = `
      INSERT INTO productos
        (id, proveedor_id, categoria, codigo_barras, nombre, descripcion,
         marca, unidad_medida, costo, precio, stock, stock_minimo, fecha_caducidad, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      id,
      data.proveedor_id    || 1,
      data.categoria       || '',
      data.codigo_barras   || '',
      data.nombre          || '',
      data.descripcion     || '',
      data.marca           || '',
      data.unidad_medida   || 'Pieza',
      data.costo           || 0,
      data.precio          || 0,
      data.stock           || 0,
      data.stock_minimo    || 5,
      data.fecha_caducidad || null, // null is ok since fecha_caducidad CAN BE NULL in db
      data.activo          ?? 1
    ];
    await db.execute(sql, values);
    return { insertId: id };
  }

  static async update(id, data) {
    const sql = `
      UPDATE productos
      SET proveedor_id=?, categoria=?, codigo_barras=?, nombre=?, descripcion=?,
          marca=?, unidad_medida=?, costo=?, precio=?, stock=?, stock_minimo=?,
          fecha_caducidad=?, activo=?
      WHERE id=?
    `;
    const values = [
      data.proveedor_id    || null,
      data.categoria       || null,
      data.codigo_barras   || null,
      data.nombre          || null,
      data.descripcion     || null,
      data.marca           || null,
      data.unidad_medida   || null,
      data.costo           ?? null,
      data.precio          ?? null,
      data.stock           ?? null,
      data.stock_minimo    ?? null,
      data.fecha_caducidad || null,
      data.activo          ?? null,
      id
    ];
    await db.execute(sql, values);
  }

  static async delete(id) {
    await db.execute('DELETE FROM productos WHERE id = ?', [id]);
  }
}

module.exports = Producto;