import { useState, useEffect } from 'react';
import { quizzesAPI, chaptersAPI } from '../../../services/api';

const QuizzesList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [formData, setFormData] = useState({
    chapter_id: '',
    date_of_quiz: '',
    time_duration: '',
    remarks: ''
  });

  // Fetch quizzes and chapters
  useEffect(() => {
    fetchQuizzes();
    fetchChapters();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getAll();
      setQuizzes(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch quizzes');
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await chaptersAPI.getAll();
      setChapters(response.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    try {
      await quizzesAPI.create(formData);
      setShowAddModal(false);
      setFormData({ chapter_id: '', date_of_quiz: '', time_duration: '', remarks: '' });
      fetchQuizzes();
    } catch (error) {
      setError('Failed to add quiz');
      console.error('Error adding quiz:', error);
    }
  };

  const handleEditQuiz = async (e) => {
    e.preventDefault();
    try {
      await quizzesAPI.update(selectedQuiz._id, formData);
      setShowEditModal(false);
      setSelectedQuiz(null);
      setFormData({ chapter_id: '', date_of_quiz: '', time_duration: '', remarks: '' });
      fetchQuizzes();
    } catch (error) {
      setError('Failed to update quiz');
      console.error('Error updating quiz:', error);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?\n\nThis will also delete:\n• All questions in this quiz\n• All user scores for this quiz\n\nThis action cannot be undone.')) {
      try {
        const response = await quizzesAPI.delete(id);
        console.log('Quiz deletion response:', response.data);
        
        // Show success message with details
        if (response.data.deletedQuestions || response.data.deletedScores) {
          alert(`Quiz deleted successfully!\n\n• Deleted ${response.data.deletedQuestions || 0} questions\n• Deleted ${response.data.deletedScores || 0} user scores`);
        }
        
        fetchQuizzes();
      } catch (error) {
        setError('Failed to delete quiz');
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const openEditModal = (quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      chapter_id: quiz.chapter_id._id,
      date_of_quiz: new Date(quiz.date_of_quiz).toISOString().split('T')[0],
      time_duration: quiz.time_duration,
      remarks: quiz.remarks
    });
    setShowEditModal(true);
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quizzes</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Quiz
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {quizzes.map(quiz => (
          <div className="col-md-6 col-lg-4 mb-4" key={quiz._id}>
            <div className="card h-100 shadow-sm quiz-card">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-puzzle-fill text-primary me-2"></i>
                    Quiz
                  </h5>
                  <div className="dropdown">
                    <button 
                      className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-three-dots"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => openEditModal(quiz)}
                        >
                          <i className="bi bi-pencil me-2"></i>Edit
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                        >
                          <i className="bi bi-trash me-2"></i>Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-book text-success me-2"></i>
                    <span className="fw-semibold">Subject:</span>
                    <span className="ms-2">{quiz.chapter_id.subject_id.name}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-bookmark text-warning me-2"></i>
                    <span className="fw-semibold">Chapter:</span>
                    <span className="ms-2">{quiz.chapter_id.name}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-calendar3 text-info me-2"></i>
                    <span className="fw-semibold">Date:</span>
                    <span className="ms-2">{new Date(quiz.date_of_quiz).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-clock text-secondary me-2"></i>
                    <span className="fw-semibold">Duration:</span>
                    <span className="ms-2">{quiz.time_duration} minutes</span>
                  </div>
                </div>
                
                {quiz.remarks && (
                  <div className="mt-auto">
                    <div className="border-top pt-2">
                      <small className="text-muted">
                        <i className="bi bi-chat-text me-1"></i>
                        {quiz.remarks}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Quiz Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-dialog" style={{ margin: 0, width: '90%', maxWidth: '500px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Quiz</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddQuiz}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="chapter_id" className="form-label">Chapter</label>
                    <select
                      className="form-select"
                      id="chapter_id"
                      name="chapter_id"
                      value={formData.chapter_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a chapter</option>
                      {chapters.map(chapter => (
                        <option key={chapter._id} value={chapter._id}>
                          {chapter.name} ({chapter.subject_id.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="date_of_quiz" className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date_of_quiz"
                      name="date_of_quiz"
                      value={formData.date_of_quiz}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="time_duration" className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="time_duration"
                      name="time_duration"
                      value={formData.time_duration}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="remarks" className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-dialog" style={{ margin: 0, width: '90%', maxWidth: '500px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Quiz</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleEditQuiz}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="edit-chapter_id" className="form-label">Chapter</label>
                    <select
                      className="form-select"
                      id="edit-chapter_id"
                      name="chapter_id"
                      value={formData.chapter_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a chapter</option>
                      {chapters.map(chapter => (
                        <option key={chapter._id} value={chapter._id}>
                          {chapter.name} ({chapter.subject_id.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-date_of_quiz" className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="edit-date_of_quiz"
                      name="date_of_quiz"
                      value={formData.date_of_quiz}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-time_duration" className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="edit-time_duration"
                      name="time_duration"
                      value={formData.time_duration}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-remarks" className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      id="edit-remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default QuizzesList; 