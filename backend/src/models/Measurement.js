const mongoose = require('mongoose');

// Mesures standard pour femme (en cm)
const standardMeasurements = {
  // Buste
  bustCircumference: Number,    // Tour de poitrine
  underBust: Number,            // Tour sous-poitrine
  shoulderWidth: Number,        // Largeur épaules
  // Taille
  waistCircumference: Number,   // Tour de taille
  // Hanches
  hipCircumference: Number,     // Tour de hanches
  // Dos
  backLength: Number,           // Longueur dos
  // Bras
  armLength: Number,            // Longueur bras
  armCircumference: Number,     // Tour de bras
  wristCircumference: Number,   // Tour poignet
  // Jambes
  inseamLength: Number,         // Entrejambe
  thighCircumference: Number,   // Tour de cuisse
  // Hauteur
  totalHeight: Number,          // Taille totale
  // Robe / jupe
  frontLength: Number,          // Longueur devant
  skirtLength: Number,          // Longueur jupe
};

const measurementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  label: { type: String, default: 'Mesures standard' }, // ex: "Mesures Noël 2024"
  unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
  // Mesures standard
  bustCircumference: Number,
  underBust: Number,
  shoulderWidth: Number,
  waistCircumference: Number,
  hipCircumference: Number,
  backLength: Number,
  armLength: Number,
  armCircumference: Number,
  wristCircumference: Number,
  inseamLength: Number,
  thighCircumference: Number,
  totalHeight: Number,
  frontLength: Number,
  skirtLength: Number,
  // Mesures personnalisées (clé-valeur libre)
  customMeasurements: [
    {
      name: { type: String, required: true },
      value: { type: Number, required: true },
      unit: { type: String, default: 'cm' },
    },
  ],
  notes: { type: String },
}, { timestamps: true });

measurementSchema.index({ client: 1, createdAt: -1 });

module.exports = mongoose.model('Measurement', measurementSchema);
