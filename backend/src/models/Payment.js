const mongoose = require('mongoose');

const PAYMENT_METHODS = ['cash', 'mobile_money', 'bank_transfer', 'card', 'other'];
const PAYMENT_TYPES = ['deposit', 'partial', 'balance', 'full'];

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: PAYMENT_TYPES, required: true },
  method: { type: String, enum: PAYMENT_METHODS, default: 'cash' },
  paidAt: { type: Date, default: Date.now },
  notes: { type: String },
  reference: { type: String }, // Référence transaction mobile money etc.
}, { timestamps: true });

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, paidAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
