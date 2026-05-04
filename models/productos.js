const db = require('../config/db');
class productos {
  static async getAll() { const [rows] = await db.execute('SELECT * FROM productos'); return rows; }
  static async getById(id) { const [rows] = await db.execute('SELECT * FROM productos WHERE id = ?', [id]); return rows[0]; }
  static async create(data) {
    const formattedData = [data.id || null, data.proveedor_id || null, data.categoria || null, data.codigo_barras || null, data.nombre || null, data.descripcion || null, data.marca || null, data.unidad_medida || null, data.costo || null, data.precio || null, data.stock || null, data.stock_minimo || null, data.fecha_caducidad || null, data.activo || null];
    const sql = 'INSERT INTO productos (id, proveedor_id, categoria, codigo_barras, nombre, descripcion, marca, unidad_medida, costo, precio, stock, stock_minimo, fecha_caducidad, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.execute(sql, formattedData);
    return result;
  }
  static async update(id, data) {
    const formattedData = [data.proveedor_id || null, data.categoria || null, data.codigo_barras || null, data.nombre || null, data.descripcion || null, data.marca || null, data.unidad_medida || null, data.costo || null, data.precio || null, data.stock || null, data.stock_minimo || null, data.fecha_caducidad || null, data.activo || null, id];
    const sql = 'UPDATE productos SET proveedor_id=?, categoria=?, codigo_barras=?, nombre=?, descripcion=?, marca=?, unidad_medida=?, costo=?, precio=?, stock=?, stock_minimo=?, fecha_caducidad=?, activo=? WHERE id=?';
    await db.execute(sql, formattedData);
  }
  static async delete(id) { await db.execute('DELETE FROM productos WHERE id = ?', [id]); }
}
module.exports = productos;