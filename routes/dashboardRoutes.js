const express = require('express');
const router = express.Router();

// **Dashboard Controller Authentication**
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/authMiddle');

// **Dashboard Statistics**
router.get('/stats', authenticate, authorize(['admin']), dashboardController.getDashboardStats);

// **User Analytics**
router.get('/user-analytics', authenticate, authorize(['admin']), dashboardController.getUserAnalytics);

// **New Users (Last 5 Days)**
router.get('/new-users', authenticate, authorize(['admin']), dashboardController.getNewUsers);

module.exports = router;
