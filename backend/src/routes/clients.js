const router = require('express').Router();
const ctrl = require('../controllers/clientController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.route('/').get(ctrl.list).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove);
router.route('/:id/measurements').get(ctrl.getMeasurements).post(ctrl.addMeasurement);
router.put('/:id/measurements/:measurementId', ctrl.updateMeasurement);

module.exports = router;
