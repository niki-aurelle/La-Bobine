const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  avatarUrl: { type: String },
  notes: { type: String },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

clientSchema.index({ user: 1, lastName: 1, firstName: 1 });
clientSchema.index({ user: 1, phone: 1 });

clientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

clientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Client', clientSchema);
