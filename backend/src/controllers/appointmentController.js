const Appointment = require('../models/Appointment');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');

exports.list = asyncWrapper(async (req, res) => {
  const { from, to, type, status } = req.query;
  const query = { user: req.user._id };

  if (from || to) {
    query.startAt = {};
    if (from) query.startAt.$gte = new Date(from);
    if (to) query.startAt.$lte = new Date(to);
  }
  if (type) query.type = type;
  if (status) query.status = status;

  const appointments = await Appointment.find(query)
    .populate('client', 'firstName lastName phone')
    .populate('order', 'reference garmentType')
    .sort({ startAt: 1 });

  res.json({ success: true, data: appointments });
});

exports.create = asyncWrapper(async (req, res) => {
  const appointment = await Appointment.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: appointment });
});

exports.update = asyncWrapper(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!appointment) throw ApiError.notFound('Rendez-vous introuvable.');
  res.json({ success: true, data: appointment });
});

exports.remove = asyncWrapper(async (req, res) => {
  const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!appointment) throw ApiError.notFound('Rendez-vous introuvable.');
  res.json({ success: true, message: 'Rendez-vous supprimé.' });
});
