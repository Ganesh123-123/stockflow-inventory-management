const express = require('express');
const { getDashboardStats, getLowStockProducts, getRecentProducts } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/low-stock', getLowStockProducts);
router.get('/recent-products', getRecentProducts);

module.exports = router;

