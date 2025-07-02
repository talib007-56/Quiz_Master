import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scoresAPI, questionsAPI } from '../../../services/api';
import { calculateQuizStats, getDifficultyLevel, formatTime, generateQuizInsights } from '../../../utils/quizUtils';

const QuizReview = () => {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCorrectOnly, setShowCorrectOnly] = useState(false);
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);

  useEffect(() => {
    fetchReviewData();
  }, [scoreId]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the score details
      const scoreResponse = await scoresAPI.getById(scoreId);
      const score = scoreResponse.data;
      
      // Get all questions for this quiz
      const questionsResponse = await questionsAPI.getByQuiz(score.quiz_id._id);
      const allQuestions = questionsResponse.data;
      
      // Combine score data with question details
      const questionsWithAnswers = allQuestions.map(question => {
        const userAnswer = score.answers.find(ans => 
          ans.question_id === question._id || 
          ans.question_id === question._id.toString()
        );
        
        return {
          ...question,
          userAnswer: userAnswer ? userAnswer.selected_option : null,
          isCorrect: userAnswer ? userAnswer.is_correct : false,
          wasAnswered: !!userAnswer
        };
      });
      
      // Calculate advanced analytics
      const stats = calculateQuizStats(score.answers, allQuestions);
      const difficultyLevel = getDifficultyLevel(stats.percentage);
      const insights = generateQuizInsights([score], allQuestions);
      
      // Time analytics removed as requested

              setReviewData({
          score,
          questions: questionsWithAnswers,
          stats,
          difficultyLevel,
          insights,
          totalQuestions: allQuestions.length,
          answeredQuestions: score.answers.length,
          correctAnswers: score.total_scored,
          incorrectAnswers: score.answers.length - score.total_scored,
          unansweredQuestions: allQuestions.length - score.answers.length,
          percentage: Math.round((score.total_scored / allQuestions.length) * 100)
        });
      
    } catch (error) {
      console.error('Error fetching review data:', error);
      setError('Failed to load quiz review data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQuestions = () => {
    if (!reviewData) return [];
    
    let filtered = reviewData.questions;
    
    if (showCorrectOnly) {
      filtered = filtered.filter(q => q.isCorrect);
    } else if (showIncorrectOnly) {
      filtered = filtered.filter(q => !q.isCorrect && q.wasAnswered);
    }
    
    return filtered;
  };

  const getOptionLabel = (optionNumber) => {
    const labels = ['A', 'B', 'C', 'D'];
    return labels[optionNumber - 1] || optionNumber;
  };

  const getOptionClass = (question, optionNumber) => {
    const isCorrect = question.correct_option === optionNumber;
    const isUserAnswer = question.userAnswer === optionNumber;
    
    if (isCorrect && isUserAnswer) {
      return 'bg-success text-white'; // Correct answer chosen by user
    } else if (isCorrect) {
      return 'bg-success text-white'; // Correct answer
    } else if (isUserAnswer) {
      return 'bg-danger text-white'; // Wrong answer chosen by user
    }
    return 'bg-light'; // Other options
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/user')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          No review data available.
        </div>
      </div>
    );
  }

  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quiz Review</h2>
          <p className="text-muted mb-0">
            {reviewData.score.quiz_id.chapter_id?.name} - {reviewData.score.quiz_id.chapter_id?.subject_id?.name}
          </p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/user')}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>

      {/* Advanced Analytics Section */}
      <div className="row mb-4">
        {/* Performance Summary */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Performance Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <div className="border-end">
                    <h3 className="text-primary mb-1">{reviewData.stats.score}</h3>
                    <small className="text-muted">Score</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border-end">
                    <h3 className="text-success mb-1">{reviewData.stats.correctAnswers}</h3>
                    <small className="text-muted">Correct</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border-end">
                    <h3 className="text-danger mb-1">{reviewData.stats.incorrectAnswers}</h3>
                    <small className="text-muted">Incorrect</small>
                  </div>
                </div>
                <div className="col-3">
                  <h3 className="text-warning mb-1">{reviewData.stats.unansweredQuestions}</h3>
                  <small className="text-muted">Unanswered</small>
                </div>
              </div>
              
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2">Accuracy:</span>
                    <div className="progress flex-grow-1 me-2" style={{ height: '20px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${reviewData.stats.accuracy}%` }}
                      >
                        {reviewData.stats.accuracy}%
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-2">Overall:</span>
                    <div className="progress flex-grow-1 me-2" style={{ height: '20px' }}>
                      <div 
                        className={`progress-bar ${
                          reviewData.stats.percentage >= 80 ? 'bg-success' :
                          reviewData.stats.percentage >= 60 ? 'bg-warning' : 'bg-danger'
                        }`}
                        style={{ width: `${reviewData.stats.percentage}%` }}
                      >
                        {reviewData.stats.percentage}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-center">
                    <div className={`badge fs-6 mb-2`} style={{ backgroundColor: reviewData.difficultyLevel.color, color: 'white' }}>
                      {reviewData.difficultyLevel.icon} {reviewData.difficultyLevel.level}
                    </div>
                    <br />
                    <small className="text-muted">Performance Level</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Insights Section */}
      {reviewData.insights && reviewData.insights.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">
                  <i className="bi bi-lightbulb me-2"></i>
                  Performance Insights
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {reviewData.insights.map((insight, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className={`alert alert-${insight.type} d-flex align-items-center mb-0`}>
                        <span className="me-2 fs-5">{insight.icon}</span>
                        <div>
                          <strong>{insight.title}</strong>
                          <br />
                          <small>{insight.message}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Question Details */}
      {currentQuestion && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">{currentQuestion.question_title}</h5>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <h6 className="fw-bold">Question:</h6>
              <p className="mb-0">{currentQuestion.question_statement}</p>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold">Options:</h6>
              <div className="row">
                {[1, 2, 3, 4].map(optionNum => (
                  <div key={optionNum} className="col-md-6 mb-2">
                    <div className={`p-3 rounded border ${getOptionClass(currentQuestion, optionNum)}`}>
                      <div className="d-flex align-items-center">
                        <span className="me-2 fw-bold">
                          {getOptionLabel(optionNum)}.
                        </span>
                        <span className="flex-grow-1">
                          {currentQuestion[`option${optionNum}`]}
                        </span>
                        <div className="ms-2">
                          {currentQuestion.correct_option === optionNum && (
                            <i className="bi bi-check-circle text-success" title="Correct Answer"></i>
                          )}
                          {currentQuestion.userAnswer === optionNum && currentQuestion.correct_option !== optionNum && (
                            <i className="bi bi-x-circle text-danger" title="Your Answer"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Analysis */}
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <i className="bi bi-info-circle me-2"></i>Answer Analysis
              </h6>
              <div className="mb-2">
                <strong>Correct Answer:</strong> {getOptionLabel(currentQuestion.correct_option)} - {currentQuestion[`option${currentQuestion.correct_option}`]}
              </div>
              {currentQuestion.wasAnswered && (
                <div className="mb-2">
                  <strong>Your Answer:</strong> {getOptionLabel(currentQuestion.userAnswer)} - {currentQuestion[`option${currentQuestion.userAnswer}`]}
                </div>
              )}
              <div>
                <strong>Result:</strong> 
                {currentQuestion.isCorrect ? (
                  <span className="text-success ms-1">
                    <i className="bi bi-check-circle me-1"></i>Correct! Well done.
                  </span>
                ) : currentQuestion.wasAnswered ? (
                  <span className="text-danger ms-1">
                    <i className="bi bi-x-circle me-1"></i>Incorrect. The correct answer is option {getOptionLabel(currentQuestion.correct_option)}.
                  </span>
                ) : (
                  <span className="text-warning ms-1">
                    <i className="bi bi-exclamation-circle me-1"></i>Not answered. The correct answer is option {getOptionLabel(currentQuestion.correct_option)}.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Questions Message */}
      {filteredQuestions.length === 0 && (
        <div className="alert alert-info text-center">
          <h5>No questions to display</h5>
          <p className="mb-0">
            {showCorrectOnly && 'No correct answers found.'}
            {showIncorrectOnly && 'No incorrect answers found.'}
          </p>
        </div>
      )}

      {/* Quick Navigation */}
      {filteredQuestions.length > 1 && (
        <div className="card mt-4">
          <div className="card-header">
            <h6 className="mb-0">Quick Navigation</h6>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              {filteredQuestions.map((question, index) => (
                <button
                  key={question._id}
                  className={`btn btn-sm ${
                    index === currentQuestionIndex 
                      ? 'btn-primary' 
                      : question.isCorrect 
                        ? 'btn-outline-success' 
                        : question.wasAnswered 
                          ? 'btn-outline-danger' 
                          : 'btn-outline-warning'
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                  title={
                    question.isCorrect 
                      ? 'Correct' 
                      : question.wasAnswered 
                        ? 'Incorrect' 
                        : 'Not Answered'
                  }
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizReview; 