const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  chapter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  date_of_quiz: {
    type: Date,
    default: Date.now,
    required: true
  },
  time_duration: {
    type: Number, // Time in minutes
    required: true
  },
  remarks: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for questions
quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quiz_id'
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 