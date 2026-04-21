const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, ctrl.getDashboard);

module.exports = router;
