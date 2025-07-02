const express = require('express');
const router = express.Router();
const {
  updateNotificationPreferences,
  triggerDailyReminders,
  triggerMonthlyReports,
  triggerEngagementNotification,
  testEmail
} = require('../controllers/notification.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// User notification preference routes
router.put('/preferences/:userId', authenticateToken, updateNotificationPreferences);

// Admin-only notification trigger routes
router.post('/trigger/daily-reminders', authenticateToken, requireAdmin, triggerDailyReminders);
router.post('/trigger/monthly-reports', authenticateToken, requireAdmin, triggerMonthlyReports);
router.post('/trigger/engagement-notification', authenticateToken, requireAdmin, triggerEngagementNotification);
router.post('/test-email', authenticateToken, requireAdmin, testEmail);

module.exports = router; 