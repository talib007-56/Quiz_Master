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
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizzesAPI.delete(id);
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

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(quiz => (
              <tr key={quiz._id}>
                <td>{quiz.chapter_id.name}</td>
                <td>{quiz.chapter_id.subject_id.name}</td>
                <td>{new Date(quiz.date_of_quiz).toLocaleDateString()}</td>
                <td>{quiz.time_duration} minutes</td>
                <td>{quiz.remarks}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openEditModal(quiz)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Quiz Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
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
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
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

      {/* Modal Backdrop */}
      {(showAddModal || showEditModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default QuizzesList; 