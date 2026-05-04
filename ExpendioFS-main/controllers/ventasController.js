const Venta = require('../models/ventas');

exports.getAll = async (req, res) => {
  try {
    res.json(await Venta.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const venta = await Venta.getById(req.params.id);
    if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Venta.create(req.body);
    res.status(201).json({ message: 'Venta registrada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Venta.update(req.params.id, req.body);
    res.json({ message: 'Venta actualizada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Venta.delete(req.params.id);
    res.json({ message: 'Venta eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};