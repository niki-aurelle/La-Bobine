const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Erreurs Mongoose
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Données invalides.', details });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ success: false, message: `${field} déjà utilisé.` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Identifiant invalide.' });
  }

  // Erreurs opérationnelles connues
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Erreur inconnue (bug)
  logger.error('Erreur non gérée:', err);
  res.status(500).json({ success: false, message: 'Erreur serveur interne.' });
};

module.exports = errorHandler;
