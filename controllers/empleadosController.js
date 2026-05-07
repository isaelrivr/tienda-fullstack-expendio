const Empleado = require('../models/empleados');
const { resequenceAfterDelete } = require('../config/resequence');

exports.getAll = async (req, res) => {
  try {
    res.json(await Empleado.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const empleado = await Empleado.getById(req.params.id);
    if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Empleado.create(req.body);
    res.status(201).json({ message: 'Empleado creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Empleado.update(req.params.id, req.body);
    res.json({ message: 'Empleado actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await Empleado.delete(id);
    await resequenceAfterDelete('empleados', id);
    res.json({ message: 'Empleado eliminado y IDs reordenados' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};