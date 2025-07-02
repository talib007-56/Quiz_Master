const Score = require('../models/score.model');
const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const User = require('../models/user.model');
const Chapter = require('../models/chapter.model');
const Subject = require('../models/subject.model');

// Export quiz data to CSV
const exportQuizData = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('chapter_id', 'name')
      .populate({
        path: 'chapter_id',
        populate: {
          path: 'subject_id',
          select: 'name'
        }
      })
      .lean();

    const questions = await Question.find().lean();

    // Create CSV data
    const csvData = [];
    
    for (const quiz of quizzes) {
      const quizQuestions = questions.filter(q => q.quiz_id.toString() === quiz._id.toString());
      
      csvData.push({
        quiz_id: quiz._id,
        subject_name: quiz.chapter_id?.subject_id?.name || 'N/A',
        chapter_name: quiz.chapter_id?.name || 'N/A',
        quiz_date: quiz.date_of_quiz,
        duration_minutes: quiz.time_duration,
        remarks: quiz.remarks || '',
        total_questions: quizQuestions.length,
        created_at: quiz.created_at
      });
    }

    // Convert to CSV format
    const csvHeader = [
      'Quiz ID',
      'Subject',
      'Chapter',
      'Quiz Date',
      'Duration (Minutes)',
      'Remarks',
      'Total Questions',
      'Created At'
    ];

    let csvContent = csvHeader.join(',') + '\n';
    
    csvData.forEach(row => {
      const csvRow = [
        row.quiz_id,
        `"${row.subject_name}"`,
        `"${row.chapter_name}"`,
        row.quiz_date ? new Date(row.quiz_date).toISOString().split('T')[0] : '',
        row.duration_minutes,
        `"${row.remarks}"`,
        row.total_questions,
        new Date(row.created_at).toISOString().split('T')[0]
      ];
      csvContent += csvRow.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="quiz-data.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting quiz data:', error);
    res.status(500).json({ message: 'Failed to export quiz data', error: error.message });
  }
};

// Export quiz attempt data to CSV
const exportQuizAttempts = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate('user_id', 'full_name email')
      .populate({
        path: 'quiz_id',
        populate: {
          path: 'chapter_id',
          populate: {
            path: 'subject_id',
            select: 'name'
          },
          select: 'name'
        }
      })
      .lean();

    // Create CSV data
    const csvData = [];
    
    for (const score of scores) {
      csvData.push({
        attempt_id: score._id,
        user_name: score.user_id?.full_name || 'N/A',
        user_email: score.user_id?.email || 'N/A',
        subject_name: score.quiz_id?.chapter_id?.subject_id?.name || 'N/A',
        chapter_name: score.quiz_id?.chapter_id?.name || 'N/A',
        quiz_date: score.quiz_id?.date_of_quiz || '',
        attempt_date: score.time_stamp_of_attempt,
        total_questions: score.answers?.length || 0,
        correct_answers: score.answers?.filter(a => a.is_correct).length || 0,
        total_scored: score.total_scored,
        percentage: score.answers?.length > 0 ? ((score.answers.filter(a => a.is_correct).length / score.answers.length) * 100).toFixed(2) : 0
      });
    }

    // Convert to CSV format
    const csvHeader = [
      'Attempt ID',
      'Student Name',
      'Student Email',
      'Subject',
      'Chapter',
      'Quiz Date',
      'Attempt Date',
      'Total Questions',
      'Correct Answers',
      'Total Score',
      'Percentage (%)'
    ];

    let csvContent = csvHeader.join(',') + '\n';
    
    csvData.forEach(row => {
      const csvRow = [
        row.attempt_id,
        `"${row.user_name}"`,
        `"${row.user_email}"`,
        `"${row.subject_name}"`,
        `"${row.chapter_name}"`,
        row.quiz_date ? new Date(row.quiz_date).toISOString().split('T')[0] : '',
        new Date(row.attempt_date).toISOString().replace('T', ' ').split('.')[0],
        row.total_questions,
        row.correct_answers,
        row.total_scored,
        row.percentage
      ];
      csvContent += csvRow.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="quiz-attempts.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting quiz attempts:', error);
    res.status(500).json({ message: 'Failed to export quiz attempts', error: error.message });
  }
};

// Export user engagement data
const exportUserEngagement = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).lean();
    const scores = await Score.find().populate('user_id', 'email full_name').lean();

    // Calculate engagement metrics per user
    const engagementData = [];
    
    for (const user of users) {
      const userScores = scores.filter(s => s.user_id?._id?.toString() === user._id.toString());
      const lastActivity = userScores.length > 0 ? 
        Math.max(...userScores.map(s => new Date(s.time_stamp_of_attempt).getTime())) : 
        new Date(user.created_at).getTime();
      
      const daysSinceLastActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
      
      engagementData.push({
        user_id: user._id,
        user_name: user.full_name,
        user_email: user.email,
        registration_date: user.created_at,
        total_attempts: userScores.length,
        last_activity: new Date(lastActivity),
        days_since_last_activity: daysSinceLastActivity,
        average_score: userScores.length > 0 ? 
          (userScores.reduce((sum, s) => sum + s.total_scored, 0) / userScores.length).toFixed(2) : 0,
        engagement_status: daysSinceLastActivity > 7 ? 'Inactive' : 'Active'
      });
    }

    // Convert to CSV format
    const csvHeader = [
      'User ID',
      'Name',
      'Email',
      'Registration Date',
      'Total Attempts',
      'Last Activity',
      'Days Since Last Activity',
      'Average Score',
      'Engagement Status'
    ];

    let csvContent = csvHeader.join(',') + '\n';
    
    engagementData.forEach(row => {
      const csvRow = [
        row.user_id,
        `"${row.user_name}"`,
        `"${row.user_email}"`,
        new Date(row.registration_date).toISOString().split('T')[0],
        row.total_attempts,
        row.last_activity.toISOString().split('T')[0],
        row.days_since_last_activity,
        row.average_score,
        row.engagement_status
      ];
      csvContent += csvRow.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="user-engagement.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting user engagement:', error);
    res.status(500).json({ message: 'Failed to export user engagement data', error: error.message });
  }
};

module.exports = {
  exportQuizData,
  exportQuizAttempts,
  exportUserEngagement
}; 