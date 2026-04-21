const mongoose = require('mongoose');

const ORDER_STATUSES = ['draft', 'confirmed', 'in_progress', 'fitting', 'ready', 'delivered', 'cancelled'];

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  reference: { type: String, unique: true }, // auto-généré ex: CMD-2024-001

  // Description
  garmentType: { type: String, required: true, trim: true }, // ex: "Robe de soirée"
  description: { type: String, trim: true },
  fabric: { type: String, trim: true },
  fabricQuantity: { type: Number }, // en mètres
  modelPhotoUrl: { type: String },  // photo du modèle de référence

  // Prix
  totalPrice: { type: Number, required: true, min: 0 },
  depositAmount: { type: Number, default: 0, min: 0 },

  // Statut
  status: { type: String, enum: ORDER_STATUSES, default: 'confirmed' },

  // Dates
  orderDate: { type: Date, default: Date.now },
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },

  // Notes internes (non visibles par la cliente)
  internalNotes: { type: String },

  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
}, { timestamps: true });

// Référence auto-incrémentée
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.reference) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({ user: this.user });
    this.reference = `CMD-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Montant payé (calculé via agrégation Payment, non stocké)
orderSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'order',
});

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ user: 1, client: 1 });
orderSchema.index({ estimatedDeliveryDate: 1 });

orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
