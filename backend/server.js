require('dotenv').config();
require('./src/config/multer'); // Création des dossiers uploads/logs
const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`La Bobine API démarrée sur le port ${PORT} [${process.env.NODE_ENV}]`);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('UnhandledRejection:', err);
  process.exit(1);
});
