const db = require('../config/db');

class Ventas {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM ventas');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM ventas WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const sql = `
      INSERT INTO ventas
        (sucursal_id, empleado_id, cliente_id, folio, fecha_venta, metodo_pago, subtotal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.sucursal_id  || null,
      data.empleado_id  || null,
      data.cliente_id   || null,
      data.folio        || null,
      data.fecha_venta  || new Date().toISOString().split('T')[0],
      data.metodo_pago  || 'Efectivo',
      data.subtotal     || 0
    ];
    const [result] = await db.execute(sql, values);
    return result;
  }

  static async update(id, data) {
    const sql = `
      UPDATE ventas
      SET sucursal_id=?, empleado_id=?, cliente_id=?,
          folio=?, fecha_venta=?, metodo_pago=?, subtotal=?
      WHERE id=?
    `;
    const values = [
      data.sucursal_id  || null,
      data.empleado_id  || null,
      data.cliente_id   || null,
      data.folio        || null,
      data.fecha_venta  || null,
      data.metodo_pago  || null,
      data.subtotal     || null,
      id
    ];
    await db.execute(sql, values);
  }

  static async delete(id) {
    await db.execute('DELETE FROM ventas WHERE id = ?', [id]);
  }
}

module.exports = Ventas;