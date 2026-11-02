const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;

