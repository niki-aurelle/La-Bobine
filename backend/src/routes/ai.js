const router = require('express').Router();
const ctrl = require('../controllers/aiController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(authenticate);

router.post('/photo-enhance', upload.single('photo'), ctrl.enhancePhoto);
router.get('/jobs', ctrl.listJobs);
router.get('/jobs/:id', ctrl.getJobStatus);

module.exports = router;
