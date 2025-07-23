const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, checkUserExists } = require('../middlewares/auth.middleware');
const User = require('../models/user.model');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (requires authentication)
router.get('/me', verifyToken, checkUserExists, authController.getCurrentUser);

// Change password (requires authentication)
router.post('/change-password', verifyToken, checkUserExists, authController.changePassword);

// Debug route - REMOVE IN PRODUCTION
router.get('/debug', async (req, res) => {
  try {
    // Check if admin exists
    const adminUser = await User.findOne({ email: 'admin@quizmaster.com' });
    
    // Check environment variables
    const envCheck = {
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };

    res.json({
      message: 'Debug information',
      adminUserExists: !!adminUser,
      adminUserRole: adminUser?.role || 'NO ADMIN FOUND',
      adminUserEmail: adminUser?.email || 'NO ADMIN FOUND',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Debug error',
      error: error.message
    });
  }
});

// Force create admin - REMOVE IN PRODUCTION
router.post('/force-create-admin', async (req, res) => {
  try {
    // Delete any existing admin
    await User.deleteMany({ role: 'admin' });
    
    // Create new admin
    await authController.createAdmin();
    
    res.json({
      message: 'Admin user force created',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating admin',
      error: error.message
    });
  }
});

module.exports = router; 