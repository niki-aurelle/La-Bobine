const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ success: true, token, user });
};

exports.register = asyncWrapper(async (req, res) => {
  const { name, email, password, phone, atelierName } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict('Cet email est déjà utilisé.');

  const user = await User.create({ name, email, password, phone, atelierName });
  sendAuthResponse(res, user, 201);
});

exports.login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Email ou mot de passe incorrect.');
  }

  sendAuthResponse(res, user);
});

exports.getMe = asyncWrapper(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updateProfile = asyncWrapper(async (req, res) => {
  const { name, phone, atelierName, currency, language, notificationsEnabled } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, atelierName, currency, language, notificationsEnabled },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

exports.changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Mot de passe actuel incorrect.');
  }

  user.password = newPassword;
  await user.save();
  sendAuthResponse(res, user);
});
