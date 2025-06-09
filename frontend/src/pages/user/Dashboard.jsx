import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subjectsAPI, scoresAPI, quizzesAPI, questionsAPI, chaptersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'scores', 'summary', 'quiz', 'quiz-view'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [userScores, setUserScores] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // Quiz states
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(null);
  const [showQuizView, setShowQuizView] = useState(false);
  const [selectedQuizView, setSelectedQuizView] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  useEffect(() => {
    fetchData();
  }, []);

  // Timer effect for quiz
  useEffect(() => {
    let interval = null;
    if (view === 'quiz' && timer > 0 && !isSubmitting) { // Don't run timer if submitting
      interval = setInterval(() => {
        setTimer(timer => {
          if (timer <= 1) {
            // Auto-submit when timer reaches 0
            setTimeout(() => {
              handleSubmitQuiz();
            }, 100);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [view, timer, isSubmitting]); // Add isSubmitting to dependencies

  const fetchData = async () => {
    try {
      console.log('=== USER DASHBOARD: Fetching data ===');
      const [subjectsRes, quizzesRes, scoresRes, chaptersRes, questionsRes] = await Promise.all([
        subjectsAPI.getAll(),
        quizzesAPI.getAll(),
        scoresAPI.getAll(), // Now automatically returns current user's scores
        chaptersAPI.getAll(),
        questionsAPI.getAll()
      ]);
      
      console.log('=== USER DASHBOARD: API Responses ===');
      console.log('Subjects:', subjectsRes.data);
      console.log('Quizzes:', quizzesRes.data);
      console.log('User Scores:', scoresRes.data);
      console.log('Chapters:', chaptersRes.data);
      console.log('Questions:', questionsRes.data);
      
      setSubjects(subjectsRes.data || []);
      setUpcomingQuizzes(quizzesRes.data || []);
      setUserScores(scoresRes.data || []);
      setChapters(chaptersRes.data || []);
      setQuestions(questionsRes.data || []);
      
      console.log('=== USER DASHBOARD: State set ===');
      console.log('Total quizzes loaded:', (quizzesRes.data || []).length);
      console.log('Total questions loaded:', (questionsRes.data || []).length);
      console.log('User scores loaded:', (scoresRes.data || []).length);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionsByQuiz = (quizId) => {
    console.log(`\n=== getQuestionsByQuiz Debug (User Dashboard) ===`);
    console.log('Looking for quiz_id:', quizId);
    console.log('All questions:', questions);
    
    const result = questions.filter(question => {
      // Handle both ObjectId and string comparison, and populated quiz_id objects
      let questionQuizId;
      
      if (typeof question.quiz_id === 'object' && question.quiz_id !== null) {
        // If quiz_id is populated (object), get the _id or id field
        questionQuizId = question.quiz_id._id || question.quiz_id.id || question.quiz_id.toString();
      } else {
        // If quiz_id is just a string/ObjectId
        questionQuizId = question.quiz_id;
      }
      
      console.log(`Question ${question._id}: quiz_id = ${questionQuizId} (type: ${typeof questionQuizId})`);
      console.log(`Comparing: "${questionQuizId}" === "${quizId}" = ${questionQuizId === quizId}`);
      
      // Multiple comparison methods to ensure matching
      return questionQuizId === quizId || 
             questionQuizId === String(quizId) || 
             String(questionQuizId) === String(quizId);
    });
    
    console.log(`Found ${result.length} questions for quiz ${quizId}:`, result);
    return result;
  };

  const getChapterById = (chapterId) => {
    // Handle both string IDs and populated objects
    const targetId = typeof chapterId === 'object' ? chapterId._id || chapterId.id : chapterId;
    return chapters.find(c => c._id === targetId || c.id === targetId);
  };

  const getSubjectById = (subjectId) => {
    // Handle both string IDs and populated objects
    const targetId = typeof subjectId === 'object' ? subjectId._id || subjectId.id : subjectId;
    return subjects.find(s => s._id === targetId || s.id === targetId);
  };

  const hasUserAttemptedQuiz = (quizId) => {
    return userScores.some(score => {
      // Handle both string IDs and populated objects, with null check
      if (!score.quiz_id) return false; // Skip if quiz_id is null or undefined
      
      const scoreQuizId = typeof score.quiz_id === 'object' && score.quiz_id !== null 
        ? score.quiz_id._id || score.quiz_id.id 
        : score.quiz_id;
      return scoreQuizId === quizId || scoreQuizId === String(quizId) || String(scoreQuizId) === String(quizId);
    });
  };

  const handleStartQuiz = (quiz) => {
    // Check if user has already attempted this quiz
    if (hasUserAttemptedQuiz(quiz._id)) {
      alert('You have already attempted this quiz! Check your scores to see your results.');
      return;
    }

    const quizQuestions = getQuestionsByQuiz(quiz._id);
    if (quizQuestions.length === 0) {
      alert('No questions available for this quiz');
      return;
    }
    
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimer(quiz.time_duration * 60); // Convert minutes to seconds - using correct field
    setIsSubmitting(false); // Reset submitting state
    setView('quiz');
  };

  const handleViewQuiz = (quiz) => {
    setSelectedQuizView(quiz);
    setShowQuizView(true);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSaveAndNext = () => {
    if (currentQuestionIndex < getQuestionsByQuiz(currentQuiz._id).length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz || isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true); // Set submitting state
    
    try {
      const quizQuestions = getQuestionsByQuiz(currentQuiz._id);
      let correctAnswers = 0;
      const formattedAnswers = [];
      
      // Calculate score and format answers for backend
      quizQuestions.forEach(question => {
        const userAnswer = answers[question._id];
        const isCorrect = userAnswer !== undefined && userAnswer === question.correct_option - 1;
        
        if (isCorrect) {
          correctAnswers++;
        }
        
        // Format answer for backend (only if user answered)
        if (userAnswer !== undefined) {
          formattedAnswers.push({
            question_id: question._id,
            selected_option: userAnswer + 1, // Convert 0-based to 1-based
            is_correct: isCorrect
          });
        }
      });
      
      // Prepare score data for backend
      const scoreData = {
        quiz_id: currentQuiz._id,
        total_scored: correctAnswers, // Backend expects 'total_scored'
        answers: formattedAnswers // Backend expects array of answer objects
      };
      
      console.log('Submitting quiz with data:', scoreData);
      
      // Submit to backend
      await scoresAPI.submitQuiz(scoreData);
      
      // Stop the timer immediately
      setTimer(0);
      
      alert(`Quiz submitted successfully! You scored ${correctAnswers}/${quizQuestions.length} (${Math.round((correctAnswers/quizQuestions.length)*100)}%)`);
      
      // Reset quiz state
      setView('dashboard');
      setCurrentQuiz(null);
      setAnswers({});
      setTimer(null);
      setCurrentQuestionIndex(0);
      setIsSubmitting(false);
      
      // Refresh data to show new score
      fetchData();
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsSubmitting(false); // Reset submitting state on error
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already attempted')) {
        // Stop the timer for already attempted quiz
        setTimer(0);
        alert('You have already attempted this quiz!');
        
        // Exit quiz mode
        setView('dashboard');
        setCurrentQuiz(null);
        setAnswers({});
        setTimer(null);
        setCurrentQuestionIndex(0);
      } else {
        alert('Error submitting quiz: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Navigation Bar Component - matching wireframe exactly
  const NavigationBar = () => (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4" style={{ borderRadius: '12px', border: '1px solid #e9ecef' }}>
      <div className="container-fluid px-4">

        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          style={{ boxShadow: 'none' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link px-3 py-2 rounded-pill me-2 ${view === 'dashboard' ? 'active bg-primary text-white' : 'text-dark'}`}
                style={{ 
                  border: 'none',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onClick={() => {
                  if (view === 'quiz') {
                    setCurrentQuiz(null);
                    setTimer(null);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setIsSubmitting(false);
                  }
                  setView('dashboard');
                }}
                onMouseEnter={(e) => {
                  if (view !== 'dashboard') {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.color = '#007bff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'dashboard') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#212529';
                  }
                }}
              >
                <i className="bi bi-house-door me-2"></i>
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link px-3 py-2 rounded-pill me-2 ${view === 'scores' ? 'active bg-primary text-white' : 'text-dark'}`}
                style={{ 
                  border: 'none',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onClick={() => {
                  if (view === 'quiz') {
                    setCurrentQuiz(null);
                    setTimer(null);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setIsSubmitting(false);
                  }
                  setView('scores');
                }}
                onMouseEnter={(e) => {
                  if (view !== 'scores') {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.color = '#007bff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'scores') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#212529';
                  }
                }}
              >
                <i className="bi bi-bar-chart me-2"></i>
                My Scores
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link px-3 py-2 rounded-pill me-2 ${view === 'summary' ? 'active bg-primary text-white' : 'text-dark'}`}
                style={{ 
                  border: 'none',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onClick={() => {
                  if (view === 'quiz') {
                    setCurrentQuiz(null);
                    setTimer(null);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setIsSubmitting(false);
                  }
                  setView('summary');
                }}
                onMouseEnter={(e) => {
                  if (view !== 'summary') {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.color = '#007bff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'summary') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#212529';
                  }
                }}
              >
                <i className="bi bi-pie-chart me-2"></i>
                Analytics
              </button>
            </li>
          </ul>

          {/* Search Bar */}
          <div className="d-flex align-items-center me-3">
            <div className="input-group" style={{ width: '250px' }}>
              <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '12px 0 0 12px' }}>
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0 bg-light"
                placeholder="Search quizzes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderRadius: '0 12px 12px 0',
                  boxShadow: 'none',
                  border: '1px solid #e9ecef'
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </nav>
  );

  // Use the same modern navigation bar for consistency
  const ScoresNavigationBar = () => <NavigationBar />;

  // User Dashboard View - Available Quizzes
  const DashboardView = () => {
    // Get all available quizzes (not just upcoming ones)
    const getAvailableQuizzes = () => {
      // Show all quizzes that have questions, regardless of date
      return upcomingQuizzes.filter(quiz => {
        const quizQuestions = getQuestionsByQuiz(quiz._id);
        return quizQuestions.length > 0; // Only show quizzes that have questions
      }).sort((a, b) => {
        // Sort by date, with undated quizzes first, then by creation date
        if (!a.date_of_quiz && !b.date_of_quiz) {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // Newest first
        }
        if (!a.date_of_quiz) return -1;
        if (!b.date_of_quiz) return 1;
        return new Date(a.date_of_quiz) - new Date(b.date_of_quiz);
      });
    };

    const availableQuizzes = getAvailableQuizzes();

    return (
      <div className="container-fluid">
        {/* Stats Cards Row */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-journal-text text-primary fs-4"></i>
                  </div>
                </div>
                <h5 className="card-title text-primary mb-1">{availableQuizzes.length}</h5>
                <p className="card-text text-muted small">Available Quizzes</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-check-circle text-success fs-4"></i>
                  </div>
                </div>
                <h5 className="card-title text-success mb-1">{userScores.length}</h5>
                <p className="card-text text-muted small">Completed Quizzes</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-book text-info fs-4"></i>
                  </div>
                </div>
                <h5 className="card-title text-info mb-1">{subjects.length}</h5>
                <p className="card-text text-muted small">Subjects Available</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-trophy text-warning fs-4"></i>
                  </div>
                </div>
                <h5 className="card-title text-warning mb-1">
                  {userScores.length > 0 ? Math.round(userScores.reduce((acc, score) => acc + (score.total_scored || 0), 0) / userScores.length) : 0}%
                </h5>
                <p className="card-text text-muted small">Average Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Quizzes Section */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-journal-text me-2"></i>Available Quizzes
              </h5>
              <span className="badge bg-light text-primary">{availableQuizzes.length} total</span>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="text-center" style={{ width: '8%' }}>#</th>
                    <th className="text-center" style={{ width: '20%' }}>Questions</th>
                    <th className="text-center" style={{ width: '20%' }}>Date</th>
                    <th className="text-center" style={{ width: '22%' }}>Duration</th>
                    <th className="text-center" style={{ width: '30%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableQuizzes.length > 0 ? (
                    availableQuizzes.map((quiz, index) => {
                      const quizQuestions = getQuestionsByQuiz(quiz._id);
                      const chapter = getChapterById(quiz.chapter_id);
                      const subject = chapter ? getSubjectById(chapter.subject_id) : null;
                      
                      return (
                        <tr key={quiz._id}>
                          <td className="text-center fw-bold">{index + 1}</td>
                          <td className="text-center">
                            <span className="badge bg-info">{quizQuestions.length}</span>
                          </td>
                          <td className="text-center">
                            <small className="text-muted">
                              {quiz.date_of_quiz ? new Date(quiz.date_of_quiz).toLocaleDateString() : 'Available Now'}
                            </small>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary">
                              {quiz.time_duration ? 
                                `${Math.floor(quiz.time_duration / 60).toString().padStart(2, '0')}:${(quiz.time_duration % 60).toString().padStart(2, '0')}` 
                                : '00:10'
                              }
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleViewQuiz(quiz)}
                                title="View quiz details"
                              >
                                <i className="bi bi-eye me-1"></i>View
                              </button>
                              {hasUserAttemptedQuiz(quiz._id) ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary"
                                  disabled
                                  title="Already attempted"
                                >
                                  <i className="bi bi-check-circle me-1"></i>Completed
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-outline-success"
                                  onClick={() => handleStartQuiz(quiz)}
                                  title="Start quiz"
                                >
                                  <i className="bi bi-play-circle me-1"></i>Start
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                        <h5>No quizzes available</h5>
                        <p className="mb-0">Check back later for new quizzes</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Quiz Taking Interface
  const QuizView = () => {
    if (!currentQuiz) return null;
    
    const quizQuestions = getQuestionsByQuiz(currentQuiz._id);
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const chapter = getChapterById(currentQuiz.chapter_id);
    
    return (
      <div style={{
        border: '2px solid #000',
        borderRadius: '15px',
        backgroundColor: '#fff',
        padding: '30px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#007bff', margin: 0 }}>Start the Quiz</h2>
          <div style={{
            backgroundColor: timer <= 60 ? '#ffcccc' : '#cce5ff',
            padding: '8px 15px',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: timer <= 60 ? '#cc0000' : '#000'
          }}>
            {formatTime(timer)}
          </div>
        </div>

        {/* Question Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffcc',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Q No. {currentQuestionIndex + 1}/{quizQuestions.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666'
          }}>
            Subject: {chapter?.name || 'Unknown'}
          </div>
        </div>

        {/* Question Statement */}
        <div style={{
          border: '2px solid #007bff',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '25px',
          textAlign: 'left',
          fontSize: '18px',
          fontWeight: 'bold',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ marginBottom: '10px', color: '#007bff' }}>
              {currentQuestion?.question_title || `Question ${currentQuestionIndex + 1}`}
            </div>
            <div>
              {currentQuestion?.question_statement || 'Question Statement...'}
            </div>
          </div>
        </div>

        {/* Options */}
        <div style={{ marginBottom: '30px' }}>
          {currentQuestion ? (
            [
              { text: currentQuestion.option1, value: 0 },
              { text: currentQuestion.option2, value: 1 },
              { text: currentQuestion.option3, value: 2 },
              { text: currentQuestion.option4, value: 3 }
            ].map((option, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px',
                fontSize: '16px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: answers[currentQuestion._id] === option.value ? '#e3f2fd' : '#fff'
              }}
              onClick={() => handleAnswerSelect(currentQuestion._id, option.value)}
              >
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="quiz-option"
                  value={option.value}
                  checked={answers[currentQuestion._id] === option.value}
                  onChange={() => handleAnswerSelect(currentQuestion._id, option.value)}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '12px',
                    accentColor: '#007bff'
                  }}
                />
                <label 
                  htmlFor={`option-${index}`}
                  style={{ cursor: 'pointer', userSelect: 'none', flex: 1 }}
                >
                  {index + 1}) {option.text}
                </label>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No question data available
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <button
            onClick={handleSaveAndNext}
            disabled={currentQuestionIndex >= quizQuestions.length - 1 || isSubmitting}
            style={{
              backgroundColor: (currentQuestionIndex >= quizQuestions.length - 1 || isSubmitting) ? '#f0f0f0' : '#cce5ff',
              border: '2px solid #007bff',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (currentQuestionIndex >= quizQuestions.length - 1 || isSubmitting) ? 'not-allowed' : 'pointer',
              opacity: (currentQuestionIndex >= quizQuestions.length - 1 || isSubmitting) ? 0.6 : 1
            }}
          >
            Save and Next
          </button>
          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#f0f0f0' : '#d4edda',
              border: '2px solid #28a745',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: isSubmitting ? '#666' : '#28a745',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    );
  };

  // Scores View
  const ScoresView = () => {
    // Get user's scores with quiz and subject information
    const getUserScoresWithDetails = () => {
      return userScores.map(score => {
        // Find the quiz for this score - handle null quiz_id and different ID formats
        let quiz = null;
        if (score.quiz_id) {
          // Handle both string IDs and populated objects
          const scoreQuizId = typeof score.quiz_id === 'object' && score.quiz_id !== null 
            ? score.quiz_id._id || score.quiz_id.id 
            : score.quiz_id;
          
          quiz = upcomingQuizzes.find(q => {
            return q._id === scoreQuizId || q._id === String(scoreQuizId) || String(q._id) === String(scoreQuizId);
          });
        }
        const chapter = quiz ? getChapterById(quiz.chapter_id) : null;
        const subject = chapter ? getSubjectById(chapter.subject_id) : null;
        
        // Calculate total questions from the quiz's questions
        const quizQuestions = quiz ? getQuestionsByQuiz(quiz._id) : [];
        const totalQuestions = quizQuestions.length || score.answers?.length || 0;
        
        return {
          ...score,
          quiz: quiz,
          chapter: chapter,
          subject: subject,
          quizTitle: quiz?.remarks || (chapter?.name ? `Quiz - ${chapter.name}` : 'Unknown Quiz'),
          subjectName: subject?.name || 'Unknown Subject',
          formattedDate: score.time_stamp_of_attempt ? new Date(score.time_stamp_of_attempt).toLocaleDateString() : 
                        (score.createdAt ? new Date(score.createdAt).toLocaleDateString() : 'N/A'),
          scoreDisplay: `${score.total_scored || 0}/${totalQuestions}`,
          percentage: totalQuestions > 0 ? Math.round(((score.total_scored || 0) / totalQuestions) * 100) : 0,
          totalQuestions: totalQuestions
        };
      });
    };

    const scoresWithDetails = getUserScoresWithDetails();

    // Filter scores based on search term
    const filteredScores = scoresWithDetails.filter(score => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      
      // Search by date
      if (score.formattedDate.toLowerCase().includes(searchLower)) return true;
      
      // Search by score
      if (score.scoreDisplay.toLowerCase().includes(searchLower)) return true;
      
      // Search by subject name
      if (score.subjectName.toLowerCase().includes(searchLower)) return true;
      
      // Search by quiz title
      if (score.quizTitle.toLowerCase().includes(searchLower)) return true;
      
      // Search by percentage
      if (score.percentage.toString().includes(searchLower)) return true;
      
      return false;
    });

    const displayScores = searchTerm ? filteredScores : scoresWithDetails;

    return (
      <div className="container-fluid">
        {/* Search Info */}
        <div className="alert alert-info d-flex align-items-center mb-4">
          <i className="bi bi-info-circle me-2"></i>
          <span>Search across subjects, quizzes, dates, and scores using the search bar above</span>
        </div>

        {/* Stats Row */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-check-circle-fill text-success fs-4"></i>
                  </div>
                </div>
                <h4 className="text-success mb-1">{displayScores.length}</h4>
                <p className="text-muted small mb-0">Attempts Made</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-percent text-primary fs-4"></i>
                  </div>
                </div>
                <h4 className="text-primary mb-1">
                  {displayScores.length > 0 ? 
                    Math.round(displayScores.reduce((acc, score) => acc + score.percentage, 0) / displayScores.length) : 0}%
                </h4>
                <p className="text-muted small mb-0">Average Score</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-trophy-fill text-warning fs-4"></i>
                  </div>
                </div>
                <h4 className="text-warning mb-1">
                  {displayScores.length > 0 ? Math.max(...displayScores.map(s => s.percentage)) : 0}%
                </h4>
                <p className="text-muted small mb-0">Best Score</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-graph-up text-info fs-4"></i>
                  </div>
                </div>
                <h4 className="text-info mb-1">
                  {displayScores.length > 0 ? displayScores.reduce((acc, score) => acc + score.totalQuestions, 0) : 0}
                </h4>
                <p className="text-muted small mb-0">Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scores Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>Quiz Scores
              </h5>
              <span className="badge bg-light text-primary">{displayScores.length} scores</span>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="text-center" style={{ width: '10%' }}>#</th>
                    <th className="text-center" style={{ width: '25%' }}>Quiz</th>
                    <th className="text-center" style={{ width: '20%' }}>Subject</th>
                    <th className="text-center" style={{ width: '15%' }}>Questions</th>
                    <th className="text-center" style={{ width: '15%' }}>Date</th>
                    <th className="text-center" style={{ width: '15%' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {displayScores.length > 0 ? (
                    displayScores.map((score, index) => (
                      <tr key={score._id || index}>
                        <td className="text-center fw-bold">{index + 1}</td>
                        <td className="text-center">
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }} title={score.quizTitle}>
                            {score.quizTitle}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-secondary">{score.subjectName}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info">{score.totalQuestions}</span>
                        </td>
                        <td className="text-center">
                          <small className="text-muted">{score.formattedDate}</small>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center">
                            <span className={`badge ${score.percentage >= 80 ? 'bg-success' : score.percentage >= 60 ? 'bg-warning' : 'bg-danger'} me-2`}>
                              {score.percentage}%
                            </span>
                            <small className="text-muted">({score.scoreDisplay})</small>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                        <h5>{searchTerm ? `No scores found matching "${searchTerm}"` : 'No quiz scores yet'}</h5>
                        <p className="mb-0">
                          {searchTerm ? 'Try a different search term' : 'Take a quiz to see your results here!'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Summary Charts View
  const SummaryView = () => {
    // Calculate subject-wise quiz attempts from real data
    const getSubjectWiseData = () => {
      const subjectData = {};
      
      // Get subject-wise quiz attempts from user scores
      userScores.forEach(score => {
        // Handle null quiz_id
        if (!score.quiz_id) return;
        
        // Find the quiz that was attempted
        const quiz = upcomingQuizzes.find(q => {
          const scoreQuizId = typeof score.quiz_id === 'object' && score.quiz_id !== null 
            ? score.quiz_id._id || score.quiz_id.id 
            : score.quiz_id;
          return q._id === scoreQuizId || q._id === String(scoreQuizId) || String(q._id) === String(scoreQuizId);
        });
        
        if (quiz) {
          // Get chapter and subject information
          const chapter = getChapterById(quiz.chapter_id);
          if (chapter) {
            const subject = getSubjectById(chapter.subject_id);
            if (subject) {
              if (!subjectData[subject.name]) {
                subjectData[subject.name] = {
                  attempts: 0
                };
              }
              subjectData[subject.name].attempts += 1;
            }
          }
        }
      });
      
      // If no real data, show a message chart
      if (Object.keys(subjectData).length === 0) {
        return {
          attempts: {
            labels: ['No Quizzes Attempted'],
            data: [0]
          }
        };
      }
      
      return {
        attempts: {
          labels: Object.keys(subjectData),
          data: Object.values(subjectData).map(d => d.attempts)
        }
      };
    };

    // Calculate monthly quiz attempts from real data
    const getMonthlyAttempts = () => {
      const monthlyAttempts = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      userScores.forEach(score => {
        const attemptDate = score.time_stamp_of_attempt || score.createdAt;
        if (attemptDate) {
          const date = new Date(attemptDate);
          const monthKey = monthNames[date.getMonth()];
          monthlyAttempts[monthKey] = (monthlyAttempts[monthKey] || 0) + 1;
        }
      });
      
      // If no real data, show message
      if (Object.keys(monthlyAttempts).length === 0) {
        return {
          labels: ['No Quizzes Attempted'],
          data: [0]
        };
      }
      
      return {
        labels: Object.keys(monthlyAttempts),
        data: Object.values(monthlyAttempts)
      };
    };

    const subjectData = getSubjectWiseData();
    const monthlyAttemptsData = getMonthlyAttempts();

    // Subject wise attempts data
    const subjectAttemptsChartData = {
      labels: subjectData.attempts.labels,
      datasets: [{
        label: 'Number of Quizzes Attempted',
        data: subjectData.attempts.data,
        backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCE56', '#FF6384', '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0', '#FF6384']
      }]
    };

    // Month wise no.of quizzes attempted (pie chart)
    const monthlyAttemptsChartData = {
      labels: monthlyAttemptsData.labels,
      datasets: [{
        data: monthlyAttemptsData.data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
      }]
    };

    return (
      <div>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px' }}>
          {/* Subject-wise Attempts */}
          <div style={{
            width: '48%',
            border: '2px solid #000',
            borderRadius: '15px',
            backgroundColor: '#fff',
            minWidth: '450px'
          }}>
            <div style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '15px',
              borderRadius: '13px 13px 0 0',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              Subject wise no.of quizzes attempted
            </div>
            <div style={{ padding: '20px', height: '350px' }}>
              <Bar 
                data={subjectAttemptsChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${context.parsed.y} quiz${context.parsed.y !== 1 ? 'es' : ''}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          {/* Monthly Attempts */}
          <div style={{
            width: '48%',
            border: '2px solid #000',
            borderRadius: '15px',
            backgroundColor: '#fff',
            minWidth: '450px'
          }}>
            <div style={{
              backgroundColor: '#6f42c1',
              color: 'white',
              padding: '15px',
              borderRadius: '13px 13px 0 0',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              Month wise no.of quizzes attempted
            </div>
            <div style={{ 
              padding: '20px', 
              height: '350px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ width: '300px', height: '300px' }}>
                <Pie 
                  data={monthlyAttemptsChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                              return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                return {
                                  text: `${label}: ${value} quiz${value !== 1 ? 'es' : ''}`,
                                  fillStyle: data.datasets[0].backgroundColor[i],
                                  strokeStyle: data.datasets[0].backgroundColor[i],
                                  lineWidth: 0,
                                  index: i
                                };
                              });
                            }
                            return [];
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return `${label}: ${value} quiz${value !== 1 ? 'es' : ''} attempted`;
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Quiz View Modal
  const QuizViewModal = () => {
    if (!showQuizView || !selectedQuizView) return null;
    
    const chapter = getChapterById(selectedQuizView.chapter_id);
    const subject = chapter ? getSubjectById(chapter.subject_id) : null;
    const quizQuestions = getQuestionsByQuiz(selectedQuizView._id);
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '2px solid #000',
          borderRadius: '15px',
          padding: '30px',
          width: '500px',
          maxWidth: '90vw'
        }}>
          <h3 style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            color: '#007bff'
          }}>
            View the Quiz
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', marginBottom: '15px' }}>
              <label style={{ width: '200px', fontWeight: 'bold', color: '#007bff' }}>
                ID :
              </label>
              <input 
                type="text" 
                value="xx" 
                readOnly
                style={{
                  flex: 1,
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', marginBottom: '15px' }}>
              <label style={{ width: '200px', fontWeight: 'bold', color: '#007bff' }}>
                Subject :
              </label>
              <input 
                type="text" 
                value={subject?.name || 'Mathematics'} 
                readOnly
                style={{
                  flex: 1,
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', marginBottom: '15px' }}>
              <label style={{ width: '200px', fontWeight: 'bold', color: '#007bff' }}>
                Chapter :
              </label>
              <input 
                type="text" 
                value={chapter?.name || 'Random Variables'} 
                readOnly
                style={{
                  flex: 1,
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', marginBottom: '15px' }}>
              <label style={{ width: '200px', fontWeight: 'bold', color: '#007bff' }}>
                Number of Questions :
              </label>
              <input 
                type="text" 
                value={quizQuestions.length.toString().padStart(2, '0')} 
                readOnly
                style={{
                  flex: 1,
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', marginBottom: '15px' }}>
              <label style={{ width: '200px', fontWeight: 'bold', color: '#007bff' }}>
                Scheduled Date :
              </label>
              <input 
                type="text" 
                value={selectedQuizView.date_of_quiz ? new Date(selectedQuizView.date_of_quiz).toLocaleDateString() : 'dd/mm/yyyy'} 
                readOnly
                style={{
                  flex: 1,
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', marginBottom: '15px' }}>
              <label style={{ width: '200px', fontWeight: 'bold', color: '#007bff' }}>
                Duration(hh:mm) :
              </label>
              <input 
                type="text" 
                value={`${Math.floor(selectedQuizView.time_duration / 60).toString().padStart(2, '0')}:${(selectedQuizView.time_duration % 60).toString().padStart(2, '0')}`} 
                readOnly
                style={{
                  flex: 1,
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}
              />
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowQuizView(false)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 30px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid p-4">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
          <h1 className="text-primary fw-bold mb-3 mb-md-0">
            <i className={`bi ${
              view === 'quiz' ? 'bi-play-circle' : 
              view === 'scores' ? 'bi-trophy' :
              view === 'summary' ? 'bi-graph-up' : 'bi-speedometer2'
            } me-2`}></i>
            {view === 'quiz' ? 'Quiz in Progress' : 
             view === 'scores' ? 'Quiz Scores' :
             view === 'summary' ? 'Performance Summary' : 'Dashboard'}
          </h1>
          {view !== 'quiz' && (
            <div className="d-flex align-items-center gap-2 text-muted">
              <i className="bi bi-calendar3"></i>
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        {view === 'scores' ? <ScoresNavigationBar /> : <NavigationBar />}
        
        {/* Content Views */}
        <div className="row">
          <div className="col-12">
            {view === 'dashboard' && <DashboardView />}
            {view === 'quiz' && <QuizView />}
            {view === 'scores' && <ScoresView />}
            {view === 'summary' && <SummaryView />}
          </div>
        </div>
        
        {/* Quiz View Modal */}
        <QuizViewModal />
      </div>
    </div>
  );
};

export default UserDashboard; 