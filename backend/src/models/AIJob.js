const mongoose = require('mongoose');

const AI_JOB_STATUSES = ['pending', 'processing', 'done', 'failed'];

const aiJobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
  status: { type: String, enum: AI_JOB_STATUSES, default: 'pending' },
  provider: { type: String, default: 'openai' }, // openai | replicate | custom
  inputUrl: { type: String, required: true },
  outputUrl: { type: String },
  operations: [{ type: String }], // ['enhance', 'denoise', 'sharpen', ...]
  options: { type: mongoose.Schema.Types.Mixed }, // options libres passées au provider
  errorMessage: { type: String },
  startedAt: { type: Date },
  completedAt: { type: Date },
  processingMs: { type: Number }, // durée de traitement
}, { timestamps: true });

aiJobSchema.index({ user: 1, status: 1 });
aiJobSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AIJob', aiJobSchema);
module.exports.AI_JOB_STATUSES = AI_JOB_STATUSES;
