const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  plannedDate: { type: Date, required: true },
  actualDate: { type: Date },
  status: { type: String, enum: ['pending', 'delivered', 'late', 'cancelled'], default: 'pending' },
  deliveryAddress: { type: String },
  notes: { type: String },
}, { timestamps: true });

deliverySchema.index({ user: 1, plannedDate: 1 });
deliverySchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);
