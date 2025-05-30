const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const User = require('../models/user.model');

// Get all users (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin or the profile belongs to them
    if (req.userRole !== 'admin' && user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin or updating their own profile
    if (req.userRole !== 'admin' && user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updating specific fields
    const allowedUpdates = ['full_name', 'qualification'];
    if (req.userRole === 'admin') {
      allowedUpdates.push('role');
    }

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = req.body[key];
      }
    });

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      qualification: updatedUser.qualification,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 