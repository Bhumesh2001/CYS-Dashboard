const express = require('express');
const router = express.Router();

// **Dashboard Controller Authentication**
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { cacheMiddleware } = require("../middlewares/cacheMiddle");

// **Dashboard Statistics**
router.get(
    '/stats',
    authenticate,
    authorize(['admin']),
    cacheMiddleware,
    dashboardController.getDashboardStats
);

// **User Analytics**
router.get(
    '/user-analytics',
    authenticate,
    authorize(['admin']),
    cacheMiddleware,
    dashboardController.getUserAnalytics
);

// **New Users (Last 5 Days)**
router.get(
    '/new-users',
    authenticate,
    authorize(['admin']),
    cacheMiddleware,
    dashboardController.getNewUsers
);

module.exports = router;
