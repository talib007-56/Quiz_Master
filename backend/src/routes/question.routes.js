const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const Question = require('../models/question.model');

// Get all questions
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.quiz_id) {
      query.quiz_id = req.query.quiz_id;
    }
    const questions = await Question.find(query).populate('quiz_id');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('quiz_id');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new question (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  console.log('=== Question Creation Request ===');
  console.log('Request body:', req.body);
  console.log('Required fields check:');
  console.log('- quiz_id:', req.body.quiz_id);
  console.log('- question_title:', req.body.question_title);
  console.log('- question_statement:', req.body.question_statement);
  console.log('- option1:', req.body.option1);
  console.log('- option2:', req.body.option2);
  console.log('- option3:', req.body.option3);
  console.log('- option4:', req.body.option4);
  console.log('- correct_option:', req.body.correct_option);

  const question = new Question({
    quiz_id: req.body.quiz_id,
    question_title: req.body.question_title,
    question_statement: req.body.question_statement,
    option1: req.body.option1,
    option2: req.body.option2,
    option3: req.body.option3,
    option4: req.body.option4,
    correct_option: req.body.correct_option
  });

  try {
    console.log('Attempting to save question:', question);
    const newQuestion = await question.save();
    console.log('Question saved successfully:', newQuestion);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error saving question:', error);
    console.error('Validation errors:', error.errors);
    res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// Update a question (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (req.body.quiz_id) question.quiz_id = req.body.quiz_id;
    if (req.body.question_title) question.question_title = req.body.question_title;
    if (req.body.question_statement) question.question_statement = req.body.question_statement;
    if (req.body.option1) question.option1 = req.body.option1;
    if (req.body.option2) question.option2 = req.body.option2;
    if (req.body.option3) question.option3 = req.body.option3;
    if (req.body.option4) question.option4 = req.body.option4;
    if (req.body.correct_option) question.correct_option = req.body.correct_option;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a question (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.deleteOne();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 