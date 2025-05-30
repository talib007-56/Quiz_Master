const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const Quiz = require('../models/quiz.model');

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.chapter_id) {
      query.chapter_id = req.query.chapter_id;
    }
    const quizzes = await Quiz.find(query)
      .populate({
        path: 'chapter_id',
        populate: {
          path: 'subject_id'
        }
      });
    res.json(quizzes);
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

    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 