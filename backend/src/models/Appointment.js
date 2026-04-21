const mongoose = require('mongoose');

const APPOINTMENT_TYPES = ['fitting', 'delivery', 'consultation', 'pickup', 'other'];

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: APPOINTMENT_TYPES, default: 'other' },
  startAt: { type: Date, required: true },
  endAt: { type: Date },
  location: { type: String, trim: true },
  notes: { type: String },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  reminderSentAt: { type: Date },
}, { timestamps: true });

appointmentSchema.index({ user: 1, startAt: 1 });
appointmentSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
