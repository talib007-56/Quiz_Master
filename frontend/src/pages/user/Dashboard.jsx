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

  useEffect(() => {
    fetchData();
  }, []);

  // Timer effect for quiz
  useEffect(() => {
    let interval = null;
    if (view === 'quiz' && timer > 0) {
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
    return () => clearInterval(interval);
  }, [view, timer]);

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

  const handleStartQuiz = (quiz) => {
    const quizQuestions = getQuestionsByQuiz(quiz._id);
    if (quizQuestions.length === 0) {
      alert('No questions available for this quiz');
      return;
    }
    
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimer(quiz.time_duration * 60); // Convert minutes to seconds - using correct field
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
    if (!currentQuiz) return;
    
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
      
      alert(`Quiz submitted successfully! You scored ${correctAnswers}/${quizQuestions.length} (${Math.round((correctAnswers/quizQuestions.length)*100)}%)`);
      
      // Reset quiz state
      setView('dashboard');
      setCurrentQuiz(null);
      setAnswers({});
      setTimer(null);
      setCurrentQuestionIndex(0);
      
      // Refresh data to show new score
      fetchData();
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already attempted')) {
        alert('You have already attempted this quiz!');
      } else {
        alert('Error submitting quiz: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Navigation Bar Component - matching wireframe exactly
  const NavigationBar = () => (
    <div style={{
      backgroundColor: '#e8f4f8',
      border: '2px solid #007bff',
      borderRadius: '15px',
      padding: '15px 20px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span 
          style={{ 
            color: view === 'dashboard' ? '#007bff' : '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={() => setView('dashboard')}
        >
          Home
        </span>
        <span style={{ color: '#6c757d' }}>|</span>
        <span 
          style={{ 
            color: view === 'scores' ? '#007bff' : '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={() => setView('scores')}
        >
          Scores
        </span>
        <span style={{ color: '#6c757d' }}>|</span>
        <span 
          style={{ 
            color: view === 'summary' ? '#007bff' : '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={() => setView('summary')}
        >
          Summary
        </span>
        <span style={{ color: '#6c757d' }}>|</span>
        <span 
          style={{ 
            color: '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={handleLogout}
        >
          Logout
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Search" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '2px solid #007bff',
            borderRadius: '8px',
            width: '150px'
          }}
        />
        <span style={{ color: '#007bff', fontWeight: 'bold', fontSize: '16px' }}>
          Welcome {currentUser?.full_name || 'User'}
        </span>
      </div>
    </div>
  );

  // Scores Navigation Bar - for scores page
  const ScoresNavigationBar = () => (
    <div style={{
      backgroundColor: '#e8f4f8',
      border: '2px solid #007bff',
      borderRadius: '15px',
      padding: '15px 20px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span 
          style={{ 
            color: '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={() => setView('dashboard')}
        >
          Home
        </span>
        <span style={{ color: '#6c757d' }}>|</span>
        <span 
          style={{ 
            color: '#007bff',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Scores
        </span>
        <span style={{ color: '#6c757d' }}>|</span>
        <span 
          style={{ 
            color: '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={() => setView('summary')}
        >
          Summary
        </span>
        <span style={{ color: '#6c757d' }}>|</span>
        <span 
          style={{ 
            color: '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={handleLogout}
        >
          Logout
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Search" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '2px solid #007bff',
            borderRadius: '8px',
            width: '150px'
          }}
        />
        <span style={{ color: '#007bff', fontWeight: 'bold', fontSize: '16px' }}>
          Welcome {currentUser?.full_name || 'User'}
        </span>
      </div>
    </div>
  );

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
      <div>
        <div style={{
          border: '2px solid #000',
          borderRadius: '15px',
          backgroundColor: '#fff',
          marginBottom: '30px',
          maxWidth: '800px'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            padding: '15px',
            borderBottom: '2px solid #000',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            Available Quizzes
          </div>

          {/* Table Header */}
          <div style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 20px',
            margin: '15px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <div style={{ width: '8%', textAlign: 'center' }}>ID</div>
            <div style={{ width: '20%', textAlign: 'center' }}>No.of Questions</div>
            <div style={{ width: '20%', textAlign: 'center' }}>Date</div>
            <div style={{ width: '22%', textAlign: 'center' }}>Duration(hh:mm)</div>
            <div style={{ width: '30%', textAlign: 'center' }}>Action</div>
          </div>

          {/* Quiz Rows */}
          <div style={{ padding: '0 20px', minHeight: '200px', margin: '0 15px' }}>
            {availableQuizzes.length > 0 ? (
              availableQuizzes.map((quiz, index) => {
                const quizQuestions = getQuestionsByQuiz(quiz._id);
                const chapter = getChapterById(quiz.chapter_id);
                const subject = chapter ? getSubjectById(chapter.subject_id) : null;
                
                return (
                  <div key={quiz._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #eee',
                    fontSize: '14px'
                  }}>
                    <div style={{ width: '8%', textAlign: 'center', fontWeight: 'bold' }}>
                      {index + 1}
                    </div>
                    <div style={{ width: '20%', textAlign: 'center' }}>
                      {quizQuestions.length.toString().padStart(2, '0')}
                    </div>
                    <div style={{ width: '20%', textAlign: 'center' }}>
                      {quiz.date_of_quiz ? new Date(quiz.date_of_quiz).toLocaleDateString() : 'Available Now'}
                    </div>
                    <div style={{ width: '22%', textAlign: 'center' }}>
                      {quiz.time_duration ? 
                        `${Math.floor(quiz.time_duration / 60).toString().padStart(2, '0')}:${(quiz.time_duration % 60).toString().padStart(2, '0')}` 
                        : '00:10'
                      }
                    </div>
                    <div style={{ 
                      width: '30%', 
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <button
                        style={{ 
                          backgroundColor: '#cce5ff',
                          border: '1px solid #007bff',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#007bff'
                        }}
                        onClick={() => handleViewQuiz(quiz)}
                      >
                        View
                      </button>
                      <button
                        style={{ 
                          backgroundColor: '#d4edda',
                          border: '1px solid #28a745',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#28a745'
                        }}
                        onClick={() => handleStartQuiz(quiz)}
                        title="Start quiz"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontStyle: 'italic',
                padding: '40px 0'
              }}>
                No quizzes available. Admin needs to create quizzes with questions!
              </div>
            )}
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
            disabled={currentQuestionIndex >= quizQuestions.length - 1}
            style={{
              backgroundColor: currentQuestionIndex >= quizQuestions.length - 1 ? '#f0f0f0' : '#cce5ff',
              border: '2px solid #007bff',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: currentQuestionIndex >= quizQuestions.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentQuestionIndex >= quizQuestions.length - 1 ? 0.6 : 1
            }}
          >
            Save and Next
          </button>
          <button
            onClick={handleSubmitQuiz}
            style={{
              backgroundColor: '#d4edda',
              border: '2px solid #28a745',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              color: '#28a745'
            }}
          >
            Submit Quiz
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
        // Find the quiz for this score
        const quiz = upcomingQuizzes.find(q => q._id === score.quiz_id);
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
          quizTitle: quiz?.title || (chapter?.name ? `Quiz - ${chapter.name}` : 'Unknown Quiz'),
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
      <div>
        {/* Search Info */}
        <div style={{
          color: '#28a745',
          fontSize: '16px',
          fontStyle: 'italic',
          marginBottom: '20px',
          textAlign: 'right'
        }}>
          Searching subjects/quizzes by date/scores
        </div>

        <div style={{
          border: '2px solid #000',
          borderRadius: '15px',
          backgroundColor: '#fff',
          marginBottom: '30px',
          maxWidth: '600px'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            padding: '15px',
            borderBottom: '2px solid #000',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            Quiz Scores
          </div>

          {/* Table Header */}
          <div style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 20px',
            margin: '15px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <div style={{ width: '15%', textAlign: 'center' }}>ID</div>
            <div style={{ width: '30%', textAlign: 'center' }}>No.of Questions</div>
            <div style={{ width: '30%', textAlign: 'center' }}>Date</div>
            <div style={{ width: '25%', textAlign: 'center' }}>Score</div>
          </div>

          {/* Score Rows */}
          <div style={{ padding: '0 20px', minHeight: '200px', margin: '0 15px' }}>
            {displayScores.length > 0 ? (
              displayScores.map((score, index) => (
                <div key={score._id || index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px'
                }}>
                  <div style={{ width: '15%', textAlign: 'center', fontWeight: 'bold' }}>
                    {index + 1}
                  </div>
                  <div style={{ width: '30%', textAlign: 'center' }}>
                    {score.totalQuestions.toString().padStart(2, '0')}
                  </div>
                  <div style={{ width: '30%', textAlign: 'center' }}>
                    {score.formattedDate}
                  </div>
                  <div style={{ width: '25%', textAlign: 'center', fontWeight: 'bold' }}>
                    {score.scoreDisplay}
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontStyle: 'italic',
                padding: '40px 0'
              }}>
                {searchTerm ? `No scores found matching "${searchTerm}"` : 'No quiz scores yet. Take a quiz to see your results here!'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Summary Charts View
  const SummaryView = () => {
    // Calculate subject-wise quiz attempts and scores from real data
    const getSubjectWiseData = () => {
      const subjectData = {};
      
      userScores.forEach(score => {
        const quiz = upcomingQuizzes.find(q => q._id === score.quiz_id);
        if (quiz) {
          const chapter = getChapterById(quiz.chapter_id);
          if (chapter) {
            const subject = getSubjectById(chapter.subject_id);
            if (subject) {
              if (!subjectData[subject.name]) {
                subjectData[subject.name] = {
                  attempts: 0,
                  totalScore: 0,
                  totalQuestions: 0
                };
              }
              
              subjectData[subject.name].attempts += 1;
              subjectData[subject.name].totalScore += score.total_scored || 0;
              
              // Calculate total questions for this quiz
              const quizQuestions = getQuestionsByQuiz(quiz._id);
              subjectData[subject.name].totalQuestions += quizQuestions.length;
            }
          }
        }
      });
      
      // Calculate average scores
      const subjectAverages = {};
      Object.keys(subjectData).forEach(subjectName => {
        const data = subjectData[subjectName];
        subjectAverages[subjectName] = data.totalQuestions > 0 
          ? Math.round((data.totalScore / data.totalQuestions) * 100)
          : 0;
      });
      
      // If no real data, use sample data
      if (Object.keys(subjectData).length === 0) {
        return {
          attempts: {
            labels: ['No Data Available'],
            data: [0]
          },
          averages: {
            labels: ['No Data Available'],
            data: [0]
          }
        };
      }
      
      return {
        attempts: {
          labels: Object.keys(subjectData),
          data: Object.values(subjectData).map(d => d.attempts)
        },
        averages: {
          labels: Object.keys(subjectAverages),
          data: Object.values(subjectAverages)
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
          labels: ['No Data Available'],
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
        backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCE56', '#FF6384', '#9966FF', '#FF9F40']
      }]
    };

    // Subject wise average scores data
    const subjectScoresChartData = {
      labels: subjectData.averages.labels,
      datasets: [{
        label: 'Average Score (%)',
        data: subjectData.averages.data,
        backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14']
      }]
    };

    // Month wise no.of quizzes attempted (pie chart)
    const monthlyAttemptsChartData = {
      labels: monthlyAttemptsData.labels,
      datasets: [{
        data: monthlyAttemptsData.data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
      }]
    };

    return (
      <div>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {/* Subject-wise Attempts */}
          <div style={{
            width: '45%',
            border: '2px solid #000',
            borderRadius: '15px',
            backgroundColor: '#fff',
            minWidth: '400px'
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
            <div style={{ padding: '20px', height: '300px' }}>
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
          
          {/* Subject-wise Average Scores */}
          <div style={{
            width: '45%',
            border: '2px solid #000',
            borderRadius: '15px',
            backgroundColor: '#fff',
            minWidth: '400px'
          }}>
            <div style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '15px',
              borderRadius: '13px 13px 0 0',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              Subject wise average scores
            </div>
            <div style={{ padding: '20px', height: '300px' }}>
              <Bar 
                data={subjectScoresChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        stepSize: 10,
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Average Score: ${context.parsed.y}%`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Monthly Attempts */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '45%',
            border: '2px solid #000',
            borderRadius: '15px',
            backgroundColor: '#fff',
            minWidth: '400px'
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
              <div style={{ width: '280px', height: '280px' }}>
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
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Main Title */}
      <h1 style={{ 
        textAlign: 'center', 
        color: '#007bff', 
        marginBottom: '30px',
        fontSize: '32px',
        fontWeight: 'bold'
      }}>
        {view === 'quiz' ? 'Quiz in Progress' : 
         view === 'scores' ? 'Scores' :
         view === 'summary' ? 'Summary Charts' : 'User Dashboard'}
      </h1>
      
      {/* Navigation */}
      {view === 'scores' ? <ScoresNavigationBar /> : <NavigationBar />}
      
      {/* Content Views */}
      {view === 'dashboard' && <DashboardView />}
      {view === 'quiz' && <QuizView />}
      {view === 'scores' && <ScoresView />}
      {view === 'summary' && <SummaryView />}
      
      {/* Quiz View Modal */}
      <QuizViewModal />
    </div>
  );
};

export default UserDashboard; 