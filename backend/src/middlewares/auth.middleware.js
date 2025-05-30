const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
  try {
    // Get token from authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }

      // Add user ID from token to request object
      req.userId = decoded.id;
      req.userRole = decoded.role;
      next();
    });
  } catch (error) {
    console.error('Error in verifyToken:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
    next();
  } catch (error) {
    console.error('Error in isAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if user exists
exports.checkUserExists = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    console.error('Error in checkUserExists:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 