import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionsAPI, quizzesAPI, scoresAPI } from '../../../services/api';
import { randomizeQuiz, formatTime, calculateTimeAnalytics, validateQuizAnswers } from '../../../utils/quizUtils';
import { useToast } from '../../../components/NotificationToast';

const AttemptQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  
  // Quiz data states
  const [quiz, setQuiz] = useState(null);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Quiz features states
  const [timer, setTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuizSettings, setShowQuizSettings] = useState(true);
  const [quizSettings, setQuizSettings] = useState({
    randomizeQuestions: true,
    randomizeOptions: true,
    showTimer: true,
    autoSave: true
  });
  
  // Refs
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
    
    // Load saved answers if available
    const hasLoadedAnswers = loadAnswersFromLocalStorage();
    if (hasLoadedAnswers) {
      warning('Loaded your previously saved answers. You can continue where you left off!');
    }
    
    // Set initial start time when component loads
    setQuizStartTime(Date.now());
    console.log('Setting initial quiz start time:', Date.now());
  }, [quizId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, []);

  // Timer warning effects
  useEffect(() => {
    if (timeRemaining === 300) { // 5 minutes warning
      warning('⏰ 5 minutes remaining!');
    } else if (timeRemaining === 60) { // 1 minute warning
      warning('⏰ 1 minute remaining!');
    } else if (timeRemaining === 30) { // 30 seconds warning
      warning('⏰ 30 seconds remaining!');
    }
  }, [timeRemaining]);

  const fetchQuiz = async () => {
    try {
      const response = await quizzesAPI.getById(quizId);
      setQuiz(response.data);
    } catch (error) {
      setQuiz(null);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getByQuiz(quizId);
      const fetchedQuestions = response.data || [];
      
      if (fetchedQuestions.length === 0) {
        setError('No questions available for this quiz');
        return;
      }
      
      setOriginalQuestions(fetchedQuestions);
      setQuestions(fetchedQuestions); // Will be randomized when quiz starts
      setError(null);
      
      // Update start time when questions are loaded and ready
      setQuizStartTime(Date.now());
      console.log('Updated quiz start time when questions loaded:', Date.now());
    } catch (error) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start the quiz with selected settings
  const startQuiz = () => {
    if (originalQuestions.length === 0) {
      showError('No questions available to start the quiz');
      return;
    }

    // Randomize questions if enabled
    const processedQuestions = randomizeQuiz(
      originalQuestions, 
      quizSettings.randomizeQuestions, 
      quizSettings.randomizeOptions
    );
    
    setQuestions(processedQuestions);
    setShowQuizSettings(false);
    // Update start time when quiz officially starts
    const startTime = Date.now();
    setQuizStartTime(startTime);
    console.log('Quiz officially started at:', startTime);
    
    // Set up timer if quiz has duration
    if (quiz?.time_duration && quizSettings.showTimer) {
      const durationInSeconds = quiz.time_duration * 60; // Convert minutes to seconds
      setTimeRemaining(durationInSeconds);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Set up auto-save if enabled
    if (quizSettings.autoSave) {
      autoSaveRef.current = setInterval(() => {
        saveAnswersToLocalStorage();
      }, 30000); // Auto-save every 30 seconds
    }
    
    success('Quiz started! Good luck! 🍀');
  };

  // Auto-submit when timer expires
  const handleAutoSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    warning('Time is up! Submitting your quiz automatically.');
    setTimeout(() => {
      handleSubmit(null, true);
    }, 2000);
  };

  // Save answers to localStorage for auto-save
  const saveAnswersToLocalStorage = () => {
    localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
  };

  // Load answers from localStorage
  const loadAnswersFromLocalStorage = () => {
    const saved = localStorage.getItem(`quiz_${quizId}_answers`);
    if (saved) {
      setAnswers(JSON.parse(saved));
      return true;
    }
    return false;
  };

  // Clear saved answers
  const clearSavedAnswers = () => {
    localStorage.removeItem(`quiz_${quizId}_answers`);
  };

  const handleOptionChange = (questionId, option) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: option };
      
      // Auto-save if enabled
      if (quizSettings.autoSave) {
        localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(newAnswers));
      }
      
      return newAnswers;
    });
  };

  // Navigate between questions
  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();
    
    // Validate answers
    const errors = validateQuizAnswers(
      Object.entries(answers).map(([questionId, selectedOption]) => ({
        question_id: questionId,
        selected_option: parseInt(selectedOption)
      })),
      questions
    );

    if (errors.length > 0 && !isAutoSubmit) {
      const unansweredCount = questions.length - Object.keys(answers).length;
      if (unansweredCount > 0) {
        const confirmSubmit = window.confirm(
          `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`
        );
        if (!confirmSubmit) return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);
    
    try {
      // Calculate time analytics
      const endTime = Date.now();
      console.log('Time Analytics Debug:', {
        quizStartTime,
        endTime,
        timeDiff: endTime - quizStartTime,
        questionsLength: questions.length
      });
      
      const timeAnalytics = quizStartTime ? calculateTimeAnalytics(
        quizStartTime, 
        endTime, 
        questions.length
      ) : {
        totalTimeSpent: 0,
        averageTimePerQuestion: 0,
        formattedTotalTime: '00:00:00',
        formattedAverageTime: '00:00:00'
      };
      
      console.log('Calculated Time Analytics:', timeAnalytics);

      // Prepare answers in the format expected by the backend
      const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => {
        // Find the original question to get the correct answer mapping
        const originalQuestion = originalQuestions.find(q => q._id === questionId);
        const currentQuestion = questions.find(q => q._id === questionId);
        
        // If options were randomized, map back to original option numbers
        let finalSelectedOption = parseInt(selectedOption);
        if (currentQuestion?.option_mapping && originalQuestion) {
          finalSelectedOption = currentQuestion.option_mapping[parseInt(selectedOption) - 1];
        }

        return {
          question_id: questionId,
          selected_option: finalSelectedOption
        };
      });

      const payload = {
        quiz_id: quizId,
        answers: answersArray,
        time_analytics: timeAnalytics
      };
      
      console.log('=== FRONTEND SUBMISSION DEBUG ===');
      console.log('Payload being sent:', JSON.stringify(payload, null, 2));
      console.log('================================');

      await scoresAPI.submitQuiz(payload);
      
      // Clear timers and saved data
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      clearSavedAnswers();
      
      success('Quiz submitted successfully! 🎉');
      navigate(`/user/quiz/${quizId}/results`);
      
    } catch (error) {
      setSubmitError('Failed to submit quiz. Please try again.');
      showError('Failed to submit quiz. Please try again.');
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/user')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Quiz Settings Screen
  if (showQuizSettings) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="bi bi-gear me-2"></i>
                  Quiz Settings
                </h4>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <h5>{quiz?.chapter_id?.name || 'Quiz'}</h5>
                  <p className="text-muted">
                    {questions.length} Questions • {quiz?.time_duration ? `${quiz.time_duration} minutes` : 'No time limit'}
                  </p>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-shuffle me-2"></i>
                      Randomization Options
                    </h6>
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="randomizeQuestions"
                        checked={quizSettings.randomizeQuestions}
                        onChange={(e) => setQuizSettings(prev => ({
                          ...prev,
                          randomizeQuestions: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="randomizeQuestions">
                        Randomize question order
                      </label>
                    </div>
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="randomizeOptions"
                        checked={quizSettings.randomizeOptions}
                        onChange={(e) => setQuizSettings(prev => ({
                          ...prev,
                          randomizeOptions: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="randomizeOptions">
                        Randomize answer options
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-tools me-2"></i>
                      Quiz Features
                    </h6>
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="showTimer"
                        checked={quizSettings.showTimer}
                        onChange={(e) => setQuizSettings(prev => ({
                          ...prev,
                          showTimer: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="showTimer">
                        Show timer and warnings
                      </label>
                    </div>
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoSave"
                        checked={quizSettings.autoSave}
                        onChange={(e) => setQuizSettings(prev => ({
                          ...prev,
                          autoSave: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="autoSave">
                        Auto-save answers
                      </label>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info mt-4">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Note:</strong> Once you start the quiz, these settings cannot be changed.
                  {quiz?.time_duration && quizSettings.showTimer && (
                    <span> You will have <strong>{quiz.time_duration} minutes</strong> to complete the quiz.</span>
                  )}
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/user')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </button>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => {
                        // Skip settings and start with defaults
                        setQuizSettings({
                          randomizeQuestions: false,
                          randomizeOptions: false,
                          showTimer: true,
                          autoSave: true
                        });
                        startQuiz();
                      }}
                    >
                      <i className="bi bi-skip-forward me-2"></i>
                      Quick Start
                    </button>
                    <button 
                      className="btn btn-success btn-lg"
                      onClick={startQuiz}
                    >
                      <i className="bi bi-play-fill me-2"></i>
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Interface
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="container-fluid mt-4">
      {/* Quiz Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <h5 className="mb-1">{quiz?.chapter_id?.name || 'Quiz'}</h5>
                  <small className="text-muted">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </small>
                </div>
                <div className="col-md-4">
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    {answeredQuestions} / {questions.length} answered
                  </small>
                </div>
                <div className="col-md-4 text-end">
                  {quizSettings.showTimer && timeRemaining > 0 && (
                    <div className={`badge ${timeRemaining <= 300 ? 'bg-danger' : 'bg-primary'} fs-6`}>
                      <i className="bi bi-clock me-1"></i>
                      {formatTime(timeRemaining)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Question Navigation Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-list-ol me-2"></i>
                Questions
              </h6>
            </div>
            <div className="card-body p-2">
              <div className="row g-1">
                {questions.map((_, index) => (
                  <div key={index} className="col-3">
                    <button
                      className={`btn btn-sm w-100 ${
                        index === currentQuestionIndex 
                          ? 'btn-primary' 
                          : answers[questions[index]._id] 
                            ? 'btn-success' 
                            : 'btn-outline-secondary'
                      }`}
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auto-save indicator */}
          {quizSettings.autoSave && (
            <div className="alert alert-info mt-3 py-2">
              <i className="bi bi-cloud-check me-2"></i>
              <small>Auto-save enabled</small>
            </div>
          )}
        </div>

        {/* Main Question Area */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {currentQuestion && (
                <>
                  <div className="mb-4">
                    <h5 className="card-title mb-3">
                      Q{currentQuestionIndex + 1}. {currentQuestion.question_title}
                    </h5>
                    <p className="card-text fs-6 text-dark">
                      {currentQuestion.question_statement}
                    </p>
                  </div>

                  <div className="row">
                    {[1, 2, 3, 4].map((optionNum) => (
                      <div key={optionNum} className="col-md-6 mb-3">
                        <div 
                          className={`form-check p-3 border rounded ${
                            answers[currentQuestion._id] === optionNum.toString() 
                              ? 'border-primary bg-primary bg-opacity-10' 
                              : 'border-light'
                          }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleOptionChange(currentQuestion._id, optionNum.toString())}
                        >
                          <input
                            className="form-check-input"
                            type="radio"
                            name={currentQuestion._id}
                            id={`${currentQuestion._id}-option${optionNum}`}
                            value={optionNum.toString()}
                            checked={answers[currentQuestion._id] === optionNum.toString()}
                            onChange={() => handleOptionChange(currentQuestion._id, optionNum.toString())}
                          />
                          <label 
                            className="form-check-label w-100" 
                            htmlFor={`${currentQuestion._id}-option${optionNum}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <strong>{String.fromCharCode(64 + optionNum)}.</strong> {currentQuestion[`option${optionNum}`]}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation and Submit */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button 
              className="btn btn-outline-primary"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Previous
            </button>

            <div className="d-flex gap-2">
              {currentQuestionIndex === questions.length - 1 ? (
                <button 
                  className="btn btn-success btn-lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Submit Quiz
                    </>
                  )}
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={nextQuestion}
                >
                  Next
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              )}
            </div>
          </div>

          {submitError && (
            <div className="alert alert-danger mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {submitError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttemptQuiz; 