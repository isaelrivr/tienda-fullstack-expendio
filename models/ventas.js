const db = require('../config/db');

class Venta {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM ventas');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM ventas WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    let id = data.id;
    if (!id) {
      const [[{ nextId }]] = await db.execute('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM ventas');
      id = nextId;
    }
    const sql = `
      INSERT INTO ventas
        (id, sucursal_id, empleado_id, cliente_id, folio, fecha_venta, metodo_pago, subtotal, descuento, impuesto, total, estatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const subtotal = Number(data.subtotal) || 0;
    const descuento = Number(data.descuento) || 0;
    const impuesto = Number(data.impuesto) || 0;
    const total = data.total || (subtotal + impuesto - descuento);
    
    const values = [
      id,
      data.sucursal_id  || 1,
      data.empleado_id  || 1,
      data.cliente_id   || 1,
      data.folio        || 'EXP-00000',
      data.fecha_venta  || new Date().toISOString().split('T')[0],
      data.metodo_pago  || 'Efectivo',
      subtotal,
      descuento,
      impuesto,
      total,
      data.estatus || 'Pagada'
    ];
    await db.execute(sql, values);

    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const [[{ nextDetId }]] = await db.execute('SELECT COALESCE(MAX(id), 0) + 1 AS nextDetId FROM detalle_venta');
        const sqlDet = `
          INSERT INTO detalle_venta
            (id, venta_id, producto_id, cantidad, precio_unitario, descuento, impuesto, subtotal, observaciones, entregado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const itemSubtotal = (item.precio || 0) * (item.cantidad || 0);
        const detValues = [
          nextDetId,
          id,
          item.id,
          item.cantidad || 1,
          item.precio || 0,
          0, // descuento
          0, // impuesto
          itemSubtotal,
          '', // observaciones
          1 // entregado
        ];
        await db.execute(sqlDet, detValues);
      }
    }

    return { insertId: id };
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

module.exports = Venta;