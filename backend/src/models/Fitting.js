const mongoose = require('mongoose');

const fittingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  scheduledAt: { type: Date, required: true },
  completedAt: { type: Date },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  adjustments: { type: String }, // Remarques / ajustements à faire
  notes: { type: String },
  fittingNumber: { type: Number, default: 1 }, // 1er, 2e, 3e essayage
}, { timestamps: true });

fittingSchema.index({ order: 1 });
fittingSchema.index({ user: 1, scheduledAt: 1 });

module.exports = mongoose.model('Fitting', fittingSchema);
