const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'la-bobine',
    });
    logger.info(`MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    logger.error('Erreur connexion MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
