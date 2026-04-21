const path = require('path');
const Photo = require('../models/Photo');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');

exports.list = asyncWrapper(async (req, res) => {
  const { orderId, clientId, portfolio, page = 1, limit = 20 } = req.query;
  const query = { user: req.user._id };
  if (orderId) query.order = orderId;
  if (clientId) query.client = clientId;
  if (portfolio === 'true') query.isPortfolio = true;

  const skip = (page - 1) * limit;
  const [photos, total] = await Promise.all([
    Photo.find(query).sort({ createdAt: -1 }).skip(skip).limit(+limit),
    Photo.countDocuments(query),
  ]);

  res.json({ success: true, data: photos, meta: { total, page: +page, limit: +limit } });
});

exports.upload = asyncWrapper(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Aucun fichier fourni.');

  const { orderId, clientId, caption, tags, isPortfolio } = req.body;

  const photo = await Photo.create({
    user: req.user._id,
    order: orderId || undefined,
    client: clientId || undefined,
    originalUrl: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    caption,
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    isPortfolio: isPortfolio === 'true',
  });

  res.status(201).json({ success: true, data: photo });
});

exports.update = asyncWrapper(async (req, res) => {
  const photo = await Photo.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!photo) throw ApiError.notFound('Photo introuvable.');
  res.json({ success: true, data: photo });
});

exports.remove = asyncWrapper(async (req, res) => {
  const photo = await Photo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!photo) throw ApiError.notFound('Photo introuvable.');
  res.json({ success: true, message: 'Photo supprimée.' });
});
