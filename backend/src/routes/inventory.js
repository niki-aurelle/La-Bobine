const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.route('/').get(ctrl.list).post(ctrl.create);
router.route('/:id').put(ctrl.update).delete(ctrl.remove);
router.put('/:id/adjust', ctrl.adjustQuantity);

module.exports = router;
