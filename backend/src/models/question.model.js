const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  question_title: {
    type: String,
    required: true
  },
  question_statement: {
    type: String,
    required: true
  },
  option1: {
    type: String,
    required: true
  },
  option2: {
    type: String,
    required: true
  },
  option3: {
    type: String,
    required: true
  },
  option4: {
    type: String,
    required: true
  },
  correct_option: {
    type: Number, // 1, 2, 3, or 4
    required: true,
    min: 1,
    max: 4
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question; 