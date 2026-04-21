const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  originalUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  filename: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number }, // bytes
  caption: { type: String },
  tags: [{ type: String }],
  isPortfolio: { type: Boolean, default: false }, // marqué comme création finale pour portfolio
  aiEnhanced: { type: Boolean, default: false },
  aiJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIJob' },
}, { timestamps: true });

photoSchema.index({ user: 1, order: 1 });
photoSchema.index({ user: 1, isPortfolio: 1 });

module.exports = mongoose.model('Photo', photoSchema);
