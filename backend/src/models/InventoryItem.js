const mongoose = require('mongoose');

const INVENTORY_CATEGORIES = ['fabric', 'thread', 'button', 'zipper', 'accessory', 'other'];

const inventoryItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: INVENTORY_CATEGORIES, default: 'other' },
  color: { type: String, trim: true },
  reference: { type: String, trim: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  unit: { type: String, default: 'm' }, // m, pcs, kg, etc.
  minQuantity: { type: Number, default: 0 }, // seuil d'alerte
  unitPrice: { type: Number, min: 0 },
  supplierName: { type: String },
  notes: { type: String },
  photoUrl: { type: String },
}, { timestamps: true });

inventoryItemSchema.virtual('isLow').get(function () {
  return this.quantity <= this.minQuantity;
});

inventoryItemSchema.index({ user: 1, category: 1 });

inventoryItemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
