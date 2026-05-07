const Cliente = require('../models/clientes');
const { resequenceAfterDelete } = require('../config/resequence');

exports.getAll = async (req, res) => {
  try {
    res.json(await Cliente.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const cliente = await Cliente.getById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Cliente.create(req.body);
    res.status(201).json({ message: 'Cliente creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Cliente.update(req.params.id, req.body);
    res.json({ message: 'Cliente actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await Cliente.delete(id);
    await resequenceAfterDelete('clientes', id);
    res.json({ message: 'Cliente eliminado y IDs reordenados' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};