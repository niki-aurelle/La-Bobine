const router = require('express').Router();
const ctrl = require('../controllers/photoController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(authenticate);

router.route('/').get(ctrl.list);
router.post('/upload', upload.single('photo'), ctrl.upload);
router.route('/:id').put(ctrl.update).delete(ctrl.remove);

module.exports = router;
