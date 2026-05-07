const Producto = require('../models/productos');
const { resequenceAfterDelete } = require('../config/resequence');

exports.getAll = async (req, res) => {
  try {
    res.json(await Producto.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const producto = await Producto.getById(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Producto.create(req.body);
    res.status(201).json({ message: 'Producto creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Producto.update(req.params.id, req.body);
    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await Producto.delete(id);
    await resequenceAfterDelete('productos', id);
    res.json({ message: 'Producto eliminado y IDs reordenados' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};