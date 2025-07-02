const express = require('express');
const router = express.Router();
const {
  exportQuizData,
  exportQuizAttempts,
  exportUserEngagement
} = require('../controllers/export.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Admin-only export routes
router.get('/quiz-data', authenticateToken, requireAdmin, exportQuizData);
router.get('/quiz-attempts', authenticateToken, requireAdmin, exportQuizAttempts);
router.get('/user-engagement', authenticateToken, requireAdmin, exportUserEngagement);

module.exports = router; 