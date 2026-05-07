const Proveedor = require('../models/proveedores');
const { resequenceAfterDelete } = require('../config/resequence');

exports.getAll = async (req, res) => {
  try {
    res.json(await Proveedor.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const proveedor = await Proveedor.getById(req.params.id);
    if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Proveedor.create(req.body);
    res.status(201).json({ message: 'Proveedor creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Proveedor.update(req.params.id, req.body);
    res.json({ message: 'Proveedor actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await Proveedor.delete(id);
    await resequenceAfterDelete('proveedores', id);
    res.json({ message: 'Proveedor eliminado y IDs reordenados' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};