const InventoryItem = require('../models/InventoryItem');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');

exports.list = asyncWrapper(async (req, res) => {
  const { category, lowStock } = req.query;
  const query = { user: req.user._id };
  if (category) query.category = category;

  const items = await InventoryItem.find(query).sort({ category: 1, name: 1 });
  const result = lowStock === 'true' ? items.filter((i) => i.isLow) : items;

  res.json({ success: true, data: result });
});

exports.create = asyncWrapper(async (req, res) => {
  const item = await InventoryItem.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: item });
});

exports.update = asyncWrapper(async (req, res) => {
  const item = await InventoryItem.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) throw ApiError.notFound('Article introuvable.');
  res.json({ success: true, data: item });
});

exports.remove = asyncWrapper(async (req, res) => {
  const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) throw ApiError.notFound('Article introuvable.');
  res.json({ success: true, message: 'Article supprimé.' });
});

exports.adjustQuantity = asyncWrapper(async (req, res) => {
  const { delta, notes } = req.body; // delta positif = ajout, négatif = consommation
  const item = await InventoryItem.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw ApiError.notFound('Article introuvable.');

  item.quantity = Math.max(0, item.quantity + delta);
  await item.save();
  res.json({ success: true, data: item });
});
