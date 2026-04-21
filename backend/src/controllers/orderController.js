const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Fitting = require('../models/Fitting');
const Delivery = require('../models/Delivery');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');

const computeBalance = async (orderId) => {
  const order = await Order.findById(orderId);
  const payments = await Payment.find({ order: orderId });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  return { totalPrice: order.totalPrice, totalPaid, remaining: order.totalPrice - totalPaid };
};

exports.list = asyncWrapper(async (req, res) => {
  const { status, clientId, page = 1, limit = 20 } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;
  if (clientId) query.client = clientId;

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('client', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(+limit),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, data: orders, meta: { total, page: +page, limit: +limit } });
});

exports.create = asyncWrapper(async (req, res) => {
  const order = await Order.create({ ...req.body, user: req.user._id });

  // Créer la livraison si date fournie
  if (req.body.estimatedDeliveryDate) {
    await Delivery.create({
      user: req.user._id,
      order: order._id,
      client: order.client,
      plannedDate: req.body.estimatedDeliveryDate,
    });
  }

  res.status(201).json({ success: true, data: order });
});

exports.getOne = asyncWrapper(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    .populate('client', 'firstName lastName phone email');
  if (!order) throw ApiError.notFound('Commande introuvable.');

  const [payments, fittings, balance] = await Promise.all([
    Payment.find({ order: order._id }).sort({ paidAt: -1 }),
    Fitting.find({ order: order._id }).sort({ scheduledAt: 1 }),
    computeBalance(order._id),
  ]);

  res.json({ success: true, data: { ...order.toJSON(), payments, fittings, balance } });
});

exports.update = asyncWrapper(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate('client', 'firstName lastName');
  if (!order) throw ApiError.notFound('Commande introuvable.');
  res.json({ success: true, data: order });
});

exports.updateStatus = asyncWrapper(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status, ...(status === 'delivered' ? { actualDeliveryDate: new Date() } : {}) },
    { new: true }
  );
  if (!order) throw ApiError.notFound('Commande introuvable.');

  // Mettre à jour la livraison associée
  if (status === 'delivered') {
    await Delivery.findOneAndUpdate(
      { order: order._id },
      { status: 'delivered', actualDate: new Date() }
    );
  }

  res.json({ success: true, data: order });
});

// --- Paiements ---
exports.addPayment = asyncWrapper(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw ApiError.notFound('Commande introuvable.');

  const { amount, type, method, notes, reference } = req.body;
  const balance = await computeBalance(order._id);

  if (amount > balance.remaining + 0.01) {
    throw ApiError.badRequest(`Montant supérieur au reste dû (${balance.remaining}).`);
  }

  const payment = await Payment.create({
    user: req.user._id,
    order: order._id,
    client: order.client,
    amount,
    type,
    method,
    notes,
    reference,
  });

  const newBalance = await computeBalance(order._id);
  res.status(201).json({ success: true, data: payment, balance: newBalance });
});

// --- Essayages ---
exports.addFitting = asyncWrapper(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw ApiError.notFound('Commande introuvable.');

  const fittingCount = await Fitting.countDocuments({ order: order._id });
  const fitting = await Fitting.create({
    ...req.body,
    user: req.user._id,
    order: order._id,
    client: order.client,
    fittingNumber: fittingCount + 1,
  });

  if (order.status === 'confirmed' || order.status === 'in_progress') {
    await Order.findByIdAndUpdate(order._id, { status: 'fitting' });
  }

  res.status(201).json({ success: true, data: fitting });
});

exports.listFittings = asyncWrapper(async (req, res) => {
  const fittings = await Fitting.find({ order: req.params.id, user: req.user._id })
    .sort({ scheduledAt: 1 });
  res.json({ success: true, data: fittings });
});
