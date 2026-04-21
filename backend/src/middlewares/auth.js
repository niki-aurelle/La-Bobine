const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');

const authenticate = asyncWrapper(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token manquant.');
  }

  const token = header.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized('Token invalide ou expiré.');
  }

  const user = await User.findById(payload.id).select('-password');
  if (!user || !user.isActive) throw ApiError.unauthorized('Compte introuvable ou désactivé.');

  req.user = user;
  next();
});

module.exports = { authenticate };
