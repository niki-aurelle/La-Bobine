const router = require('express').Router();
const Delivery = require('../models/Delivery');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', asyncWrapper(async (req, res) => {
  const { status } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const deliveries = await Delivery.find(query)
    .populate('client', 'firstName lastName phone')
    .populate('order', 'reference garmentType')
    .sort({ plannedDate: 1 });

  res.json({ success: true, data: deliveries });
}));

router.put('/:id', asyncWrapper(async (req, res) => {
  const delivery = await Delivery.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!delivery) throw ApiError.notFound('Livraison introuvable.');
  res.json({ success: true, data: delivery });
}));

module.exports = router;
