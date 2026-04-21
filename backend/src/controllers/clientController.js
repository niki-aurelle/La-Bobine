const Client = require('../models/Client');
const Measurement = require('../models/Measurement');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');

exports.list = asyncWrapper(async (req, res) => {
  const { search, page = 1, limit = 20, archived } = req.query;
  const query = { user: req.user._id };

  if (archived !== 'true') query.isArchived = false;
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }

  const skip = (page - 1) * limit;
  const [clients, total] = await Promise.all([
    Client.find(query).sort({ lastName: 1, firstName: 1 }).skip(skip).limit(+limit),
    Client.countDocuments(query),
  ]);

  res.json({ success: true, data: clients, meta: { total, page: +page, limit: +limit } });
});

exports.create = asyncWrapper(async (req, res) => {
  const client = await Client.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: client });
});

exports.getOne = asyncWrapper(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, user: req.user._id });
  if (!client) throw ApiError.notFound('Cliente introuvable.');

  const [orderCount, lastMeasurement] = await Promise.all([
    Order.countDocuments({ client: client._id }),
    Measurement.findOne({ client: client._id }).sort({ createdAt: -1 }),
  ]);

  res.json({ success: true, data: { ...client.toJSON(), orderCount, lastMeasurement } });
});

exports.update = asyncWrapper(async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!client) throw ApiError.notFound('Cliente introuvable.');
  res.json({ success: true, data: client });
});

exports.remove = asyncWrapper(async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isArchived: true },
    { new: true }
  );
  if (!client) throw ApiError.notFound('Cliente introuvable.');
  res.json({ success: true, message: 'Cliente archivée.' });
});

// --- Mesures ---
exports.getMeasurements = asyncWrapper(async (req, res) => {
  const measurements = await Measurement.find({
    client: req.params.id,
    user: req.user._id,
  }).sort({ createdAt: -1 });
  res.json({ success: true, data: measurements });
});

exports.addMeasurement = asyncWrapper(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, user: req.user._id });
  if (!client) throw ApiError.notFound('Cliente introuvable.');

  const measurement = await Measurement.create({
    ...req.body,
    client: client._id,
    user: req.user._id,
  });
  res.status(201).json({ success: true, data: measurement });
});

exports.updateMeasurement = asyncWrapper(async (req, res) => {
  const measurement = await Measurement.findOneAndUpdate(
    { _id: req.params.measurementId, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!measurement) throw ApiError.notFound('Mesures introuvables.');
  res.json({ success: true, data: measurement });
});
