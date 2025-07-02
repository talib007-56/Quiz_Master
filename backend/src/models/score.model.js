const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  time_stamp_of_attempt: {
    type: Date,
    default: Date.now,
    required: true
  },
  total_scored: {
    type: Number,
    required: true,
    default: 0
  },
  answers: [{
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selected_option: {
      type: Number,
      required: true
    },
    is_correct: {
      type: Boolean,
      required: true
    }
  }],
  time_analytics: {
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    averageTimePerQuestion: {
      type: Number,
      default: 0
    },
    formattedTotalTime: {
      type: String,
      default: '00:00:00'
    },
    formattedAverageTime: {
      type: String,
      default: '00:00:00'
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Performance Indexes
scoreSchema.index({ quiz_id: 1, user_id: 1 }, { unique: true }); // Compound unique index
scoreSchema.index({ user_id: 1 }); // Index for user-specific queries
scoreSchema.index({ quiz_id: 1 }); // Index for quiz-specific queries
scoreSchema.index({ time_stamp_of_attempt: -1 }); // Index for chronological queries
scoreSchema.index({ total_scored: -1 }); // Index for score-based sorting
scoreSchema.index({ created_at: -1 }); // Index for recent attempts
scoreSchema.index({ 'answers.question_id': 1 }); // Index for answer analysis

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score; 