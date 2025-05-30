const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const Score = require('../models/score.model');

// Get all scores (admin only) or current user's scores
router.get('/', verifyToken, async (req, res) => {
  try {
    const query = {};
    
    // If user is not admin, only show their own scores
    if (req.userRole !== 'admin') {
      query.user_id = req.userId;
    } else {
      // Admin can filter by user_id if provided
      if (req.query.user_id) {
        query.user_id = req.query.user_id;
      }
    }
    
    if (req.query.quiz_id) {
      query.quiz_id = req.query.quiz_id;
    }
    
    const scores = await Score.find(query)
      .populate('user_id')
      .populate({
        path: 'quiz_id',
        populate: {
          path: 'chapter_id',
          populate: {
            path: 'subject_id'
          }
        }
      })
      .sort({ time_stamp_of_attempt: -1 });
      
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's scores
router.get('/user-stats', verifyToken, async (req, res) => {
  try {
    const scores = await Score.find({ user_id: req.userId })
      .populate({
        path: 'quiz_id',
        populate: {
          path: 'chapter_id',
          populate: {
            path: 'subject_id'
          }
        }
      })
      .sort({ time_stamp_of_attempt: -1 });

    // Calculate statistics
    const totalAttempts = scores.length;
    let totalScore = 0;
    let maxPossibleScore = 0;

    scores.forEach(score => {
      totalScore += score.total_scored;
      maxPossibleScore += score.quiz_id.questions.length;
    });

    const averageScore = maxPossibleScore > 0 
      ? (totalScore / maxPossibleScore) * 100 
      : 0;

    res.json({
      recentScores: scores.slice(0, 5), // Last 5 attempts
      totalAttempts,
      averageScore,
      totalScore,
      maxPossibleScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a quiz score
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user has already attempted this quiz
    const existingScore = await Score.findOne({
      user_id: req.userId,
      quiz_id: req.body.quiz_id
    });

    if (existingScore) {
      return res.status(400).json({ message: 'You have already attempted this quiz' });
    }

    const score = new Score({
      quiz_id: req.body.quiz_id,
      user_id: req.userId,
      time_stamp_of_attempt: new Date(),
      total_scored: req.body.total_scored,
      answers: req.body.answers
    });

    const newScore = await score.save();
    res.status(201).json(newScore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single score
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id)
      .populate('user_id')
      .populate({
        path: 'quiz_id',
        populate: {
          path: 'chapter_id',
          populate: {
            path: 'subject_id'
          }
        }
      });

    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    // Check if user is admin or the score belongs to them
    if (req.userRole !== 'admin' && score.user_id._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 