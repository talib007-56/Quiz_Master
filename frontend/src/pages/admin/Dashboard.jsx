import { useState, useEffect, useMemo, useCallback } from 'react';
import { subjectsAPI, chaptersAPI, quizzesAPI, questionsAPI, scoresAPI } from '../../services/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
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
      // Handle both ObjectId and string comparison
      const questionQuizId = typeof question.quiz_id === 'object' 
        ? question.quiz_id._id || question.quiz_id.toString()
        : question.quiz_id;
      
      console.log(`Question ${question._id}: quiz_id = ${questionQuizId} (type: ${typeof questionQuizId})`);
      console.log(`Comparing: "${questionQuizId}" === "${quizId}" = ${questionQuizId === quizId}`);
      
      return questionQuizId === quizId || questionQuizId === String(quizId) || String(questionQuizId) === String(quizId);
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
          const questionQuizId = typeof question.quiz_id === 'object' 
            ? question.quiz_id._id || question.quiz_id.toString()
            : question.quiz_id;
          
          const matches = questionQuizId === quiz._id || 
                         questionQuizId === String(quiz._id) || 
                         String(questionQuizId) === String(quiz._id);
          
          if (matches) {
            console.log(`  ✓ Question "${question.question_title}" matches quiz ${quiz._id}`);
          }
          
          return matches;
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

  // Navigation bar component - exactly like wireframe
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
            color: view === 'subjects' ? '#007bff' : '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={() => setView('subjects')}
        >
          Home
        </span>
        <span style={{ color: '#6c757d' }}>|</span>
        <span 
          style={{ 
            color: view === 'quizzes' ? '#007bff' : '#28a745',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          onClick={() => setView('quizzes')}
        >
          Quiz
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
        >
          Logout
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Search" 
          style={{
            padding: '8px 12px',
            border: '2px solid #007bff',
            borderRadius: '8px',
            width: '150px'
          }}
        />
        {/* <span style={{ color: '#007bff', fontWeight: 'bold', fontSize: '16px' }}>
          Welcome Admin
        </span> */}
      </div>
    </div>
  );

  // Subjects view component - exactly matching wireframe with proper table
  const SubjectsView = () => (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
        {subjects.map(subject => {
          const subjectChapters = getChaptersBySubject(subject._id);
          console.log(`Subject ${subject.name} (${subject._id}) has chapters:`, subjectChapters);
          
          return (
            <div key={subject._id} style={{
              width: '45%',
              border: '2px solid #000',
              borderRadius: '15px',
              backgroundColor: '#fff'
            }}>
              {/* Subject Header */}
              <div style={{
                textAlign: 'center',
                padding: '15px',
                borderBottom: '1px solid #ccc',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {subject.name}
              </div>

              {/* Table Header - Fixed to match data row layout */}
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
                <div style={{ width: '40%', textAlign: 'left' }}>
                  Chapter name
                </div>
                <div style={{ width: '25%', textAlign: 'center' }}>
                  No.of Questions
                </div>
                <div style={{ width: '35%', textAlign: 'center' }}>
                  Action
                </div>
              </div>

              {/* Chapter Rows - Fixed alignment and padding */}
              <div style={{ padding: '0 20px', minHeight: '120px', margin: '0 15px' }}>
                {subjectChapters.length > 0 ? (
                  subjectChapters.map(chapter => {
                    const questionCount = getQuestionCountForChapter(chapter._id);
                    console.log(`Displaying chapter "${chapter.name}" with count: ${questionCount}`);
                    
                    return (
                      <div key={`${chapter._id}-${questionCount}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #eee',
                        fontSize: '14px'
                      }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          width: '40%', 
                          textAlign: 'left',
                          paddingRight: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {chapter.name}
                        </div>
                        <div style={{ 
                          width: '25%', 
                          textAlign: 'center',
                          fontWeight: '500'
                        }}>
                          {questionCount}
                        </div>
                        <div style={{ 
                          width: '35%', 
                          textAlign: 'center',
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '8px'
                        }}>
                          <span 
                            style={{ 
                              color: '#007bff', 
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontSize: '14px'
                            }}
                            onClick={() => handleEditChapterClick(chapter)}
                          >
                            Edit
                          </span>
                          <span style={{ color: '#666' }}>/</span>
                          <span 
                            style={{ 
                              color: '#dc3545', 
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontSize: '14px'
                            }}
                            onClick={() => handleDeleteChapter(chapter._id)}
                          >
                            Delete
                          </span>
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
                    No chapters yet. Click "+ Chapter" to add one.
                  </div>
                )}
              </div>

              {/* Add Chapter Button */}
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <button 
                  style={{
                    backgroundColor: '#ffc107',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 15px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => {
                    setCurrentSubject(subject);
                    setChapterForm({ name: '', description: '', subject_id: subject._id });
                    setShowChapterModal(true);
                  }}
                >
                  + Chapter
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* All subjects here text */}
      <div style={{ 
        color: '#007bff', 
        fontSize: '18px', 
        fontStyle: 'italic',
        marginBottom: '20px'
      }}>
        All subjects here ...
      </div>

      {/* Temporary Debug Button */}
      <button 
        onClick={() => {
          console.log('=== MANUAL DEBUG CHECK ===');
          console.log('Current Questions:', questions.length);
          console.log('Current Quizzes:', quizzes.length);
          console.log('Current Chapters:', chapters.length);
          console.log('Chapter Question Counts:', chapterQuestionCounts);
          
          // Force a re-calculation
          console.log('Forcing data fetch...');
          fetchData();
        }}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        Debug Question Counts
      </button>

      {/* Add Subject Button (Orange Circle) */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        backgroundColor: '#ff8c00',
        borderRadius: '50%',
        border: '3px solid #000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '30px',
        fontWeight: 'bold',
        color: '#000'
      }}
      onClick={() => setShowSubjectModal(true)}
      >
        +
      </div>
    </div>
  );

  // Quiz Management view
  const QuizManagementView = () => (
    <div>
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {quizzes.map(quiz => {
          const chapter = chapters.find(c => c._id === quiz.chapter_id);
          const quizQuestions = getQuestionsByQuiz(quiz._id);
          
          return (
            <div key={quiz._id} style={{
              width: '45%',
              border: '2px solid #000',
              borderRadius: '15px',
              backgroundColor: '#fff',
              marginBottom: '20px'
            }}>
              {/* Quiz Header */}
              <div style={{
                textAlign: 'center',
                padding: '15px',
                borderBottom: '1px solid #ccc',
                fontSize: '20px',
                fontWeight: 'bold',
                backgroundColor: '#f8f9fa'
              }}>
                Quiz{quiz.title ? `(${quiz.title})` : chapter?.name ? `(${chapter.name})` : ''}
              </div>

              {/* Table Header - Exactly matching wireframe */}
              <div style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                padding: '12px 15px',
                margin: '15px 15px 0 15px',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                border: '1px solid #17a2b8'
              }}>
                <div style={{ width: '15%', textAlign: 'center' }}>
                  ID
                </div>
                <div style={{ width: '50%', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.3)', paddingLeft: '10px' }}>
                  Q_Title
                </div>
                <div style={{ width: '35%', textAlign: 'center' }}>
                  Action
                </div>
              </div>

              {/* Question Rows - Exactly matching wireframe */}
              <div style={{ margin: '0 15px 15px 15px', border: '1px solid #17a2b8', borderTop: 'none', minHeight: '120px' }}>
                {quizQuestions.length > 0 ? (
                  quizQuestions.map((question, index) => (
                    <div key={question._id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 15px',
                      borderBottom: index < quizQuestions.length - 1 ? '1px solid #dee2e6' : 'none',
                      fontSize: '14px',
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                    }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        width: '15%', 
                        textAlign: 'center',
                        fontSize: '16px',
                        color: '#17a2b8'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ 
                        width: '50%', 
                        textAlign: 'left',
                        paddingLeft: '15px',
                        paddingRight: '15px',
                        fontWeight: '500',
                        borderLeft: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6'
                      }}>
                        {question.question_title || 'Untitled Question'}
                      </div>
                      <div style={{ 
                        width: '35%', 
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '5px',
                        alignItems: 'center'
                      }}>
                        <span 
                          style={{ 
                            color: '#007bff', 
                            cursor: 'pointer',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                          onClick={() => handleEditQuestionClick(question)}
                        >
                          Edit
                        </span>
                        <span style={{ color: '#666', fontWeight: 'bold' }}>/</span>
                        <span 
                          style={{ 
                            color: '#dc3545', 
                            cursor: 'pointer',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                          onClick={() => handleDeleteQuestion(question._id)}
                        >
                          Delete
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#666',
                    fontStyle: 'italic',
                    padding: '40px 20px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    No questions yet. Click "+ Question" to add one.
                  </div>
                )}
              </div>

              {/* Add Question Button */}
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <button 
                  style={{
                    backgroundColor: '#ffc107',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 15px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
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
                >
                  + Question
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Quiz Button */}
        <div style={{
          width: '45%',
          height: '200px',
          border: '2px dashed #ffc107',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
        onClick={() => setShowQuizModal(true)}
        >
          <button style={{
            backgroundColor: '#ffc107',
            border: 'none',
            borderRadius: '8px',
            padding: '15px 25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            + New Quiz
          </button>
        </div>
      </div>

      <div style={{ 
        color: '#007bff', 
        fontSize: '18px', 
        fontStyle: 'italic',
        marginTop: '20px'
      }}>
        All quizzes here ...
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
      // Find the quiz for this score
      const quiz = quizzes.find(q => q._id === score.quiz_id);
      if (!quiz) return;

      // Find the chapter for this quiz
      const chapter = chapters.find(c => c._id === quiz.chapter_id);
      if (!chapter) return;

      // Find the subject for this chapter
      const subjectId = typeof chapter.subject_id === 'object' 
        ? chapter.subject_id._id 
        : chapter.subject_id;

      if (subjectStats[subjectId]) {
        const scorePercentage = (score.score / score.total_questions) * 100;
        subjectStats[subjectId].allScores.push(scorePercentage);
        subjectStats[subjectId].totalAttempts++;
        
        // Update top score if this is higher
        if (scorePercentage > subjectStats[subjectId].topScore) {
          subjectStats[subjectId].topScore = scorePercentage;
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
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Main Title */}
      <h1 style={{ 
        textAlign: 'center', 
        color: '#007bff', 
        marginBottom: '30px',
        fontSize: '32px',
        fontWeight: 'bold'
      }}>
        Admin Dashboard
      </h1>
      
      <NavigationBar />
      
      {view === 'subjects' && <SubjectsView />}
      {view === 'quizzes' && <QuizManagementView />}
      {view === 'summary' && <SummaryView />}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">New Subject</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSubjectModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubject}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description :</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={subjectForm.description}
                      onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                      required
                    ></textarea>
                    <small className="text-muted">Note: may include more input fields...</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">New Chapter</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowChapterModal(false)}></button>
              </div>
              <form onSubmit={handleCreateChapter}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={chapterForm.name}
                      onChange={(e) => setChapterForm({...chapterForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description :</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={chapterForm.description}
                      onChange={(e) => setChapterForm({...chapterForm, description: e.target.value})}
                      required
                    ></textarea>
                    <small className="text-muted">Note: may include more input fields...</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowChapterModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">New Quiz</h5>
                <button type="button" className="btn-close" onClick={() => setShowQuizModal(false)}></button>
              </div>
              <form onSubmit={handleCreateQuiz}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Chapter ID :</label>
                    <select 
                      className="form-select"
                      value={quizForm.chapter_id}
                      onChange={(e) => setQuizForm({...quizForm, chapter_id: e.target.value})}
                      required
                    >
                      <option value="">Select Chapter</option>
                      {chapters.map(chapter => (
                        <option key={chapter._id} value={chapter._id}>{chapter.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date :</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={quizForm.date}
                      onChange={(e) => setQuizForm({...quizForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Duration :</label>
                    <input 
                      type="number" 
                      className="form-control"
                      placeholder="Minutes"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm({...quizForm, duration: e.target.value})}
                      required
                    />
                    <small className="text-muted">Note: may include more input fields...</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">New Question</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => {
                  setShowQuestionModal(false);
                  setCurrentQuiz(null);
                }}></button>
              </div>
              <form onSubmit={handleCreateQuestion}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Chapter :</label>
                      <select 
                        className="form-select"
                        value={questionForm.chapter_id}
                        onChange={(e) => {
                          const selectedChapterId = e.target.value;
                          setQuestionForm({...questionForm, chapter_id: selectedChapterId, quiz_id: ''});
                        }}
                        required
                      >
                        <option value="">Select Chapter</option>
                        {chapters.map(chapter => (
                          <option key={chapter._id} value={chapter._id}>{chapter.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quiz :</label>
                      {/* Show quiz info if opened from quiz card */}
                      {currentQuiz ? (
                        <div>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={`Quiz for ${chapters.find(c => c._id === currentQuiz.chapter_id)?.name || 'Unknown Chapter'}`}
                            readOnly
                            style={{ backgroundColor: '#e9ecef' }}
                          />
                          <small className="text-muted">Adding question to this quiz</small>
                        </div>
                      ) : (
                        <select 
                          className="form-select"
                          value={questionForm.quiz_id}
                          onChange={(e) => setQuestionForm({...questionForm, quiz_id: e.target.value})}
                          required
                        >
                          <option value="">Select Quiz</option>
                          {questionForm.chapter_id && getQuizzesByChapter(questionForm.chapter_id).map(quiz => {
                            const chapterName = chapters.find(c => c._id === quiz.chapter_id)?.name || 'Unknown';
                            return (
                              <option key={quiz._id} value={quiz._id}>
                                {quiz.title || `Quiz - ${chapterName}`}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Question Title :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={questionForm.question_title}
                      onChange={(e) => setQuestionForm({...questionForm, question_title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Question Statement :</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={questionForm.question_statement}
                      onChange={(e) => setQuestionForm({...questionForm, question_statement: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="border p-3 mb-3">
                    <h6 className="text-warning">Single Option Correct</h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Option 1) :</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={questionForm.option1}
                          onChange={(e) => setQuestionForm({...questionForm, option1: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Option 2) :</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={questionForm.option2}
                          onChange={(e) => setQuestionForm({...questionForm, option2: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Option 3) :</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={questionForm.option3}
                          onChange={(e) => setQuestionForm({...questionForm, option3: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Option 4) :</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={questionForm.option4}
                          onChange={(e) => setQuestionForm({...questionForm, option4: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="form-label">Correct option :</label>
                      <select 
                        className="form-select"
                        value={questionForm.correct_option}
                        onChange={(e) => setQuestionForm({...questionForm, correct_option: parseInt(e.target.value)})}
                        required
                      >
                        <option value={1}>Option 1</option>
                        <option value={2}>Option 2</option>
                        <option value={3}>Option 3</option>
                        <option value={4}>Option 4</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowQuestionModal(false);
                    setCurrentQuiz(null);
                  }}>Close</button>
                  <button type="submit" className="btn btn-info">Save and Next</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Chapter Modal */}
      {showEditChapterModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">Edit Chapter</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditChapterModal(false)}></button>
              </div>
              <form onSubmit={handleEditChapter}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editChapterForm.name}
                      onChange={(e) => setEditChapterForm({...editChapterForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description :</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={editChapterForm.description}
                      onChange={(e) => setEditChapterForm({...editChapterForm, description: e.target.value})}
                      required
                    ></textarea>
                    <small className="text-muted">Note: may include more input fields...</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditChapterModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditQuestionModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">Edit Question</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditQuestionModal(false)}></button>
              </div>
              <form onSubmit={handleEditQuestion}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Question Title :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editQuestionForm.question_title}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, question_title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Question Statement :</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={editQuestionForm.question_statement}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, question_statement: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Option 1 :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editQuestionForm.option1}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, option1: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Option 2 :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editQuestionForm.option2}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, option2: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Option 3 :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editQuestionForm.option3}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, option3: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Option 4 :</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editQuestionForm.option4}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, option4: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correct Option :</label>
                    <select 
                      className="form-select"
                      value={editQuestionForm.correct_option}
                      onChange={(e) => setEditQuestionForm({...editQuestionForm, correct_option: parseInt(e.target.value)})}
                      required
                    >
                      <option value={1}>Option 1</option>
                      <option value={2}>Option 2</option>
                      <option value={3}>Option 3</option>
                      <option value={4}>Option 4</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditQuestionModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 