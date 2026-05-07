const Sucursal = require('../models/sucursales');
const { resequenceAfterDelete } = require('../config/resequence');

exports.getAll = async (req, res) => {
  try {
    res.json(await Sucursal.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const sucursal = await Sucursal.getById(req.params.id);
    if (!sucursal) return res.status(404).json({ message: 'Sucursal no encontrada' });
    res.json(sucursal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Sucursal.create(req.body);
    res.status(201).json({ message: 'Sucursal creada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Sucursal.update(req.params.id, req.body);
    res.json({ message: 'Sucursal actualizada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await Sucursal.delete(id);
    await resequenceAfterDelete('sucursales', id);
    res.json({ message: 'Sucursal eliminada y IDs reordenados' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};