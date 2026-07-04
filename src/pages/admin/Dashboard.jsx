import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subjectsAPI, chaptersAPI, quizzesAPI, questionsAPI, scoresAPI, exportAPI, notificationAPI, downloadCSV } from '../../services/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';  // This is overriding everything!

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Standalone Navigation Bar Component to prevent re-creation (like user dashboard)
const NavigationBar = memo(({ 
  view, 
  searchQuery, 
  onSearchChange, 
  onViewChange 
}) => (
  <nav className="navbar navbar-expand-lg mb-4" 
       style={{ 
         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
         borderRadius: '20px',
         boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
         border: 'none',
         position: 'static',
         maxWidth: '1400px',
         margin: '0 auto 20px auto'
       }}>
    <div className="container-fluid px-4">
      {/* Navigation Items */}
      <div className="collapse navbar-collapse" id="adminNavbar">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {[
            { key: 'subjects', label: 'Home', icon: '🏠' },
            { key: 'quizzes', label: 'Quiz', icon: '📝' },
            { key: 'summary', label: 'Summary', icon: '📊' },
            { key: 'export', label: 'Export', icon: '📥' },
            { key: 'notifications', label: 'Notifications', icon: '🔔' }
          ].map((item) => (
            <li className="nav-item" key={item.key}>
              <button
                className={`nav-link btn btn-link px-3 py-2 rounded-pill me-2 d-flex align-items-center ${view === item.key ? 'active' : ''}`}
                style={{ 
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '15px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textDecoration: 'none',
                  background: view === item.key 
                    ? 'rgba(255, 255, 255, 0.25)' 
                    : 'transparent',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: view === item.key 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'transparent',
                  color: '#fff',
                  backdropFilter: view === item.key ? 'blur(10px)' : 'none',
                  boxShadow: view === item.key 
                    ? '0 4px 15px rgba(255, 255, 255, 0.1)' 
                    : 'none'
                }}
                onClick={() => onViewChange(item.key)}
                onMouseEnter={(e) => {
                  if (view !== item.key) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== item.key) {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: '16px', marginRight: '8px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Search Bar */}
        <div className="d-flex align-items-center me-3">
          <div className="position-relative">
            <input 
              type="text" 
              className="form-control"
              placeholder="Search subjects, chapters, quizzes..."
              value={searchQuery}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSearchChange(e.target.value);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                  onSearchChange('');
                  e.target.blur();
                }
              }}
              onKeyUp={(e) => {
                e.stopPropagation();
              }}
              onInput={(e) => {
                e.stopPropagation();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '25px',
                padding: '12px 20px 12px 45px',
                color: '#fff',
                fontSize: '14px',
                width: '280px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
              autoComplete="off"
              spellCheck="false"
            />
            <span className="position-absolute start-0 top-50 translate-middle-y ms-3" style={{
              color: searchQuery ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              transition: 'color 0.2s ease'
            }}>
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="position-absolute end-0 top-50 translate-middle-y me-3"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </nav>
));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [showEditChapterModal, setShowEditChapterModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [view, setView] = useState('subjects'); // 'subjects', 'quizzes', 'summary'
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0); // Force re-render trigger
  const [searchQuery, setSearchQuery] = useState(''); // Search functionality
  
  // Memoized handlers to prevent input focus loss (similar to user dashboard)
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
    setSearchQuery(''); // Clear search when changing views
  }, []);
  
  // Form states
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
  const [chapterForm, setChapterForm] = useState({ name: '', description: '', subject_id: '' });
  const [editChapterForm, setEditChapterForm] = useState({ name: '', description: '', subject_id: '' });
  const [quizForm, setQuizForm] = useState({ chapter_id: '', date: '', duration: '', title: '' });
  const [questionForm, setQuestionForm] = useState({
    chapter_id: '',
    quiz_id: '',
    question_title: '',
    question_statement: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_option: 1
  });
  const [editQuestionForm, setEditQuestionForm] = useState({
    chapter_id: '',
    quiz_id: '',
    question_title: '',
    question_statement: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_option: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showSubjectModal || showChapterModal || showQuizModal || showQuestionModal || showEditQuestionModal || showEditChapterModal;
    
    if (isAnyModalOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift from scrollbar
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showSubjectModal, showChapterModal, showQuizModal, showQuestionModal, showEditQuestionModal, showEditChapterModal]);

  // Navigation handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    // Navigate to admin profile page
    navigate('/admin/profile');
  };

  const fetchData = async () => {
    try {
      const [subjectsRes, chaptersRes, quizzesRes, questionsRes, scoresRes] = await Promise.all([
        subjectsAPI.getAll(),
        chaptersAPI.getAll(),
        quizzesAPI.getAll(),
        questionsAPI.getAll(),
        scoresAPI.getAll()
      ]);
      
      console.log('\n=== FETCH DATA DEBUG ===');
      console.log('Fetched data:', {
        subjects: subjectsRes.data,
        chapters: chaptersRes.data,
        quizzes: quizzesRes.data,
        questions: questionsRes.data,
        scores: scoresRes.data
      });
      
      // Debug questions specifically
      console.log('\n=== QUESTIONS DEBUG ===');
      console.log('Total questions fetched:', questionsRes.data?.length || 0);
      if (questionsRes.data && questionsRes.data.length > 0) {
        questionsRes.data.forEach((question, index) => {
          console.log(`Question ${index + 1}:`, {
            _id: question._id,
            quiz_id: question.quiz_id,
            quiz_id_type: typeof question.quiz_id,
            question_title: question.question_title,
            question_statement: question.question_statement?.substring(0, 50) + '...'
          });
        });
      } else {
        console.log('No questions found in database');
      }
      
      setSubjects(subjectsRes.data || []);
      setChapters(chaptersRes.data || []);
      setQuizzes(quizzesRes.data || []);
      setQuestions(questionsRes.data || []);
      setScores(scoresRes.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await subjectsAPI.create(subjectForm);
      setSubjectForm({ name: '', description: '' });
      setShowSubjectModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    try {
      await chaptersAPI.create(chapterForm);
      setChapterForm({ name: '', description: '', subject_id: '' });
      setShowChapterModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const handleEditChapter = async (e) => {
    e.preventDefault();
    try {
      await chaptersAPI.update(currentChapter._id, editChapterForm);
      setEditChapterForm({ name: '', description: '', subject_id: '' });
      setShowEditChapterModal(false);
      setCurrentChapter(null);
      fetchData();
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      // Map frontend form fields to backend expected fields
      const quizData = {
        chapter_id: quizForm.chapter_id,
        date_of_quiz: quizForm.date,
        time_duration: parseInt(quizForm.duration),
        remarks: quizForm.title || ''
      };
      
      console.log('Creating quiz with data:', quizData);
      await quizzesAPI.create(quizData);
      setQuizForm({ chapter_id: '', date: '', duration: '', title: '' });
      setShowQuizModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('questionForm at submission:', questionForm);
    console.log('questionForm.quiz_id:', questionForm.quiz_id);
    console.log('questionForm.quiz_id type:', typeof questionForm.quiz_id);
    console.log('currentQuiz:', currentQuiz);
    
    // Use quiz_id from form, or fallback to currentQuiz._id
    const actualQuizId = questionForm.quiz_id || currentQuiz?._id;
    console.log('actualQuizId:', actualQuizId);
    
    // Validate quiz_id is not empty
    if (!actualQuizId || actualQuizId.trim() === '') {
      console.error('VALIDATION FAILED: quiz_id is empty or missing');
      console.log('Full questionForm state:', questionForm);
      console.log('currentQuiz state:', currentQuiz);
      alert('Error: Quiz ID is missing. Please try opening the question form again from a quiz card.');
      return;
    }
    
    console.log('VALIDATION PASSED: quiz_id is present');
    
    try {
      const questionData = {
        quiz_id: actualQuizId,  // Use the actual quiz ID
        question_title: questionForm.question_title,
        question_statement: questionForm.question_statement,
        option1: questionForm.option1,
        option2: questionForm.option2,
        option3: questionForm.option3,
        option4: questionForm.option4,
        correct_option: questionForm.correct_option
      };
      
      console.log('Creating question with data:', questionData);
      console.log('Form state:', questionForm);
      console.log('Current quiz:', currentQuiz);
      
      const response = await questionsAPI.create(questionData);
      console.log('Question created successfully:', response.data);
      console.log('About to refresh data...');
      
      setQuestionForm({
        chapter_id: '',
        quiz_id: '',
        question_title: '',
        question_statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: 1
      });
      setShowQuestionModal(false);
      setCurrentQuiz(null);
      console.log('Question created successfully, refreshing data...');
      
      // Add a small delay to ensure backend processing is complete
      setTimeout(() => {
        console.log('Calling fetchData after question creation...');
        fetchData();
      }, 100);
    } catch (error) {
      console.error('Error creating question:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      alert('Error creating question: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        console.log('Deleting question with ID:', questionId);
        await questionsAPI.delete(questionId);
        console.log('Question deleted successfully');
        
        // Add a small delay to ensure backend processing is complete
        setTimeout(() => {
          fetchData();
        }, 100);
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEditQuestionClick = (question) => {
    console.log('Editing question:', question);
    setCurrentQuestion(question);
    setEditQuestionForm({
      chapter_id: question.chapter_id || '',
      quiz_id: question.quiz_id,
      question_title: question.question_title || '',
      question_statement: question.question_statement || '',
      option1: question.option1 || '',
      option2: question.option2 || '',
      option3: question.option3 || '',
      option4: question.option4 || '',
      correct_option: question.correct_option || 1
    });
    setShowEditQuestionModal(true);
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    
    console.log('=== EDIT QUESTION SUBMISSION ===');
    console.log('currentQuestion:', currentQuestion);
    console.log('editQuestionForm:', editQuestionForm);
    
    if (!currentQuestion?._id) {
      console.error('No question ID found');
      alert('Error: Question ID is missing');
      return;
    }
    
    try {
      const questionData = {
        quiz_id: editQuestionForm.quiz_id,
        question_title: editQuestionForm.question_title,
        question_statement: editQuestionForm.question_statement,
        option1: editQuestionForm.option1,
        option2: editQuestionForm.option2,
        option3: editQuestionForm.option3,
        option4: editQuestionForm.option4,
        correct_option: editQuestionForm.correct_option
      };
      
      console.log('Updating question with data:', questionData);
      const response = await questionsAPI.update(currentQuestion._id, questionData);
      console.log('Question updated successfully:', response.data);
      
      setEditQuestionForm({
        chapter_id: '',
        quiz_id: '',
        question_title: '',
        question_statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: 1
      });
      setShowEditQuestionModal(false);
      setCurrentQuestion(null);
      console.log('Question updated successfully, refreshing data...');
      
      // Add a small delay to ensure backend processing is complete
      setTimeout(() => {
        fetchData();
      }, 100);
    } catch (error) {
      console.error('Error updating question:', error);
      console.error('Error response:', error.response?.data);
      alert('Error updating question: ' + (error.response?.data?.message || error.message));
    }
  };

  const getChaptersBySubject = (subjectId) => {
    return chapters.filter(chapter => {
      // Handle both populated and non-populated subject_id
      const chapterSubjectId = typeof chapter.subject_id === 'object' 
        ? chapter.subject_id._id 
        : chapter.subject_id;
      return chapterSubjectId === subjectId;
    });
  };

  const getQuizzesByChapter = (chapterId) => {
    const result = quizzes.filter(quiz => {
      const quizChapterId = typeof quiz.chapter_id === 'object' 
        ? quiz.chapter_id._id || quiz.chapter_id.toString()
        : quiz.chapter_id;
      return quizChapterId === chapterId || 
             quizChapterId === String(chapterId) || 
             String(quizChapterId) === String(chapterId);
    });
    console.log(`getQuizzesByChapter(${chapterId}) returning:`, result);
    console.log('All quizzes:', quizzes);
    return result;
  };

  const getQuestionsByQuiz = (quizId) => {
    console.log(`\n=== getQuestionsByQuiz Debug ===`);
    console.log('Looking for quiz_id:', quizId);
    console.log('All questions:', questions);
    
    const result = questions.filter(question => {
      // Safety check for null/undefined question or quiz_id
      if (!question || !question.quiz_id || question.quiz_id === null) {
        console.log(`Skipping question with null/undefined quiz_id:`, question);
        return false;
      }
      
      // Handle both ObjectId and string comparison
      let questionQuizId;
      try {
        questionQuizId = typeof question.quiz_id === 'object' && question.quiz_id !== null
          ? question.quiz_id._id || question.quiz_id.toString()
          : question.quiz_id;
        
        console.log(`Question ${question._id}: quiz_id = ${questionQuizId} (type: ${typeof questionQuizId})`);
        console.log(`Comparing: "${questionQuizId}" === "${quizId}" = ${questionQuizId === quizId}`);
        
        return questionQuizId === quizId || questionQuizId === String(quizId) || String(questionQuizId) === String(quizId);
      } catch (error) {
        console.error('Error processing question:', question, error);
        return false;
      }
    });
    
    console.log(`Found ${result.length} questions for quiz ${quizId}:`, result);
    return result;
  };

  // Calculate question counts for all chapters using useMemo
  const chapterQuestionCounts = useMemo(() => {
    console.log('\n=== CALCULATING CHAPTER QUESTION COUNTS ===');
    console.log('Questions array:', questions);
    console.log('Quizzes array:', quizzes);
    console.log('Chapters array:', chapters);
    
    const counts = {};
    
    chapters.forEach(chapter => {
      const chapterQuizzes = quizzes.filter(quiz => {
        const quizChapterId = typeof quiz.chapter_id === 'object' 
          ? quiz.chapter_id._id || quiz.chapter_id.toString()
          : quiz.chapter_id;
        return quizChapterId === chapter._id || 
               quizChapterId === String(chapter._id) || 
               String(quizChapterId) === String(chapter._id);
      });
      console.log(`Chapter "${chapter.name}" (${chapter._id}) has ${chapterQuizzes.length} quizzes`);
      
      let totalQuestions = 0;
      
      chapterQuizzes.forEach(quiz => {
        const quizQuestions = questions.filter(question => {
          // Skip questions with null quiz_id
          if (!question || !question.quiz_id || question.quiz_id === null) {
            return false;
          }
          
          try {
            const questionQuizId = typeof question.quiz_id === 'object' && question.quiz_id !== null
              ? question.quiz_id._id || question.quiz_id.toString()
              : question.quiz_id;
            
            const matches = questionQuizId === quiz._id || 
                           questionQuizId === String(quiz._id) || 
                           String(questionQuizId) === String(quiz._id);
            
            if (matches) {
              console.log(`  ✓ Question "${question.question_title}" matches quiz ${quiz._id}`);
            }
            
            return matches;
          } catch (error) {
            console.error('Error processing question in chapter count:', question, error);
            return false;
          }
        });
        
        console.log(`  Quiz ${quiz._id} has ${quizQuestions.length} questions`);
        totalQuestions += quizQuestions.length;
      });
      
      counts[chapter._id] = totalQuestions;
      console.log(`Final count for chapter "${chapter.name}": ${totalQuestions}`);
    });
    
    console.log('Final chapter counts:', counts);
    return counts;
  }, [questions, quizzes, chapters]);

  const getQuestionCountForChapter = (chapterId) => {
    return chapterQuestionCounts[chapterId] || 0;
  };

  // Memoized filtered data
  const filteredSubjects = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return subjects;
    const query = searchQuery.toLowerCase();
    return subjects.filter(subject => 
      subject?.name?.toLowerCase().includes(query) ||
      subject?.description?.toLowerCase().includes(query)
    );
  }, [subjects, searchQuery]);

  const filteredQuizzes = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return quizzes;
    const query = searchQuery.toLowerCase();
    
    return quizzes.filter(quiz => {
      try {
        // Find chapter for this quiz
        const chapter = chapters.find(c => {
          const chapterId = typeof quiz.chapter_id === 'object' && quiz.chapter_id !== null 
            ? quiz.chapter_id._id || quiz.chapter_id.id 
            : quiz.chapter_id;
          return c._id === chapterId || c._id === String(chapterId) || String(c._id) === String(chapterId);
        });
        
        // Find subject for this chapter
        const subject = chapter ? subjects.find(s => {
          const subjectId = typeof chapter.subject_id === 'object' && chapter.subject_id !== null 
            ? chapter.subject_id._id || chapter.subject_id.id 
            : chapter.subject_id;
          return s._id === subjectId || s._id === String(subjectId) || String(s._id) === String(subjectId);
        }) : null;

        // Search in various fields
        return (
          chapter?.name?.toLowerCase().includes(query) ||
          subject?.name?.toLowerCase().includes(query) ||
          quiz?.remarks?.toLowerCase().includes(query) ||
          quiz?.date_of_quiz?.includes(searchQuery)
        );
      } catch (error) {
        console.error('Error filtering quiz:', error);
        return false;
      }
    });
  }, [quizzes, chapters, subjects, searchQuery]);

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectsAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleDeleteChapter = async (id) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      try {
        await chaptersAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting chapter:', error);
      }
    }
  };

  const handleEditChapterClick = (chapter) => {
    setCurrentChapter(chapter);
    setEditChapterForm({
      name: chapter.name,
      description: chapter.description,
      subject_id: chapter.subject_id
    });
    setShowEditChapterModal(true);
  };

  // Export functions
  const handleExportQuizData = async () => {
    try {
      const response = await exportAPI.exportQuizData();
      downloadCSV(response.data, 'quiz-data.csv');
    } catch (error) {
      console.error('Error exporting quiz data:', error);
      alert('Failed to export quiz data');
    }
  };

  const handleExportQuizAttempts = async () => {
    try {
      const response = await exportAPI.exportQuizAttempts();
      downloadCSV(response.data, 'quiz-attempts.csv');
    } catch (error) {
      console.error('Error exporting quiz attempts:', error);
      alert('Failed to export quiz attempts');
    }
  };

  const handleExportUserEngagement = async () => {
    try {
      const response = await exportAPI.exportUserEngagement();
      downloadCSV(response.data, 'user-engagement.csv');
    } catch (error) {
      console.error('Error exporting user engagement:', error);
      alert('Failed to export user engagement data');
    }
  };

  // Notification trigger functions
  const handleTriggerDailyReminders = async () => {
    try {
      await notificationAPI.triggerDailyReminders();
      alert('Daily reminders sent successfully!');
    } catch (error) {
      console.error('Error triggering daily reminders:', error);
      alert('Failed to send daily reminders');
    }
  };

  const handleTriggerMonthlyReports = async () => {
    try {
      await notificationAPI.triggerMonthlyReports();
      alert('Monthly reports sent successfully!');
    } catch (error) {
      console.error('Error triggering monthly reports:', error);
      alert('Failed to send monthly reports');
    }
  };

  const handleTriggerEngagementNotification = async () => {
    try {
      await notificationAPI.triggerEngagementNotification();
      alert('Engagement notifications sent successfully!');
    } catch (error) {
      console.error('Error triggering engagement notification:', error);
      alert('Failed to send engagement notifications');
    }
  };

  const handleTestEmail = async () => {
    try {
      const email = prompt('Enter email address for test (or leave empty to use SMTP_USER):');
      const result = await notificationAPI.testEmail(email);
      alert(`Test email sent successfully! Check your inbox.\nMessage ID: ${result.data.details.messageId}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      const errorMsg = error.response?.data?.message || error.message;
      const details = error.response?.data?.details;
      
      let alertMsg = `Failed to send test email: ${errorMsg}`;
      if (details) {
        alertMsg += `\n\nConfiguration Status:`;
        alertMsg += `\n• SMTP Host: ${details.smtpHost}`;
        alertMsg += `\n• SMTP User: ${details.smtpUser}`;
        alertMsg += `\n• SMTP Password: ${details.smtpPassSet ? 'SET' : 'NOT SET'}`;
      }
      alert(alertMsg);
    }
  };



  // Modern Subjects view component
  const SubjectsView = () => {
    return (
      <div style={{ position: 'relative' }}>
        <style>{`
          .subject-card {
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e9ecef;
            position: relative;
            min-height: 400px;
            cursor: pointer;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            transition: transform 0.2s ease;
          }
          
          .subject-card:hover {
            transform: translate3d(0, -8px, 0);
          }
          
          .chapter-row {
            display: grid;
            grid-template-columns: 1fr auto auto;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            cursor: pointer;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            transition: transform 0.15s ease;
            margin-bottom: 8px;
          }
          
          @media (max-width: 768px) {
            .chapter-row {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            
            .chapter-row > div:nth-child(1) {
              order: 1;
            }
            
            .chapter-row > div:nth-child(2) {
              order: 2;
              justify-self: start;
              margin-left: 20px;
            }
            
            .chapter-row > div:nth-child(3) {
              order: 3;
              justify-self: start;
              margin-left: 20px;
            }
            
            .chapter-row > div:nth-child(3) > div {
              justify-content: flex-start;
            }
          }
          
          @media (max-width: 768px) {
            .subject-card {
              min-height: auto;
            }
          }
          
          @media (max-width: 480px) {
            .chapter-row {
              padding: 12px 16px;
            }
            
            .action-button {
              padding: 6px 10px;
              font-size: 12px;
              min-width: 50px;
            }
            
            .table-header-mobile {
              display: none;
            }
            
            .subject-card {
              margin: 0 10px;
            }
            
            .chapter-row > div:nth-child(2),
            .chapter-row > div:nth-child(3) {
              margin-left: 10px;
            }
          }
          
          .chapter-row:hover {
            transform: translate3d(4px, 0, 0);
          }
          
          .chapter-row-even {
            background: #f8f9fa;
          }
          
          .chapter-row-odd {
            background: #ffffff;
          }
          
          .action-button {
            border: none;
            border-radius: 8px;
            padding: 6px 12px;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: transform 0.1s ease;
            will-change: transform;
            transform: translate3d(0, 0, 0);
          }
          
          .action-button:hover {
            transform: translate3d(0, -1px, 0);
          }
          
          .edit-button {
            background: #3498db;
          }
          
          .delete-button {
            background: #e74c3c;
          }
        `}</style>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(500px, 100%), 1fr))',
          gap: 'clamp(15px, 4vw, 30px)', 
          marginBottom: '30px',
          padding: '0 clamp(10px, 2vw, 20px)'
        }}>
          {/* Search Results Info */}
          {searchQuery && (
            <div style={{
              gridColumn: '1 / -1',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid #2196f3',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '16px' }}>🔍</span>
              <span style={{ color: '#1976d2', fontWeight: '600', fontSize: '14px' }}>
                Search results for "{searchQuery}" - Found {filteredSubjects.length} subject(s)
              </span>
              <button
                onClick={() => handleSearchChange('')}
                style={{
                  marginLeft: 'auto',
                  background: '#2196f3',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          )}

          {filteredSubjects.map(subject => {
            const subjectChapters = getChaptersBySubject(subject._id);
            
            return (
              <div key={subject._id} className="subject-card">
                {/* Simple Subject Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '24px 30px',
                  color: 'white'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '28px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '12px'
                    }}>
                      📚
                    </span>
                    {subject.name}
                  </h3>
                </div>

                {/* Simple Table Header */}
                <div className="table-header-mobile" style={{
                  background: '#f8f9fa',
                  padding: '20px 30px',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#495057'
                    }}>
                      📖 Chapter Name
                    </div>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#495057',
                      textAlign: 'center'
                    }}>
                      Questions
                    </div>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#495057',
                      textAlign: 'center'
                    }}>
                      ⚙️ Actions
                    </div>
                  </div>
                </div>

                {/* Chapter Rows */}
                <div style={{ 
                  padding: '20px 30px',
                  minHeight: '200px',
                  background: '#fff'
                }}>
                  {subjectChapters.length > 0 ? (
                    <div>
                      {subjectChapters.map((chapter, index) => {
                        const questionCount = getQuestionCountForChapter(chapter._id);
                        
                        return (
                          <div 
                            key={`${chapter._id}-${questionCount}`} 
                            className={`chapter-row ${index % 2 === 0 ? 'chapter-row-even' : 'chapter-row-odd'}`}
                          >
                            <div style={{ 
                              fontWeight: '600',
                              fontSize: '16px',
                              color: '#2c3e50',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                background: '#667eea',
                                borderRadius: '50%'
                              }} />
                              <span style={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {chapter.name}
                              </span>
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                              alignItems: 'center'
                            }}>
                              <div style={{
                                background: questionCount > 0 ? '#28a745' : '#ffc107',
                                color: '#fff',
                                padding: '6px 14px',
                                borderRadius: '16px',
                                fontWeight: '700',
                                fontSize: '14px',
                                minWidth: '40px',
                                textAlign: 'center',
                                flexShrink: 0
                              }}>
                                {questionCount}
                              </div>
                            </div>
                            
                            <div style={{ 
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              minWidth: '120px',
                              flexWrap: 'wrap'
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditChapterClick(chapter);
                                }}
                                className="action-button edit-button"
                                style={{ flexShrink: 0 }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChapter(chapter._id);
                                }}
                                className="action-button delete-button"
                                style={{ flexShrink: 0 }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      background: '#f8f9fa',
                      borderRadius: '16px',
                      border: '2px dashed #dee2e6'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                      <div style={{
                        color: '#6c757d',
                        fontSize: '16px',
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        Click the button below to add your first chapter
                      </div>
                    </div>
                  )}
                </div>

                {/* Simple Add Chapter Button */}
                <div style={{ 
                  padding: '20px 30px',
                  borderTop: '1px solid #e9ecef',
                  background: '#f8f9fa'
                }}>
                  <button 
                    onClick={() => {
                      setCurrentSubject(subject);
                      setChapterForm({ name: '', description: '', subject_id: subject._id });
                      setShowChapterModal(true);
                    }}
                    style={{
                      background: '#28a745',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '15px',
                      width: '100%',
                      transition: 'transform 0.1s ease',
                      willChange: 'transform',
                      transform: 'translate3d(0, 0, 0)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translate3d(0, -2px, 0)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translate3d(0, 0, 0)';
                    }}
                  >
                    ➕ Add New Chapter
                  </button>
                </div>
              </div>
            );
          })}

          {/* No results found message */}
          {searchQuery && filteredSubjects.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f8f9fa',
              borderRadius: '16px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{
                color: '#6c757d',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                No results found for "{searchQuery}"
              </div>
              <div style={{
                color: '#6c757d',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                Try searching for subjects, chapters, or their descriptions
              </div>
              <button
                onClick={() => handleSearchChange('')}
                style={{
                  background: '#007bff',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Simple Floating Add Button */}
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowSubjectModal(true)}
            style={{
              width: '60px',
              height: '60px',
              background: '#ff6b6b',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
              transition: 'transform 0.1s ease',
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translate3d(0, -3px, 0) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translate3d(0, 0, 0) scale(1)';
            }}
          >
            ➕
          </button>
        </div>
      </div>
    );
  };

  // Quiz Management view
  const QuizManagementView = () => (
    <div>
      <style>{`
        .quiz-card {
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          position: relative;
          min-height: 400px;
          cursor: pointer;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          transition: transform 0.2s ease;
          margin-bottom: 30px;
        }
        
        .quiz-card:hover {
          transform: translate3d(0, -8px, 0);
        }
        
        .question-row {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          cursor: pointer;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          transition: transform 0.15s ease;
          margin-bottom: 8px;
        }
        
        @media (max-width: 768px) {
          .question-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .question-row > div:nth-child(1) {
            order: 1;
          }
          
          .question-row > div:nth-child(2) {
            order: 2;
            justify-self: start;
            margin-left: 20px;
          }
          
          .question-row > div:nth-child(2) > div {
            justify-content: flex-start;
          }
        }
        
        @media (max-width: 768px) {
          .quiz-card {
            min-height: auto;
          }
        }
        
        .quiz-row-even {
          background: #f8f9fa;
        }
        
        .quiz-row-odd {
          background: #ffffff;
        }
        
        .action-button {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }
        
        .edit-button {
          background:rgb(80, 158, 241);
          color: white;
        }
        
        .edit-button:hover {
          background:rgb(31, 116, 212);
          transform: translateY(-1px);
        }
        
        .delete-button {
          background:rgb(241, 60, 78);
          color: white;
        }
        
        .delete-button:hover {
          background: #c82333;
          transform: translateY(-1px);
        }
      `}</style>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '30px',
        padding: '0 20px'
      }}>
        {/* Search Results Info */}
        {searchQuery && (
          <div style={{
            gridColumn: '1 / -1',
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '1px solid #ff9800',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '16px' }}>🔍</span>
            <span style={{ color: '#f57c00', fontWeight: '600', fontSize: '14px' }}>
              Search results for "{searchQuery}" - Found {filteredQuizzes.length} quiz(es)
            </span>
            <button
              onClick={() => handleSearchChange('')}
              style={{
                marginLeft: 'auto',
                background: '#ff9800',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        )}

        {filteredQuizzes.map(quiz => {
          const chapter = chapters.find(c => {
            const chapterId = typeof quiz.chapter_id === 'object' && quiz.chapter_id !== null 
              ? quiz.chapter_id._id || quiz.chapter_id.id 
              : quiz.chapter_id;
            return c._id === chapterId || c._id === String(chapterId) || String(c._id) === String(chapterId);
          });
          const subject = chapter ? subjects.find(s => {
            const subjectId = typeof chapter.subject_id === 'object' && chapter.subject_id !== null 
              ? chapter.subject_id._id || chapter.subject_id.id 
              : chapter.subject_id;
            return s._id === subjectId || s._id === String(subjectId) || String(s._id) === String(subjectId);
          }) : null;
          const quizQuestions = getQuestionsByQuiz(quiz._id);
          
          return (
            <div key={quiz._id} className="quiz-card">
              {/* Quiz Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '24px 30px',
                color: 'white'
              }}>
                                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    fontSize: '28px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '8px 12px',
                    borderRadius: '12px'
                  }}>
                    📝
                  </span>
                  {subject?.name || 'Unknown Subject'} - {chapter?.name || 'Unknown Chapter'}
                </h3>
                <div style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  Quiz
                </div>
              </div>

              {/* Quiz Info Section */}
              <div style={{
                background: '#f8f9fa',
                padding: '20px 30px',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#495057'
              }}>
                    📋 Question Title
                </div>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#495057',
                    textAlign: 'center'
                  }}>
                    ⚙️ Actions
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div style={{ 
                padding: '20px 30px',
                minHeight: '200px',
                background: '#fff'
              }}>
                {quizQuestions.length > 0 ? (
                  <div>
                    {quizQuestions.map((question, index) => {
                      return (
                        <div 
                          key={`${question._id}-${index}`} 
                          className={`question-row ${index % 2 === 0 ? 'quiz-row-even' : 'quiz-row-odd'}`}
                        >
                          <div style={{ 
                            fontWeight: '600',
                            fontSize: '16px',
                            color: '#2c3e50',
                      display: 'flex',
                      alignItems: 'center',
                            gap: '12px'
                    }}>
                      <div style={{ 
                              width: '24px',
                              height: '24px',
                              background: '#667eea',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: '700'
                      }}>
                        {index + 1}
                      </div>
                            <span style={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                      }}>
                        {question.question_title || 'Untitled Question'}
                            </span>
                                                </div>
                          
                          <div style={{ 
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            minWidth: '120px',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditQuestionClick(question);
                              }}
                              className="action-button edit-button"
                              style={{ flexShrink: 0 }}
                        >
                          Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(question._id);
                              }}
                              className="action-button delete-button"
                              style={{ flexShrink: 0 }}
                        >
                          Delete
                            </button>
                      </div>
                    </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#f8f9fa',
                    borderRadius: '16px',
                    border: '2px dashed #dee2e6'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <div style={{
                      color: '#6c757d',
                      fontSize: '16px',
                      fontWeight: '500',
                      marginBottom: '8px'
                  }}>
                      No questions yet. Click the button below to add your first question
                    </div>
                  </div>
                )}
              </div>

              {/* Add Question Button */}
              <div style={{ 
                padding: '20px 30px',
                borderTop: '1px solid #e9ecef',
                background: '#f8f9fa'
              }}>
                <button 
                  onClick={() => {
                    console.log('=== DEBUGGING QUIZ MODAL OPENING ===');
                    console.log('Full quiz object:', quiz);
                    console.log('Quiz keys:', Object.keys(quiz));
                    console.log('Quiz._id:', quiz._id);
                    console.log('Quiz.id:', quiz.id);
                    console.log('Quiz ID typeof:', typeof quiz._id);
                    console.log('Available chapters:', chapters);
                    console.log('Available quizzes:', quizzes);
                    
                    setCurrentQuiz(quiz);
                    // Don't spread questionForm to avoid overriding with empty values
                    const formData = { 
                      chapter_id: quiz.chapter_id,
                      quiz_id: quiz._id,  // Make sure this is set correctly
                      question_title: '',
                      question_statement: '',
                      option1: '',
                      option2: '',
                      option3: '',
                      option4: '',
                      correct_option: 1
                    };
                    console.log('Form data being set:', formData);
                    console.log('Form data quiz_id:', formData.quiz_id);
                    console.log('Form data quiz_id type:', typeof formData.quiz_id);
                    setQuestionForm(formData);
                    
                    // Debug the form state after setting
                    setTimeout(() => {
                      console.log('questionForm state after setting:', questionForm);
                    }, 100);
                    
                    setShowQuestionModal(true);
                  }}
                  style={{
                    background: '#28a745',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    width: '100%',
                    transition: 'transform 0.1s ease',
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translate3d(0, -2px, 0)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translate3d(0, 0, 0)';
                  }}
                >
                  ➕ Add New Question
                </button>
              </div>
            </div>
          );
        })}

        {/* No results found message for quizzes */}
        {searchQuery && filteredQuizzes.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            background: '#f8f9fa',
            borderRadius: '16px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{
              color: '#6c757d',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              No quizzes found for "{searchQuery}"
            </div>
            <div style={{
              color: '#6c757d',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              Try searching for quiz topics, chapter names, or subject names
            </div>
            <button
              onClick={() => handleSearchChange('')}
              style={{
                background: '#ffc107',
                border: 'none',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Add Quiz Card - Only show when not searching or when there are results */}
        {(!searchQuery || filteredQuizzes.length > 0) && (
          <div className="quiz-card" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed #667eea',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
          }}
          onClick={() => setShowQuizModal(true)}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <button style={{
                background: '#667eea',
              border: 'none',
                borderRadius: '12px',
              padding: '15px 25px',
                color: '#fff',
              cursor: 'pointer',
                fontWeight: '600',
              fontSize: '18px'
            }}>
                ➕ Add New Quiz
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );

  // Helper function to calculate subject-wise top scores
  const getSubjectWiseTopScores = () => {
    console.log('=== CALCULATING SUBJECT-WISE TOP SCORES ===');
    console.log('Available subjects:', subjects);
    console.log('Available scores:', scores);
    console.log('Available quizzes:', quizzes);
    console.log('Available chapters:', chapters);

    const subjectStats = {};

    // Initialize stats for each subject
    subjects.forEach(subject => {
      subjectStats[subject._id] = {
        name: subject.name,
        topScore: 0,
        totalAttempts: 0,
        allScores: []
      };
    });

    // Calculate scores for each subject
    scores.forEach(score => {
      // Handle null quiz_id
      if (!score.quiz_id) return;

      // Find the quiz for this score - handle different ID formats
      const scoreQuizId = typeof score.quiz_id === 'object' && score.quiz_id !== null 
        ? score.quiz_id._id || score.quiz_id.id 
        : score.quiz_id;
      
      const quiz = quizzes.find(q => {
        return q._id === scoreQuizId || q._id === String(scoreQuizId) || String(q._id) === String(scoreQuizId);
      });
      
      if (!quiz) {
        console.log('Quiz not found for score:', score);
        return;
      }

      // Find the chapter for this quiz - handle different ID formats
      const chapterQuizId = typeof quiz.chapter_id === 'object' && quiz.chapter_id !== null 
        ? quiz.chapter_id._id || quiz.chapter_id.id 
        : quiz.chapter_id;
      
      const chapter = chapters.find(c => {
        return c._id === chapterQuizId || c._id === String(chapterQuizId) || String(c._id) === String(chapterQuizId);
      });
      
      if (!chapter) {
        console.log('Chapter not found for quiz:', quiz);
        return;
      }

      // Find the subject for this chapter - handle different ID formats
      const subjectChapterId = typeof chapter.subject_id === 'object' && chapter.subject_id !== null 
        ? chapter.subject_id._id || chapter.subject_id.id 
        : chapter.subject_id;

      if (subjectStats[subjectChapterId]) {
        // Calculate score percentage - use correct field names
        const totalScored = score.total_scored || score.score || 0;
        const totalQuestions = score.total_questions || 0;
        
        // Get total questions from quiz if not in score
        let actualTotalQuestions = totalQuestions;
        if (actualTotalQuestions === 0) {
          const quizQuestions = questions.filter(q => {
            const questionQuizId = typeof q.quiz_id === 'object' && q.quiz_id !== null 
              ? q.quiz_id._id || q.quiz_id.id 
              : q.quiz_id;
            return questionQuizId === quiz._id || String(questionQuizId) === String(quiz._id);
          });
          actualTotalQuestions = quizQuestions.length;
        }
        
        if (actualTotalQuestions > 0) {
          const scorePercentage = Math.round((totalScored / actualTotalQuestions) * 100);
          subjectStats[subjectChapterId].allScores.push(scorePercentage);
          subjectStats[subjectChapterId].totalAttempts++;
          
          // Update top score if this is higher
          if (scorePercentage > subjectStats[subjectChapterId].topScore) {
            subjectStats[subjectChapterId].topScore = scorePercentage;
          }
          
          console.log(`Score for ${subjectStats[subjectChapterId].name}: ${scorePercentage}% (${totalScored}/${actualTotalQuestions})`);
        }
      }
    });

    console.log('Calculated subject stats:', subjectStats);
    return subjectStats;
  };

  // Helper function to get subject-wise user attempts
  const getSubjectWiseAttempts = () => {
    const subjectStats = getSubjectWiseTopScores();
    return Object.values(subjectStats).map(stat => ({
      name: stat.name,
      attempts: stat.totalAttempts
    }));
  };

  // Export View Component
  const ExportView = () => {
    return (
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '20px',
          color: 'white',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>📥 Data Export Center</h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
            Export your quiz data in CSV format for analysis and reporting
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '25px'
        }}>
          {/* Quiz Data Export */}
          <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
              <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Quiz Data</h3>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                Export comprehensive quiz information including subjects, chapters, dates, and question counts
              </p>
            </div>
            <button
              onClick={handleExportQuizData}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 25px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📥 Export Quiz Data
            </button>
          </div>

          {/* Quiz Attempts Export */}
          <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Quiz Attempts</h3>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                Export detailed student attempt data including scores, timestamps, and performance metrics
              </p>
            </div>
            <button
              onClick={handleExportQuizAttempts}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 25px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📥 Export Quiz Attempts
            </button>
          </div>

          {/* User Engagement Export */}
          <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
              <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>User Engagement</h3>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                Export user activity data including engagement metrics and participation statistics
              </p>
            </div>
            <button
              onClick={handleExportUserEngagement}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 25px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(253, 126, 20, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📥 Export User Engagement
            </button>
          </div>
        </div>

        <div style={{
          background: '#f8f9fa',
          borderRadius: '15px',
          padding: '25px',
          marginTop: '30px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ color: '#2c3e50', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ℹ️ Export Information
          </h4>
          <ul style={{ color: '#6c757d', margin: 0, paddingLeft: '20px' }}>
            <li>All exports are generated in CSV format for easy analysis in spreadsheet applications</li>
            <li>Data includes comprehensive information with proper headers and formatting</li>
            <li>Files are automatically downloaded to your default download folder</li>
            <li>Export data is current as of the time of generation</li>
          </ul>
        </div>
      </div>
    );
  };

  // Notifications View Component
  const NotificationsView = () => {
    return (
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '20px',
          color: 'white',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>🔔 Notification Center</h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
            Manage and trigger email notifications for user engagement
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '25px'
        }}>
          {/* Daily Reminders */}
          <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏰</div>
              <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Daily Reminders</h3>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                Send reminder emails to users who haven't been active in the last 24 hours
              </p>
            </div>
            <button
              onClick={handleTriggerDailyReminders}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 25px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📧 Send Daily Reminders
            </button>
          </div>

          {/* Monthly Reports */}
          <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
              <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Monthly Reports</h3>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                Send comprehensive monthly activity reports to all users with their performance metrics
              </p>
            </div>
            <button
              onClick={handleTriggerMonthlyReports}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 25px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📧 Send Monthly Reports
            </button>
          </div>

          {/* Engagement Notifications */}
          <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📈</div>
              <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Engagement Report</h3>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                Send admin engagement notifications with user activity statistics and inactive user alerts
              </p>
            </div>
            <button
              onClick={handleTriggerEngagementNotification}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 25px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📧 Send Engagement Report
            </button>
          </div>
        </div>


        <div style={{
          background: '#f8f9fa',
          borderRadius: '15px',
          padding: '25px',
          marginTop: '30px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ color: '#2c3e50', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📅 Scheduled Notifications
          </h4>
          <div style={{ color: '#6c757d' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>Automatic Schedule:</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Daily Reminders:</strong> Sent automatically at 9:00 AM every day to inactive users</li>
              <li><strong>Monthly Reports:</strong> Sent automatically on the 1st of every month at 1:00 AM</li>
              <li><strong>Weekly Engagement Reports:</strong> Sent to admins every Monday at 8:00 AM</li>
            </ul>
            <p style={{ margin: '15px 0 0 0', fontSize: '14px', fontStyle: 'italic' }}>
              Use the buttons above to manually trigger notifications for testing or immediate sending.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Summary Charts view - using real data
  const SummaryView = () => {
    const subjectStats = getSubjectWiseTopScores();
    const subjectAttempts = getSubjectWiseAttempts();

    // Check if we have any data
    const hasScoreData = Object.values(subjectStats).some(stat => stat.topScore > 0);
    const hasAttemptData = subjectAttempts.some(stat => stat.attempts > 0);

    // Prepare data for top scores chart
    const subjectScoresData = {
      labels: hasScoreData 
        ? Object.values(subjectStats).map(stat => 
            `${stat.name}(${Math.round(stat.topScore)}%)`
          )
        : subjects.map(s => `${s.name}(0%)`),
      datasets: [{
        label: 'Top Scores (%)',
        data: hasScoreData 
          ? Object.values(subjectStats).map(stat => Math.round(stat.topScore))
          : subjects.map(() => 0),
        backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCE56', '#FF6384', '#9966FF', '#FF9F40']
      }]
    };

    // Prepare data for user attempts chart
    const userAttemptsData = {
      labels: hasAttemptData 
        ? subjectAttempts.map(stat => stat.name)
        : subjects.map(s => s.name),
      datasets: [{
        data: hasAttemptData 
          ? subjectAttempts.map(stat => stat.attempts)
          : subjects.map(() => 1), // Show 1 to make pie chart visible
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
      }]
    };

    return (
      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{
          width: '50%',
          border: '2px solid #000',
          borderRadius: '15px',
          backgroundColor: '#fff'
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
            Subject wise top scores
          </div>
          <div style={{ padding: '20px', height: '300px' }}>
            <Bar 
              data={subjectScoresData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      }
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 0
                    }
                  }
                }
              }} 
            />
          </div>
          <div style={{ 
            padding: '10px', 
            textAlign: 'center',
            borderTop: '1px solid #eee'
          }}>
            <small style={{ color: '#666' }}>
              {hasScoreData 
                ? Object.values(subjectStats).map(stat => 
                    `${stat.name}(${Math.round(stat.topScore)}%)`
                  ).join(' ')
                : subjects.length > 0 
                  ? subjects.map(s => `${s.name}(0%)`).join(' ')
                  : 'No subjects created yet'
              }
            </small>
          </div>
        </div>
        
        <div style={{
          width: '50%',
          border: '2px solid #000',
          borderRadius: '15px',
          backgroundColor: '#fff'
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
            Subject wise user attempts
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
                data={userAttemptsData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom'
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                          const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                          return `${context.label}: ${context.parsed} attempts (${percentage}%)`;
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
    <>
      {/* Global Modal Styles */}
      <style>{`
        .modal-overlay-responsive {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 1050 !important;
          overflow-y: auto !important;
          padding: 20px !important;
        }
        
        .modal-overlay-responsive > div {
          margin: auto !important;
        }
        
        /* Prevent text selection in modals */
        .modal-overlay-responsive * {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        /* Smooth scrolling within modal content */
        .modal-overlay-responsive > div {
          scroll-behavior: smooth;
        }
      `}</style>
      
      <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '0' }}>
      {/* Compact Enhanced Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
        borderRadius: '20px',
        padding: '20px 25px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '1300px',
        margin: '0 auto 20px auto'
      }}>
        {/* Subtle Background Decorations */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '-15px',
          width: '60px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        
        {/* Header Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Main Title Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{
                fontSize: '28px',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }}>
                🎯
              </span>
            </div>
            
            <h1 style={{
              color: '#fff',
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: '700',
              margin: 0,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-0.01em',
              background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              BCA Quest
            </h1>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{
                fontSize: '28px',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }}>
                📚
              </span>
            </div>
          </div>
          
          {/* Subtitle */}
          <div style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            fontWeight: '500',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            letterSpacing: '0.3px'
          }}>
            Administrative Dashboard
          </div>
          
          {/* Compact Feature Pills */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '4px'
          }}>
            {[
              { icon: '📝', text: 'Quizzes' },
              { icon: '📊', text: 'Analytics' },
              { icon: '👥', text: 'Users' },
              { icon: '⚙️', text: 'Settings' }
            ].map((feature, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
              }}
              >
                <span style={{ fontSize: '14px' }}>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation and Content Container */}
      <div className="container-fluid px-3">
        <NavigationBar 
          view={view}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onViewChange={handleViewChange}
        />
        
        <div style={{ paddingTop: '0' }}>
          {view === 'subjects' && <SubjectsView />}
          {view === 'quizzes' && <QuizManagementView />}
          {view === 'summary' && <SummaryView />}
          {view === 'export' && <ExportView />}
          {view === 'notifications' && <NotificationsView />}
        </div>
      </div>

      {/* Subject Modal */}
      {showSubjectModal && createPortal(
        <div 
          className="modal-overlay-responsive" 
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSubjectModal(false);
            }
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>New Subject</h5>
              <button 
                type="button" 
                onClick={() => setShowSubjectModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubject}>
              <div style={{ padding: '25px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Name :
                  </label>
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #007bff',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#0056b3'}
                    onBlur={(e) => e.target.style.borderColor = '#007bff'}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Description :
                  </label>
                  <textarea 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #007bff',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={subjectForm.description}
                    onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#0056b3'}
                    onBlur={(e) => e.target.style.borderColor = '#007bff'}
                  />
                  <small style={{ color: '#6c757d', fontSize: '12px' }}>
                    Note: may include more input fields...
                  </small>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '20px',
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                borderRadius: '0 0 12px 12px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowSubjectModal(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#545b62'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    backgroundColor: '#007bff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Chapter Modal */}
      {showChapterModal && createPortal(
        <div 
          className="modal-overlay-responsive" 
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
          onClick={(e) => {
            // Close modal if clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowChapterModal(false);
            }
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>New Chapter</h5>
              <button 
                type="button" 
                onClick={() => setShowChapterModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateChapter}>
              <div style={{ padding: '25px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Name :
                  </label>
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #28a745',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={chapterForm.name}
                    onChange={(e) => setChapterForm({...chapterForm, name: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#1e7e34'}
                    onBlur={(e) => e.target.style.borderColor = '#28a745'}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Description :
                  </label>
                  <textarea 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #28a745',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={chapterForm.description}
                    onChange={(e) => setChapterForm({...chapterForm, description: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#1e7e34'}
                    onBlur={(e) => e.target.style.borderColor = '#28a745'}
                  />
                  <small style={{ color: '#6c757d', fontSize: '12px' }}>
                    Note: may include more input fields...
                  </small>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '20px',
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                borderRadius: '0 0 12px 12px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowChapterModal(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#545b62'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    backgroundColor: '#28a745',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1e7e34'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Quiz Modal */}
      {showQuizModal && createPortal(
        <div 
          className="modal-overlay-responsive" 
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQuizModal(false);
            }
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              backgroundColor: '#ffc107',
              color: '#000',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>New Quiz</h5>
              <button 
                type="button" 
                onClick={() => setShowQuizModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#000',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateQuiz}>
              <div style={{ padding: '25px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Chapter ID :
                  </label>
                  <select 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff'
                    }}
                    value={quizForm.chapter_id}
                    onChange={(e) => setQuizForm({...quizForm, chapter_id: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter._id} value={chapter._id}>{chapter.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Date :
                  </label>
                  <input 
                    type="date" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={quizForm.date}
                    onChange={(e) => setQuizForm({...quizForm, date: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Duration :
                  </label>
                  <input 
                    type="number" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Minutes"
                    value={quizForm.duration}
                    onChange={(e) => setQuizForm({...quizForm, duration: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Title/Remarks :
                  </label>
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter quiz title or remarks"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  />
                  <small style={{ color: '#6c757d', fontSize: '12px' }}>
                    Optional: Enter a title or remarks for this quiz
                  </small>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '20px',
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                borderRadius: '0 0 12px 12px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowQuizModal(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#545b62'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    backgroundColor: '#ffc107',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: '#000',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e0a800'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc107'}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Question Modal */}
      {showQuestionModal && createPortal(
        <div 
          className="modal-overlay-responsive" 
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQuestionModal(false);
              setCurrentQuiz(null);
            }
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              border: '3px solid #000',
              borderRadius: '20px',
              padding: '0',
              width: '700px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              backgroundColor: '#ffc107',
              color: '#000',
              padding: '20px 30px',
              borderRadius: '17px 17px 0 0',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '22px',
              borderBottom: '2px solid #000',
              position: 'relative'
            }}>
              <span style={{ marginRight: '10px', fontSize: '24px' }}>📝</span>
              New Question
              <button
                type="button"
                onClick={() => {
                  setShowQuestionModal(false);
                  setCurrentQuiz(null);
                }}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#000',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateQuestion}>
              <div style={{ padding: '35px' }}>
                {/* Chapter ID Row */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '25px',
                  gap: '20px'
                }}>
                  <label style={{ 
                    color: '#007bff', 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    minWidth: '160px',
                    textAlign: 'left'
                  }}>
                    Chapter ID :
                  </label>
                  <select 
                    style={{
                      flex: 1,
                      padding: '12px 15px',
                      border: '2px solid #007bff',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: '#fff',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    value={questionForm.chapter_id}
                    onChange={(e) => {
                      const selectedChapterId = e.target.value;
                      setQuestionForm({...questionForm, chapter_id: selectedChapterId, quiz_id: ''});
                    }}
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0056b3';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter._id} value={chapter._id}>{chapter.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quiz ID Row (Hidden field but still functional) */}
                <input 
                  type="hidden"
                  value={questionForm.quiz_id || currentQuiz?._id || ''}
                />

                {/* Question Title Row */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '25px',
                  gap: '20px'
                }}>
                  <label style={{ 
                    color: '#007bff', 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    minWidth: '160px',
                    textAlign: 'left'
                  }}>
                    Question Title :
                  </label>
                  <input 
                    type="text" 
                    style={{
                      flex: 1,
                      padding: '12px 15px',
                      border: '2px solid #007bff',
                      borderRadius: '10px',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    value={questionForm.question_title}
                    onChange={(e) => setQuestionForm({...questionForm, question_title: e.target.value})}
                    required
                    placeholder="Enter question title..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0056b3';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Question Statement Row */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  marginBottom: '35px',
                  gap: '20px'
                }}>
                  <label style={{ 
                    color: '#007bff', 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    minWidth: '160px',
                    textAlign: 'left',
                    paddingTop: '12px'
                  }}>
                    Question Statement :
                  </label>
                  <textarea 
                    style={{
                      flex: 1,
                      padding: '15px',
                      border: '2px solid #007bff',
                      borderRadius: '10px',
                      fontSize: '15px',
                      minHeight: '100px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    value={questionForm.question_statement}
                    onChange={(e) => setQuestionForm({...questionForm, question_statement: e.target.value})}
                    required
                    placeholder="Enter the detailed question statement..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0056b3';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                {/* Single Option Correct Section */}
                <div style={{
                  border: '3px solid #000',
                  borderRadius: '18px',
                  padding: '25px',
                  marginBottom: '35px',
                  backgroundColor: '#fafafa',
                  overflow: 'hidden' // Prevent overflow
                }}>
                  <div style={{
                    backgroundColor: '#ffc107',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    textAlign: 'center',
                    marginBottom: '25px',
                    padding: '12px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <span style={{ marginRight: '8px' }}>🎯</span>
                    Single Option Correct
                  </div>
                  
                  {/* Options in 2x2 Grid with Better Alignment */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginBottom: '25px',
                    width: '100%' // Ensure full width usage
                  }}>
                    {/* Option 1 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '8px',
                      backgroundColor: '#fff',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      minWidth: 0 // Allow shrinking
                    }}>
                      <label style={{ 
                        color: '#007bff', 
                        fontWeight: 'bold', 
                        fontSize: '14px',
                        textAlign: 'left',
                        marginBottom: '0'
                      }}>
                        Option 1)
                      </label>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '2px solid #007bff',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        value={questionForm.option1}
                        onChange={(e) => setQuestionForm({...questionForm, option1: e.target.value})}
                        required
                        placeholder="Enter option 1"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0056b3';
                          e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#007bff';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Option 2 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '8px',
                      backgroundColor: '#fff',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      minWidth: 0 // Allow shrinking
                    }}>
                      <label style={{ 
                        color: '#007bff', 
                        fontWeight: 'bold', 
                        fontSize: '14px',
                        textAlign: 'left',
                        marginBottom: '0'
                      }}>
                        Option 2)
                      </label>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '2px solid #007bff',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        value={questionForm.option2}
                        onChange={(e) => setQuestionForm({...questionForm, option2: e.target.value})}
                        required
                        placeholder="Enter option 2"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0056b3';
                          e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#007bff';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Option 3 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '8px',
                      backgroundColor: '#fff',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      minWidth: 0 // Allow shrinking
                    }}>
                      <label style={{ 
                        color: '#007bff', 
                        fontWeight: 'bold', 
                        fontSize: '14px',
                        textAlign: 'left',
                        marginBottom: '0'
                      }}>
                        Option 3)
                      </label>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '2px solid #007bff',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        value={questionForm.option3}
                        onChange={(e) => setQuestionForm({...questionForm, option3: e.target.value})}
                        required
                        placeholder="Enter option 3"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0056b3';
                          e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#007bff';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Option 4 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '8px',
                      backgroundColor: '#fff',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      minWidth: 0 // Allow shrinking
                    }}>
                      <label style={{ 
                        color: '#007bff', 
                        fontWeight: 'bold', 
                        fontSize: '14px',
                        textAlign: 'left',
                        marginBottom: '0'
                      }}>
                        Option 4)
                      </label>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '2px solid #007bff',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        value={questionForm.option4}
                        onChange={(e) => setQuestionForm({...questionForm, option4: e.target.value})}
                        required
                        placeholder="Enter option 4"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0056b3';
                          e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#007bff';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Correct Option */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '2px solid #28a745',
                    flexWrap: 'wrap' // Allow wrapping on small screens
                  }}>
                    <label style={{ 
                      color: '#28a745', 
                      fontWeight: 'bold', 
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexShrink: 0
                    }}>
                      <span>🎯</span>
                      Correct option:
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <select 
                        style={{
                          padding: '10px 35px 10px 12px',
                          border: '2px solid #28a745',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          appearance: 'none',
                          minWidth: '120px',
                          fontWeight: 'bold',
                          color: '#28a745',
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        value={questionForm.correct_option}
                        onChange={(e) => setQuestionForm({...questionForm, correct_option: parseInt(e.target.value)})}
                        required
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1e7e34';
                          e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#28a745';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value={1}>Option 1</option>
                        <option value={2}>Option 2</option>
                        <option value={3}>Option 3</option>
                        <option value={4}>Option 4</option>
                      </select>
                      {/* Enhanced Diamond icon */}
                      <span style={{
                        position: 'absolute',
                        right: '10px',
                        color: '#ffc107',
                        fontSize: '14px',
                        pointerEvents: 'none',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                      }}>
                        ♦
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                padding: '25px 35px 35px 35px',
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa'
              }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#007bff',
                    border: '2px solid #007bff',
                    borderRadius: '12px',
                    padding: '15px 30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0056b3';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#007bff';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                  }}
                >
                  <span>💾</span>
                  Save and Next
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setCurrentQuiz(null);
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    border: '2px solid #6c757d',
                    borderRadius: '12px',
                    padding: '15px 30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#545b62';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(108, 117, 125, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6c757d';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
                  }}
                >
                  <span>✕</span>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Chapter Modal */}
      {showEditChapterModal && createPortal(
        <div 
          className="modal-overlay-responsive" 
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditChapterModal(false);
            }
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              backgroundColor: '#ffc107',
              color: '#000',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Edit Chapter</h5>
              <button 
                type="button" 
                onClick={() => setShowEditChapterModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#000',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditChapter}>
              <div style={{ padding: '25px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Name :
                  </label>
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={editChapterForm.name}
                    onChange={(e) => setEditChapterForm({...editChapterForm, name: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Description :
                  </label>
                  <textarea 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={editChapterForm.description}
                    onChange={(e) => setEditChapterForm({...editChapterForm, description: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  />
                  <small style={{ color: '#6c757d', fontSize: '12px' }}>
                    Note: may include more input fields...
                  </small>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '20px',
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                borderRadius: '0 0 12px 12px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditChapterModal(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#545b62'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    backgroundColor: '#ffc107',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: '#000',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e0a800'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc107'}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Question Modal */}
      {showEditQuestionModal && createPortal(
        <div 
          className="modal-overlay-responsive" 
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditQuestionModal(false);
            }
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '600px',
              maxWidth: '95vw',
              maxHeight: '95vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              backgroundColor: '#ffc107',
              color: '#000',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Edit Question</h5>
              <button 
                type="button" 
                onClick={() => setShowEditQuestionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#000',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditQuestion}>
              <div style={{ padding: '25px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Question Title :
                  </label>
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={editQuestionForm.question_title}
                    onChange={(e) => setEditQuestionForm({...editQuestionForm, question_title: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Question Statement :
                  </label>
                  <textarea 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={editQuestionForm.question_statement}
                    onChange={(e) => setEditQuestionForm({...editQuestionForm, question_statement: e.target.value})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  />
                </div>
                
                {/* Options Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      Option 1 :
                    </label>
                    <input 
                      type="text" 
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ffc107',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      value={editQuestionForm.option1}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, option1: e.target.value})}
                      required
                      onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                      onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      Option 2 :
                    </label>
                    <input 
                      type="text" 
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ffc107',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      value={editQuestionForm.option2}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, option2: e.target.value})}
                      required
                      onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                      onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      Option 3 :
                    </label>
                    <input 
                      type="text" 
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ffc107',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      value={editQuestionForm.option3}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, option3: e.target.value})}
                      required
                      onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                      onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      Option 4 :
                    </label>
                    <input 
                      type="text" 
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ffc107',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      value={editQuestionForm.option4}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, option4: e.target.value})}
                      required
                      onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                      onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Correct Option :
                  </label>
                  <select 
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff'
                    }}
                    value={editQuestionForm.correct_option}
                    onChange={(e) => setEditQuestionForm({...editQuestionForm, correct_option: parseInt(e.target.value)})}
                    required
                    onFocus={(e) => e.target.style.borderColor = '#e0a800'}
                    onBlur={(e) => e.target.style.borderColor = '#ffc107'}
                  >
                    <option value={1}>Option 1</option>
                    <option value={2}>Option 2</option>
                    <option value={3}>Option 3</option>
                    <option value={4}>Option 4</option>
                  </select>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '20px',
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                borderRadius: '0 0 12px 12px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditQuestionModal(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#545b62'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    backgroundColor: '#ffc107',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: '#000',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e0a800'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc107'}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      </div>
    </>
  );
};

export default AdminDashboard; 