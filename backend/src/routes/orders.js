const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.route('/').get(ctrl.list).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update);
router.put('/:id/status', ctrl.updateStatus);
router.route('/:id/payments').post(ctrl.addPayment);
router.route('/:id/fittings').get(ctrl.listFittings).post(ctrl.addFitting);

module.exports = router;
