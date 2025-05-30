const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, checkUserExists } = require('../middlewares/auth.middleware');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', verifyToken, checkUserExists, authController.getCurrentUser);

module.exports = router; 