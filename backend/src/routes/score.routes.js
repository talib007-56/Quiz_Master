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
    let totalPercentage = 0;
    let maxPossibleScore = 0;

    scores.forEach(score => {
      totalScore += score.total_scored;
      // Use the number of questions actually answered or the quiz's question count
      const questionsAnswered = score.answers ? score.answers.length : (score.quiz_id.questions ? score.quiz_id.questions.length : 0);
      if (questionsAnswered > 0) {
        maxPossibleScore += questionsAnswered;
        // Calculate percentage for this score
        const scorePercentage = (score.total_scored / questionsAnswered) * 100;
        totalPercentage += scorePercentage;
      }
    });

    // Calculate average percentage from individual percentages
    const averageScore = totalAttempts > 0 ? totalPercentage / totalAttempts : 0;

    res.json({
      recentScores: scores.slice(0, 5), // Last 5 attempts
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
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
    console.log('=== QUIZ SUBMISSION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Time analytics received:', req.body.time_analytics);
    console.log('==============================');
    
    // Check if user has already attempted this quiz
    const existingScore = await Score.findOne({
      user_id: req.userId,
      quiz_id: req.body.quiz_id
    });

    if (existingScore) {
      // Allow retake if there are new questions available
      // Get current questions for this quiz
      const Question = require('../models/question.model');
      const currentQuestions = await Question.find({ quiz_id: req.body.quiz_id });
      const previouslyAnswered = existingScore.answers ? existingScore.answers.length : 0;
      
      // If user is trying to answer more questions than previously answered, allow retake
      const newAnswersCount = req.body.answers ? req.body.answers.length : 0;
      const hasNewQuestions = currentQuestions.length > previouslyAnswered;
      
      if (!hasNewQuestions || newAnswersCount <= previouslyAnswered) {
        return res.status(400).json({ 
          message: 'You have already attempted this quiz',
          details: {
            previouslyAnswered,
            currentQuestions: currentQuestions.length,
            hasNewQuestions
          }
        });
      }
      
      // Update existing score instead of creating new one
      existingScore.time_stamp_of_attempt = new Date();
      existingScore.total_scored = req.body.total_scored;
      existingScore.answers = req.body.answers;
      
      // Update time analytics if provided, or calculate basic ones
      if (req.body.time_analytics && req.body.time_analytics.totalTimeSpent > 0) {
        existingScore.time_analytics = req.body.time_analytics;
      } else {
        // Fallback: calculate basic time analytics
        const now = new Date();
        const attemptTime = new Date(existingScore.time_stamp_of_attempt);
        const timeDiff = Math.max(1, Math.floor((now - attemptTime) / 1000));
        const questionCount = req.body.answers ? req.body.answers.length : 1;
        
        existingScore.time_analytics = {
          totalTimeSpent: timeDiff,
          averageTimePerQuestion: Math.floor(timeDiff / questionCount),
          formattedTotalTime: formatTime(timeDiff),
          formattedAverageTime: formatTime(Math.floor(timeDiff / questionCount))
        };
        
        console.log('Generated fallback time analytics for retake:', existingScore.time_analytics);
      }
      
      const updatedScore = await existingScore.save();
      return res.status(200).json(updatedScore);
    }

    // Create new score for first-time attempt
    const scoreData = {
      quiz_id: req.body.quiz_id,
      user_id: req.userId,
      time_stamp_of_attempt: new Date(),
      total_scored: req.body.total_scored,
      answers: req.body.answers
    };
    
    // Add time analytics if provided, or calculate basic ones
    if (req.body.time_analytics && req.body.time_analytics.totalTimeSpent > 0) {
      scoreData.time_analytics = req.body.time_analytics;
    } else {
      // Fallback: calculate basic time analytics from attempt timestamp
      const now = new Date();
      const attemptTime = new Date(scoreData.time_stamp_of_attempt);
      const timeDiff = Math.max(1, Math.floor((now - attemptTime) / 1000)); // At least 1 second
      const questionCount = req.body.answers ? req.body.answers.length : 1;
      
      scoreData.time_analytics = {
        totalTimeSpent: timeDiff,
        averageTimePerQuestion: Math.floor(timeDiff / questionCount),
        formattedTotalTime: formatTime(timeDiff),
        formattedAverageTime: formatTime(Math.floor(timeDiff / questionCount))
      };
      
      console.log('Generated fallback time analytics:', scoreData.time_analytics);
    }
    
    // Helper function for time formatting
    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    const score = new Score(scoreData);
    const newScore = await score.save();
    
    console.log('=== SAVED SCORE DEBUG ===');
    console.log('Saved score:', JSON.stringify(newScore, null, 2));
    console.log('Time analytics in saved score:', newScore.time_analytics);
    console.log('========================');
    
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

// Test endpoint to check time analytics
router.post('/test-time-analytics', verifyToken, async (req, res) => {
  try {
    console.log('Test time analytics endpoint called');
    console.log('Body:', req.body);
    
    const testScore = new Score({
      quiz_id: '507f1f77bcf86cd799439011', // dummy ID
      user_id: req.userId,
      time_stamp_of_attempt: new Date(),
      total_scored: 5,
      answers: [],
      time_analytics: {
        totalTimeSpent: 120,
        averageTimePerQuestion: 30,
        formattedTotalTime: '00:02:00',
        formattedAverageTime: '00:00:30'
      }
    });
    
    console.log('Test score before save:', testScore);
    res.json({ message: 'Test successful', testScore });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 