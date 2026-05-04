const Empleado = require('../models/empleados');
exports.getAll = async (req, res) => { try { res.json(await Empleado.getAll()); } catch (error) { res.status(500).json({ message: error.message }); } };
exports.getById = async (req, res) => { try { res.json(await Empleado.getById(req.params.id)); } catch (error) { res.status(500).json({ message: error.message }); } };
exports.create = async (req, res) => { try { await Empleado.create(req.body); res.status(201).json({ message: 'Creado' }); } catch (error) { res.status(500).json({ message: error.message }); } };
exports.update = async (req, res) => { try { await Empleado.update(req.params.id, req.body); res.json({ message: 'Actualizado' }); } catch (error) { res.status(500).json({ message: error.message }); } };
exports.delete = async (req, res) => { try { await Empleado.delete(req.params.id); res.json({ message: 'Eliminado' }); } catch (error) { res.status(500).json({ message: error.message }); } };