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
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only attempt a quiz once
scoreSchema.index({ quiz_id: 1, user_id: 1 }, { unique: true });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score; 