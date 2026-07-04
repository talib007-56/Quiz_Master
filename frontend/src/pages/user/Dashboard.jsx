import { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subjectsAPI, scoresAPI, quizzesAPI, questionsAPI, chaptersAPI, aiAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { CardSkeleton, TableSkeleton, QuizCardSkeleton, StatsSkeleton, ChartSkeleton, NavSkeleton } from '../../components/SkeletonLoader';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Standalone Navigation Bar Component to prevent re-creation
const NavigationBar = memo(({ 
  view, 
  searchTerm, 
  onSearchChange, 
  onViewChange,
  setCurrentQuiz,
  setTimer,
  setAnswers,
  setCurrentQuestionIndex,
  setIsSubmitting
}) => (
  <>
    <style>{`
      .search-input-group {
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .search-input {
        transition: all 0.3s ease;
      }
      
      .search-input:focus {
        border-color: #007bff !important;
        box-shadow: none !important;
        outline: none !important;
        border-left: none !important;
      }
      
      .search-input-group:focus-within .input-group-text {
        border-color: #007bff !important;
        border-right: none !important;
        background-color: #e7f3ff !important;
      }
      
      .search-input-group .input-group-text {
        border-right: none !important;
        transition: all 0.3s ease;
      }
      
      .search-input-group .search-input {
        border-left: none !important;
      }
      
      .search-input-group:focus-within {
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        border-radius: 12px;
        transform: scale(1.02);
      }
      
      .search-input-group:hover {
        transform: scale(1.01);
      }
      
      @media (max-width: 768px) {
        .search-input-group {
          width: 200px !important;
        }
      }
      
      @media (max-width: 576px) {
        .search-input-group {
          width: 150px !important;
        }
        
        .search-input::placeholder {
          font-size: 0.8rem;
        }
      }
    `}</style>
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
                onViewChange('dashboard');
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                if (view !== 'dashboard') {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.color = '#007bff';
                }
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
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
                onViewChange('scores');
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                if (view !== 'scores') {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.color = '#007bff';
                }
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
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
                onViewChange('summary');
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                if (view !== 'summary') {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.color = '#007bff';
                }
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
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
          <div className="input-group search-input-group" style={{ width: '250px' }}>
            <span 
              className="input-group-text bg-light border-end-0" 
              style={{ 
                borderRadius: '12px 0 0 12px',
                border: '1px solid #e9ecef',
                borderRight: 'none'
              }}
            >
              <i className="bi bi-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 bg-light search-input"
              placeholder={view === 'dashboard' ? "Search quizzes, subjects..." : view === 'scores' ? "Search scores, dates..." : "Search..."} 
              value={searchTerm}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSearchChange(e.target.value);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              onKeyUp={(e) => {
                e.stopPropagation();
              }}
              onInput={(e) => {
                e.stopPropagation();
              }}
              style={{
                borderRadius: '0 12px 12px 0',
                boxShadow: 'none',
                border: '1px solid #e9ecef',
                borderLeft: 'none'
              }}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>

      </div>
    </div>
  </nav>
  </>
));

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'scores', 'summary', 'quiz', 'quiz-view'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [userScores, setUserScores] = useState([]);
  const [userStats, setUserStats] = useState({}); // Add userStats state
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Memoized handlers to prevent input focus loss
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
    setSearchTerm(''); // Clear search when changing views
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, []);

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
      const [subjectsRes, quizzesRes, userStatsRes, allScoresRes, chaptersRes, questionsRes] = await Promise.all([
        subjectsAPI.getAll(),
        quizzesAPI.getAll(),
        scoresAPI.getUserStats(), // Use optimized user stats endpoint
        scoresAPI.getAll(), // Get all user scores for scores view
        chaptersAPI.getAll(),
        questionsAPI.getAll()
      ]);
      
      // Handle both old format (array) and new format (object with data and pagination)
      const quizzesData = Array.isArray(quizzesRes.data) ? quizzesRes.data : (quizzesRes.data?.data || []);
      const subjectsData = Array.isArray(subjectsRes.data) ? subjectsRes.data : (subjectsRes.data?.data || []);
      const userStatsData = userStatsRes.data || {};
      const allScoresData = Array.isArray(allScoresRes.data) ? allScoresRes.data : (allScoresRes.data?.data || []);
      const chaptersData = Array.isArray(chaptersRes.data) ? chaptersRes.data : (chaptersRes.data?.data || []);
      const questionsData = Array.isArray(questionsRes.data) ? questionsRes.data : (questionsRes.data?.data || []);
      
      setSubjects(subjectsData);
      setUpcomingQuizzes(quizzesData);
      setUserScores(allScoresData); // Use all scores for scores view
      setUserStats(userStatsData); // Store user stats separately
      setChapters(chaptersData);
      setQuestions(questionsData);
      
      console.log('=== USER DASHBOARD: Data loaded ===');
      console.log(`Loaded: ${quizzesData.length} quizzes, ${questionsData.length} questions, ${allScoresData.length} scores`);
      
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
    console.log('\n=== getQuestionsByQuiz Debug ===');
    console.log('Looking for quiz_id:', quizId);
    console.log('All questions:', questions);
    
    if (!quizId || !Array.isArray(questions)) {
      return [];
    }
    
    const result = questions.filter(question => {
      // Safety check for null/undefined question or quiz_id
      if (!question || !question.quiz_id || question.quiz_id === null) {
        console.log('Skipping question with null/undefined quiz_id:', question);
        return false;
      }
      
      // Handle both ObjectId and string comparison, and populated quiz_id objects
      let questionQuizId;
      
      try {
        if (typeof question.quiz_id === 'object' && question.quiz_id !== null) {
          // If quiz_id is populated (object), get the _id or id field
          questionQuizId = question.quiz_id._id || question.quiz_id.id || question.quiz_id.toString();
        } else {
          // If quiz_id is just a string/ObjectId
          questionQuizId = question.quiz_id;
        }
        
        // Multiple comparison methods to ensure matching
        const matches = questionQuizId === quizId || 
               questionQuizId === String(quizId) || 
               String(questionQuizId) === String(quizId);
               
        if (matches) {
          console.log('Found matching question:', question._id);
        }
        
        return matches;
      } catch (error) {
        console.error('Error processing question:', question, error);
        return false;
      }
    });
    
    console.log('Returning', result.length, 'questions for quiz', quizId);
    return result;
  };

  const getChapterById = (chapterId) => {
    if (!chapterId || !Array.isArray(chapters)) {
      return null;
    }
    
    // Handle both string IDs and populated objects
    const targetId = typeof chapterId === 'object' && chapterId !== null 
      ? chapterId._id || chapterId.id 
      : chapterId;
      
    return chapters.find(c => c && c._id === targetId || c.id === targetId) || null;
  };

  const getSubjectById = (subjectId) => {
    if (!subjectId || !Array.isArray(subjects)) {
      return null;
    }
    
    // Handle both string IDs and populated objects
    const targetId = typeof subjectId === 'object' && subjectId !== null 
      ? subjectId._id || subjectId.id 
      : subjectId;
      
    return subjects.find(s => s && s._id === targetId || s.id === targetId) || null;
  };

  const hasUserAttemptedQuiz = (quizId) => {
    return userScores.some(score => {
      // Handle both string IDs and populated objects, with null check
      if (!score.quiz_id || score.quiz_id === null) return false; // Skip if quiz_id is null or undefined
      
      const scoreQuizId = typeof score.quiz_id === 'object' && score.quiz_id !== null 
        ? score.quiz_id._id || score.quiz_id.id 
        : score.quiz_id;
      return scoreQuizId === quizId || scoreQuizId === String(quizId) || String(scoreQuizId) === String(quizId);
    });
  };

  const hasNewQuestionsAvailable = (quizId) => {
    const userScore = userScores.find(score => {
      if (!score.quiz_id || score.quiz_id === null) return false;
      
      const scoreQuizId = typeof score.quiz_id === 'object' && score.quiz_id !== null 
        ? score.quiz_id._id || score.quiz_id.id 
        : score.quiz_id;
      return scoreQuizId === quizId || scoreQuizId === String(quizId) || String(scoreQuizId) === String(quizId);
    });

    if (!userScore) return false; // User hasn't attempted this quiz

    // Get current questions for this quiz
    const currentQuestions = getQuestionsByQuiz(quizId);
    
    // Get questions that user answered in their last attempt
    const answeredQuestions = userScore.answers || [];
    
    // Check if there are more questions now than what user answered
    const hasNewQuestions = currentQuestions.length > answeredQuestions.length;
    
    console.log(`Quiz ${quizId}: Current questions: ${currentQuestions.length}, Answered: ${answeredQuestions.length}, Has new: ${hasNewQuestions}`);
    
    return hasNewQuestions;
  };

  const canUserAttemptQuiz = (quizId) => {
    const hasAttempted = hasUserAttemptedQuiz(quizId);
    const hasNewQuestions = hasNewQuestionsAvailable(quizId);
    
    // User can attempt if they haven't attempted before OR if there are new questions
    return !hasAttempted || hasNewQuestions;
  };

  const handleStartQuiz = (quiz) => {
    // Check if user can attempt this quiz (either new quiz or has new questions)
    if (!canUserAttemptQuiz(quiz._id)) {
      alert('You have already attempted this quiz with all available questions! Check your scores to see your results.');
      return;
    }

    const quizQuestions = getQuestionsByQuiz(quiz._id);
    if (quizQuestions.length === 0) {
      alert('No questions available for this quiz');
      return;
    }

    // If user has attempted before but there are new questions, show info
    if (hasUserAttemptedQuiz(quiz._id) && hasNewQuestionsAvailable(quiz._id)) {
      const currentQuestions = getQuestionsByQuiz(quiz._id);
      const userScore = userScores.find(score => {
        if (!score.quiz_id) return false;
        const scoreQuizId = typeof score.quiz_id === 'object' && score.quiz_id !== null 
          ? score.quiz_id._id || score.quiz_id.id 
          : score.quiz_id;
        return scoreQuizId === quiz._id || scoreQuizId === String(quiz._id);
      });
      const previouslyAnswered = userScore?.answers?.length || 0;
      
      const confirmRetake = window.confirm(
        `New questions have been added to this quiz!\n\n` +
        `Previously answered: ${previouslyAnswered} questions\n` +
        `Total questions now: ${currentQuestions.length}\n` +
        `New questions: ${currentQuestions.length - previouslyAnswered}\n\n` +
        `Would you like to attempt the quiz again with all questions?`
      );
      
      if (!confirmRetake) {
        return;
      }
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

  const handleReviewQuiz = (scoreId) => {
    // Navigate to quiz review page
    navigate(`/user/quiz-review/${scoreId}`);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAiExplanation(null);
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSaveAndNext = () => {
    if (currentQuestionIndex < getQuestionsByQuiz(currentQuiz._id).length - 1) {
      setAiExplanation(null);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleGetExplanation = async (question, chapter, subject) => {
    setAiLoading(true);
    setAiExplanation(null);
    try {
      const res = await aiAPI.explainAnswer({
        questionStatement: question.question_statement,
        options: [question.option1, question.option2, question.option3, question.option4],
        correctOption: question.correct_option,
        subject: subject?.name || '',
        chapter: chapter?.name || ''
      });
      setAiExplanation(res.data.explanation);
    } catch {
      setAiExplanation('Could not get AI explanation. Please try again.');
    } finally {
      setAiLoading(false);
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



  // User Dashboard View - Available Quizzes
  const DashboardView = () => {
    // Get all available quizzes (not just upcoming ones)
    const getAvailableQuizzes = () => {
      // Safety check: ensure upcomingQuizzes is an array
      if (!Array.isArray(upcomingQuizzes)) {
        console.warn('upcomingQuizzes is not an array:', upcomingQuizzes);
        return [];
      }
      
      // Show all quizzes, even if they don't have questions yet
      return upcomingQuizzes.filter(quiz => {
        // Basic validation - just check if quiz exists and has an ID
        return quiz && quiz._id;
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

    const allAvailableQuizzes = getAvailableQuizzes();
    
    // Simple debug info
    console.log('=== QUIZ DASHBOARD DEBUG ===');
    console.log(`Found: ${Array.isArray(upcomingQuizzes) ? upcomingQuizzes.length : 'invalid'} raw quizzes, ${allAvailableQuizzes.length} available quizzes`);
    
    // Check for unlinked questions issue
    const unlinkedQuestions = Array.isArray(questions) ? questions.filter(q => !q.quiz_id || q.quiz_id === null) : [];
    if (unlinkedQuestions.length > 0) {
      console.log(`⚠️ Warning: ${unlinkedQuestions.length} questions are not linked to any quiz`);
    }
    
    // Filter quizzes based on search term
    const filteredQuizzes = allAvailableQuizzes.filter(quiz => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Get chapter and subject for this quiz with improved ID matching
      let chapter = null;
      let subject = null;
      
      // Find chapter by quiz.chapter_id
      if (quiz && quiz.chapter_id && Array.isArray(chapters)) {
        chapter = chapters.find(c => {
          if (!c || !c._id) return false;
          const chapterId = typeof quiz.chapter_id === 'object' && quiz.chapter_id !== null 
            ? quiz.chapter_id._id || quiz.chapter_id.id 
            : quiz.chapter_id;
          return c._id === chapterId || c._id === String(chapterId) || String(c._id) === String(chapterId);
        });
      }
      
      // Find subject by chapter.subject_id
      if (chapter && chapter.subject_id && Array.isArray(subjects)) {
        subject = subjects.find(s => {
          if (!s || !s._id) return false;
          const subjectId = typeof chapter.subject_id === 'object' && chapter.subject_id !== null 
            ? chapter.subject_id._id || chapter.subject_id.id 
            : chapter.subject_id;
          return s._id === subjectId || s._id === String(subjectId) || String(s._id) === String(subjectId);
        });
      }
      
      const quizQuestions = getQuestionsByQuiz(quiz._id);
      
      // Search by quiz remarks/title
      if (quiz.remarks && quiz.remarks.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by chapter name
      if (chapter && chapter.name && chapter.name.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by subject name - this is the main fix
      if (subject && subject.name && subject.name.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by date
      if (quiz.date_of_quiz) {
        const dateString = new Date(quiz.date_of_quiz).toLocaleDateString();
        if (dateString.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
      
      // Search by duration
      if (quiz.time_duration && quiz.time_duration.toString().includes(searchLower)) {
        return true;
      }
      
      // Search by number of questions
      if (quizQuestions.length.toString().includes(searchLower)) {
        return true;
      }
      
      return false;
    });

    // Apply semester filter
    const semesterFilteredQuizzes = semesterFilter
      ? (searchTerm ? filteredQuizzes : allAvailableQuizzes).filter(quiz => {
          let chapter = null;
          if (quiz && quiz.chapter_id && Array.isArray(chapters)) {
            chapter = chapters.find(c => {
              if (!c || !c._id) return false;
              const chapterId = typeof quiz.chapter_id === 'object' && quiz.chapter_id !== null
                ? quiz.chapter_id._id || quiz.chapter_id.id : quiz.chapter_id;
              return String(c._id) === String(chapterId);
            });
          }
          if (!chapter) return false;
          const subject = subjects.find(s => {
            const subjectId = typeof chapter.subject_id === 'object' && chapter.subject_id !== null
              ? chapter.subject_id._id || chapter.subject_id.id : chapter.subject_id;
            return String(s._id) === String(subjectId);
          });
          return subject?.semester === parseInt(semesterFilter);
        })
      : (searchTerm ? filteredQuizzes : allAvailableQuizzes);

    const availableQuizzes = semesterFilteredQuizzes;

    // Get unique semesters from subjects
    const availableSemesters = [...new Set(subjects.filter(s => s.semester).map(s => s.semester))].sort((a, b) => a - b);

    return (
      <div className="container-fluid">

        {/* Semester Filter Bar */}
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <span className="fw-semibold text-muted me-1"><i className="bi bi-filter me-1"></i>Semester:</span>
          <button
            className={`btn btn-sm ${semesterFilter === '' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSemesterFilter('')}
          >
            All
          </button>
          {availableSemesters.map(sem => (
            <button
              key={sem}
              className={`btn btn-sm ${semesterFilter === String(sem) ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSemesterFilter(String(sem))}
            >
              Sem {sem}
            </button>
          ))}
        </div>

        {/* New Questions Available Notification */}
        {(() => {
          const quizzesWithNewQuestions = allAvailableQuizzes.filter(quiz => hasNewQuestionsAvailable(quiz._id));
          return quizzesWithNewQuestions.length > 0 && (
            <div className="alert alert-success d-flex align-items-center mb-4">
              <i className="bi bi-plus-circle me-2"></i>
              <span>
                <strong>Great News!</strong> {quizzesWithNewQuestions.length} quiz{quizzesWithNewQuestions.length === 1 ? ' has' : 'es have'} new questions available! 
                Look for the <span className="badge bg-warning text-dark mx-1">Retake</span> button to attempt {quizzesWithNewQuestions.length === 1 ? 'it' : 'them'} again.
              </span>
            </div>
          );
        })()}

        {/* Search Info */}
        {searchTerm && (
          <div className="alert alert-info d-flex align-items-center mb-4">
            <i className="bi bi-search me-2"></i>
            <span>
              {availableQuizzes.length > 0 
                ? `Found ${availableQuizzes.length} quiz${availableQuizzes.length === 1 ? '' : 'es'} matching "${searchTerm}"`
                : `No quizzes found matching "${searchTerm}"`
              }
            </span>
            {searchTerm && (
              <button 
                className="btn btn-sm btn-outline-secondary ms-auto"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

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
                <h5 className="card-title text-success mb-1">{userStats.totalAttempts || 0}</h5>
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
                  {Math.round(userStats.averageScore || 0)}%
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
                    <th className="text-center" style={{ width: '5%' }}>#</th>
                    <th className="text-center" style={{ width: '20%' }}>Subject</th>
                    <th className="text-center" style={{ width: '20%' }}>Chapter</th>
                    <th className="text-center" style={{ width: '10%' }}>Questions</th>
                    <th className="text-center" style={{ width: '15%' }}>Date</th>
                    <th className="text-center" style={{ width: '10%' }}>Duration</th>
                    <th className="text-center" style={{ width: '20%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableQuizzes.length > 0 ? (
                    availableQuizzes.map((quiz, index) => {
                      const quizQuestions = getQuestionsByQuiz(quiz._id);
                      
                      // Get chapter and subject with improved ID matching
                      let chapter = null;
                      let subject = null;
                      
                      // Find chapter by quiz.chapter_id
                      if (quiz && quiz.chapter_id && Array.isArray(chapters)) {
                        chapter = chapters.find(c => {
                          if (!c || !c._id) return false;
                          const chapterId = typeof quiz.chapter_id === 'object' && quiz.chapter_id !== null 
                            ? quiz.chapter_id._id || quiz.chapter_id.id 
                            : quiz.chapter_id;
                          return c._id === chapterId || c._id === String(chapterId) || String(c._id) === String(chapterId);
                        });
                      }
                      
                      // Find subject by chapter.subject_id
                      if (chapter && chapter.subject_id && Array.isArray(subjects)) {
                        subject = subjects.find(s => {
                          if (!s || !s._id) return false;
                          const subjectId = typeof chapter.subject_id === 'object' && chapter.subject_id !== null 
                            ? chapter.subject_id._id || chapter.subject_id.id 
                            : chapter.subject_id;
                          return s._id === subjectId || s._id === String(subjectId) || String(s._id) === String(subjectId);
                        });
                      }
                      
                      return (
                        <tr key={quiz._id}>
                          <td className="text-center fw-bold">{index + 1}</td>
                          <td className="text-center">
                            <span className="badge bg-primary" title={subject?.name || 'Unknown Subject'}>
                              {subject?.name || 'Unknown Subject'}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary" title={chapter?.name || 'Unknown Chapter'}>
                              {chapter?.name || 'Unknown Chapter'}
                            </span>
                          </td>
                          <td className="text-center">
                            {(() => {
                              const hasAttempted = hasUserAttemptedQuiz(quiz._id);
                              const hasNewQuestions = hasNewQuestionsAvailable(quiz._id);
                              
                              if (hasAttempted && hasNewQuestions) {
                                const userScore = userScores.find(score => {
                                  if (!score.quiz_id) return false;
                                  const scoreQuizId = typeof score.quiz_id === 'object' && score.quiz_id !== null 
                                    ? score.quiz_id._id || score.quiz_id.id 
                                    : score.quiz_id;
                                  return scoreQuizId === quiz._id || scoreQuizId === String(quiz._id);
                                });
                                const previouslyAnswered = userScore?.answers?.length || 0;
                                const newQuestionsCount = quizQuestions.length - previouslyAnswered;
                                
                                return (
                                  <div>
                                    <span className="badge bg-info">{quizQuestions.length}</span>
                                    <br />
                                    <small className="text-warning fw-bold">
                                      +{newQuestionsCount} new
                                    </small>
                                  </div>
                                );
                              } else {
                                return <span className="badge bg-info">{quizQuestions.length}</span>;
                              }
                            })()}
                          </td>
                          <td className="text-center">
                            <small className="text-muted">
                              {quiz.date_of_quiz ? new Date(quiz.date_of_quiz).toLocaleDateString() : 'Available Now'}
                            </small>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-success">
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
                              {(() => {
                                const canAttempt = canUserAttemptQuiz(quiz._id);
                                const hasAttempted = hasUserAttemptedQuiz(quiz._id);
                                const hasNewQuestions = hasNewQuestionsAvailable(quiz._id);
                                
                                if (canAttempt) {
                                  if (hasAttempted && hasNewQuestions) {
                                    return (
                                      <button
                                        type="button"
                                        className="btn btn-outline-warning"
                                        onClick={() => handleStartQuiz(quiz)}
                                        title="New questions available - retake quiz"
                                      >
                                        <i className="bi bi-arrow-repeat me-1"></i>Retake
                                      </button>
                                    );
                                  } else {
                                    return (
                                      <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        onClick={() => handleStartQuiz(quiz)}
                                        title="Start quiz"
                                      >
                                        <i className="bi bi-play-circle me-1"></i>Start
                                      </button>
                                    );
                                  }
                                } else {
                                  return (
                                    <button
                                      type="button"
                                      className="btn btn-outline-secondary"
                                      disabled
                                      title="Already completed all questions"
                                    >
                                      <i className="bi bi-check-circle me-1"></i>Completed
                                    </button>
                                  );
                                }
                              })()}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className={`bi ${searchTerm ? 'bi-search' : 'bi-inbox'} fs-1 d-block mb-3`}></i>
                        <h5>{searchTerm ? `No quizzes found matching "${searchTerm}"` : 'No quizzes available'}</h5>
                        <p className="mb-0">
                          {searchTerm ? 'Try searching for subject name, chapter name, or clear the search' : 'Check back later for new quizzes'}
                        </p>
                        {searchTerm && (
                          <small className="text-muted d-block mt-2">
                            <i className="bi bi-info-circle me-1"></i>
                            You can search by: Subject, Chapter, Date, Duration, or Number of Questions
                          </small>
                        )}
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
    const subject = chapter ? getSubjectById(chapter.subject_id) : null;

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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSaveAndNext}
            disabled={currentQuestionIndex >= quizQuestions.length - 1 || isSubmitting}
            style={{
              backgroundColor: (currentQuestionIndex >= quizQuestions.length - 1 || isSubmitting) ? '#f0f0f0' : '#cce5ff',
              border: '2px solid #007bff', borderRadius: '8px', padding: '10px 20px',
              fontSize: '16px', fontWeight: 'bold',
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
              border: '2px solid #28a745', borderRadius: '8px', padding: '10px 20px',
              fontSize: '16px', fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: isSubmitting ? '#666' : '#28a745',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
          <button
            onClick={() => currentQuestion && handleGetExplanation(currentQuestion, chapter, subject)}
            disabled={aiLoading || !currentQuestion}
            style={{
              backgroundColor: aiLoading ? '#f0f0f0' : '#fff3cd',
              border: '2px solid #ffc107', borderRadius: '8px', padding: '10px 20px',
              fontSize: '16px', fontWeight: 'bold',
              cursor: (aiLoading || !currentQuestion) ? 'not-allowed' : 'pointer',
              color: '#856404',
              opacity: (aiLoading || !currentQuestion) ? 0.6 : 1
            }}
          >
            {aiLoading ? '⏳ Loading...' : '🤖 AI Explain'}
          </button>
        </div>

        {/* AI Explanation Panel */}
        {(aiExplanation || aiLoading) && (
          <div style={{
            marginTop: '25px', border: '2px solid #ffc107', borderRadius: '10px',
            padding: '20px', backgroundColor: '#fffbf0', textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🤖</span>
              <strong style={{ color: '#856404' }}>AI Explanation — BCA Quest</strong>
              <button onClick={() => setAiExplanation(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#856404' }}>
                ✕
              </button>
            </div>
            {aiLoading
              ? <p style={{ color: '#856404', fontStyle: 'italic' }}>Generating explanation...</p>
              : <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#333' }}>{aiExplanation}</div>
            }
          </div>
        )}
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
      }).filter(score => score.quiz !== null); // Filter out scores for deleted quizzes
    };

    const scoresWithDetails = getUserScoresWithDetails();
    
    // Check for orphaned scores (scores for deleted quizzes)
    const totalScoresCount = userScores.length;
    const validScoresCount = scoresWithDetails.length;
    const orphanedScoresCount = totalScoresCount - validScoresCount;

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
        {/* Orphaned Scores Warning */}
        
        {/* 
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
                  {Math.round(userStats.averageScore || 0)}%
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
                    <th className="text-center" style={{ width: '8%' }}>#</th>
                    <th className="text-center" style={{ width: '20%' }}>Quiz</th>
                    <th className="text-center" style={{ width: '18%' }}>Subject</th>
                    <th className="text-center" style={{ width: '12%' }}>Questions</th>
                    <th className="text-center" style={{ width: '12%' }}>Date</th>
                    <th className="text-center" style={{ width: '15%' }}>Score</th>
                    <th className="text-center" style={{ width: '15%' }}>Actions</th>
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
                        <td className="text-center">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleReviewQuiz(score._id)}
                            title="Review quiz answers and analysis"
                          >
                            <i className="bi bi-eye me-1"></i>Review
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
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

    // Calculate subject-wise accuracy for weak area detection
    const getSubjectAccuracy = () => {
      const subjectStats = {};
      userScores.forEach(score => {
        if (!score.quiz_id) return;
        const quiz = upcomingQuizzes.find(q => {
          const scoreQuizId = typeof score.quiz_id === 'object' ? score.quiz_id._id || score.quiz_id.id : score.quiz_id;
          return String(q._id) === String(scoreQuizId);
        });
        if (!quiz) return;
        const chapter = getChapterById(quiz.chapter_id);
        if (!chapter) return;
        const subject = getSubjectById(chapter.subject_id);
        if (!subject) return;
        if (!subjectStats[subject.name]) subjectStats[subject.name] = { correct: 0, total: 0 };
        const quizQs = getQuestionsByQuiz(quiz._id);
        const total = quizQs.length || score.answers?.length || 0;
        subjectStats[subject.name].correct += score.total_scored || 0;
        subjectStats[subject.name].total += total;
      });
      return Object.entries(subjectStats).map(([name, s]) => ({
        name,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
      })).sort((a, b) => a.accuracy - b.accuracy);
    };

    const subjectAccuracy = getSubjectAccuracy();
    const weakAreas = subjectAccuracy.filter(s => s.accuracy < 60);
    const strongAreas = subjectAccuracy.filter(s => s.accuracy >= 60);

    return (
      <div>
        {/* Weak Areas / Strong Areas Panel */}
        {subjectAccuracy.length > 0 && (
          <div className="row g-3 mb-4">
            {weakAreas.length > 0 && (
              <div className="col-md-6">
                <div className="card border-danger border-2">
                  <div className="card-header bg-danger text-white fw-bold">
                    <i className="bi bi-exclamation-triangle me-2"></i>Needs Improvement (below 60%)
                  </div>
                  <ul className="list-group list-group-flush">
                    {weakAreas.map(s => (
                      <li key={s.name} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{s.name}</span>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress" style={{ width: 100, height: 8 }}>
                            <div className="progress-bar bg-danger" style={{ width: `${s.accuracy}%` }} />
                          </div>
                          <span className="badge bg-danger">{s.accuracy}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {strongAreas.length > 0 && (
              <div className="col-md-6">
                <div className="card border-success border-2">
                  <div className="card-header bg-success text-white fw-bold">
                    <i className="bi bi-trophy me-2"></i>Strong Areas (60% and above)
                  </div>
                  <ul className="list-group list-group-flush">
                    {strongAreas.map(s => (
                      <li key={s.name} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{s.name}</span>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress" style={{ width: 100, height: 8 }}>
                            <div className="progress-bar bg-success" style={{ width: `${s.accuracy}%` }} />
                          </div>
                          <span className="badge bg-success">{s.accuracy}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

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
      <div className="min-vh-100 bg-light">
        <div className="container-fluid p-4">
          <NavSkeleton />
          <StatsSkeleton />
          <div className="row">
            <div className="col-md-8">
              <QuizCardSkeleton count={6} />
            </div>
            <div className="col-md-4">
              <ChartSkeleton height="300px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-outline-primary btn-sm d-flex align-items-center"
                onClick={handleRefresh}
                disabled={loading}
              >
                <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i>
                Refresh
              </button>
              <div className="d-flex align-items-center gap-2 text-muted">
                <i className="bi bi-calendar3"></i>
                <span>{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <NavigationBar 
          view={view}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onViewChange={handleViewChange}
          setCurrentQuiz={setCurrentQuiz}
          setTimer={setTimer}
          setAnswers={setAnswers}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setIsSubmitting={setIsSubmitting}
        />
        
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