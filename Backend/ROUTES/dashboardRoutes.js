const express = require('express');
const {
  getDashboardStats,
  getRecentDashboardRequests,
  getDashboardRequests,
} = require('../CONTROLLES/dashboardController');
const { protect } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/requests', getDashboardRequests);
router.get('/recent-requests', getRecentDashboardRequests);

module.exports = router;
