const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const Quiz = require('../models/quiz.model');

// Get all quizzes with optional pagination
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.chapter_id) {
      query.chapter_id = req.query.chapter_id;
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { remarks: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Check if pagination is requested
    const requestsPagination = req.query.page || req.query.limit;
    
    if (requestsPagination) {
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await Quiz.countDocuments(query);
      
      const quizzes = await Quiz.find(query)
        .populate({
          path: 'chapter_id',
          populate: {
            path: 'subject_id'
          }
        })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip);

      res.json({
        data: quizzes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      });
    } else {
      // Return all quizzes without pagination (backward compatibility)
      const quizzes = await Quiz.find(query)
        .populate({
          path: 'chapter_id',
          populate: {
            path: 'subject_id'
          }
        })
        .sort({ created_at: -1 });

      res.json(quizzes);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single quiz
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate({
        path: 'chapter_id',
        populate: {
          path: 'subject_id'
        }
      });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new quiz (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const quiz = new Quiz({
    chapter_id: req.body.chapter_id,
    date_of_quiz: req.body.date_of_quiz,
    time_duration: req.body.time_duration,
    remarks: req.body.remarks
  });

  try {
    const newQuiz = await quiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a quiz (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (req.body.chapter_id) quiz.chapter_id = req.body.chapter_id;
    if (req.body.date_of_quiz) quiz.date_of_quiz = req.body.date_of_quiz;
    if (req.body.time_duration) quiz.time_duration = req.body.time_duration;
    if (req.body.remarks) quiz.remarks = req.body.remarks;

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a quiz (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Import required models for cascading deletion
    const Question = require('../models/question.model');
    const Score = require('../models/score.model');

    // Delete all questions associated with this quiz
    const deletedQuestions = await Question.deleteMany({ quiz_id: req.params.id });
    console.log(`Deleted ${deletedQuestions.deletedCount} questions for quiz ${req.params.id}`);

    // Delete all scores associated with this quiz
    const deletedScores = await Score.deleteMany({ quiz_id: req.params.id });
    console.log(`Deleted ${deletedScores.deletedCount} scores for quiz ${req.params.id}`);

    // Finally delete the quiz itself
    await quiz.deleteOne();
    
    res.json({ 
      message: 'Quiz deleted successfully',
      deletedQuestions: deletedQuestions.deletedCount,
      deletedScores: deletedScores.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 