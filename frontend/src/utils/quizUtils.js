/**
 * Utility functions for quiz functionality
 */

// Shuffle array using Fisher-Yates algorithm
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Randomize questions and their options
export const randomizeQuiz = (questions, randomizeQuestions = true, randomizeOptions = true) => {
  let processedQuestions = [...questions];

  // Randomize question order
  if (randomizeQuestions) {
    processedQuestions = shuffleArray(processedQuestions);
  }

  // Randomize options within each question
  if (randomizeOptions) {
    processedQuestions = processedQuestions.map(question => {
      const options = [
        { text: question.option1, index: 1 },
        { text: question.option2, index: 2 },
        { text: question.option3, index: 3 },
        { text: question.option4, index: 4 }
      ];

      const shuffledOptions = shuffleArray(options);
      
      // Find where the correct option moved to
      const correctOptionIndex = shuffledOptions.findIndex(
        opt => opt.index === question.correct_option
      ) + 1;

      return {
        ...question,
        option1: shuffledOptions[0].text,
        option2: shuffledOptions[1].text,
        option3: shuffledOptions[2].text,
        option4: shuffledOptions[3].text,
        correct_option: correctOptionIndex,
        original_correct_option: question.correct_option,
        option_mapping: shuffledOptions.map(opt => opt.index)
      };
    });
  }

  return processedQuestions;
};

// Calculate quiz statistics
export const calculateQuizStats = (answers, questions) => {
  const totalQuestions = questions.length;
  const attemptedQuestions = answers.length;
  const correctAnswers = answers.filter(answer => answer.is_correct).length;
  const incorrectAnswers = attemptedQuestions - correctAnswers;
  const unansweredQuestions = totalQuestions - attemptedQuestions;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const accuracy = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;

  return {
    totalQuestions,
    attemptedQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    percentage,
    accuracy,
    score: correctAnswers
  };
};

// Format time duration
export const formatTime = (seconds) => {
  if (seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Parse time string to seconds
export const parseTimeToSeconds = (timeString) => {
  const parts = timeString.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  } else if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return parseInt(timeString) || 0;
};

// Get difficulty level based on score percentage
export const getDifficultyLevel = (percentage) => {
  if (percentage >= 90) return { level: 'Expert', color: '#10b981', icon: '🏆' };
  if (percentage >= 75) return { level: 'Advanced', color: '#3b82f6', icon: '⭐' };
  if (percentage >= 60) return { level: 'Intermediate', color: '#f59e0b', icon: '📚' };
  if (percentage >= 40) return { level: 'Beginner', color: '#ef4444', icon: '📖' };
  return { level: 'Needs Practice', color: '#6b7280', icon: '💪' };
};

// Calculate performance trend
export const calculatePerformanceTrend = (scores) => {
  if (scores.length < 2) return { trend: 'neutral', percentage: 0 };
  
  const recent = scores.slice(-3); // Last 3 attempts
  const older = scores.slice(-6, -3); // Previous 3 attempts
  
  if (older.length === 0) return { trend: 'neutral', percentage: 0 };
  
  const recentAvg = recent.reduce((sum, score) => sum + score.percentage, 0) / recent.length;
  const olderAvg = older.reduce((sum, score) => sum + score.percentage, 0) / older.length;
  
  const change = recentAvg - olderAvg;
  
  if (change > 5) return { trend: 'improving', percentage: Math.round(change) };
  if (change < -5) return { trend: 'declining', percentage: Math.round(Math.abs(change)) };
  return { trend: 'stable', percentage: Math.round(Math.abs(change)) };
};

// Generate quiz insights
export const generateQuizInsights = (userScores, allQuestions) => {
  if (userScores.length === 0) return [];
  
  const insights = [];
  
  // Performance trend
  const trend = calculatePerformanceTrend(userScores);
  if (trend.trend === 'improving') {
    insights.push({
      type: 'success',
      title: 'Great Progress!',
      message: `Your performance has improved by ${trend.percentage}% in recent quizzes.`,
      icon: '📈'
    });
  } else if (trend.trend === 'declining') {
    insights.push({
      type: 'warning',
      title: 'Need More Practice',
      message: `Your performance has declined by ${trend.percentage}%. Consider reviewing the topics.`,
      icon: '📉'
    });
  }
  
  // Average score
  const avgScore = userScores.reduce((sum, score) => sum + score.percentage, 0) / userScores.length;
  if (avgScore >= 85) {
    insights.push({
      type: 'success',
      title: 'Excellent Performance',
      message: `Your average score is ${Math.round(avgScore)}%. Keep up the great work!`,
      icon: '🌟'
    });
  }
  
  // Streak analysis
  const recentScores = userScores.slice(-5);
  const passingStreak = recentScores.filter(score => score.percentage >= 60).length;
  if (passingStreak === 5) {
    insights.push({
      type: 'success',
      title: 'Perfect Streak!',
      message: 'You\'ve passed your last 5 quizzes. Amazing consistency!',
      icon: '🔥'
    });
  }
  
  return insights;
};

// Validate quiz answers
export const validateQuizAnswers = (answers, questions) => {
  const errors = [];
  
  questions.forEach((question, index) => {
    const answer = answers.find(a => a.question_id === question._id);
    if (!answer) {
      errors.push(`Question ${index + 1} is unanswered`);
    } else if (answer.selected_option < 1 || answer.selected_option > 4) {
      errors.push(`Question ${index + 1} has invalid answer selection`);
    }
  });
  
  return errors;
};

// Calculate time spent per question
export const calculateTimeAnalytics = (startTime, endTime, questionCount) => {
  const totalTimeSpent = Math.floor((endTime - startTime) / 1000); // in seconds
  const averageTimePerQuestion = Math.floor(totalTimeSpent / questionCount);
  
  return {
    totalTimeSpent,
    averageTimePerQuestion,
    formattedTotalTime: formatTime(totalTimeSpent),
    formattedAverageTime: formatTime(averageTimePerQuestion)
  };
};

// Generate performance report
export const generatePerformanceReport = (userScores, questions) => {
  if (userScores.length === 0) return null;
  
  const totalAttempts = userScores.length;
  const averageScore = userScores.reduce((sum, score) => sum + score.percentage, 0) / totalAttempts;
  const bestScore = Math.max(...userScores.map(score => score.percentage));
  const recentScore = userScores[userScores.length - 1]?.percentage || 0;
  
  const subjectPerformance = {};
  userScores.forEach(score => {
    const quiz = score.quiz_id;
    if (quiz && quiz.chapter_id && quiz.chapter_id.subject_id) {
      const subjectName = quiz.chapter_id.subject_id.name;
      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = [];
      }
      subjectPerformance[subjectName].push(score.percentage);
    }
  });
  
  const subjectAverages = Object.entries(subjectPerformance).map(([subject, scores]) => ({
    subject,
    average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    attempts: scores.length
  }));
  
  return {
    totalAttempts,
    averageScore: Math.round(averageScore),
    bestScore,
    recentScore,
    subjectPerformance: subjectAverages,
    trend: calculatePerformanceTrend(userScores),
    insights: generateQuizInsights(userScores, questions)
  };
};

export default {
  shuffleArray,
  randomizeQuiz,
  calculateQuizStats,
  formatTime,
  parseTimeToSeconds,
  getDifficultyLevel,
  calculatePerformanceTrend,
  generateQuizInsights,
  validateQuizAnswers,
  calculateTimeAnalytics,
  generatePerformanceReport
}; 