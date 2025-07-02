import { useState, useEffect } from 'react';
import { questionsAPI, quizzesAPI } from '../../../services/api';

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    quiz_id: '',
    question_statement: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_option: ''
  });

  // Fetch questions and quizzes
  useEffect(() => {
    fetchQuestions();
    fetchQuizzes();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getAll();
      setQuestions(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await quizzesAPI.getAll();
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await questionsAPI.create(formData);
      setShowAddModal(false);
      setFormData({
        quiz_id: '',
        question_statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: ''
      });
      fetchQuestions();
    } catch (error) {
      setError('Failed to add question');
      console.error('Error adding question:', error);
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    try {
      await questionsAPI.update(selectedQuestion._id, formData);
      setShowEditModal(false);
      setSelectedQuestion(null);
      setFormData({
        quiz_id: '',
        question_statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: ''
      });
      fetchQuestions();
    } catch (error) {
      setError('Failed to update question');
      console.error('Error updating question:', error);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionsAPI.delete(id);
        fetchQuestions();
      } catch (error) {
        setError('Failed to delete question');
        console.error('Error deleting question:', error);
      }
    }
  };

  const openEditModal = (question) => {
    setSelectedQuestion(question);
    setFormData({
      quiz_id: question.quiz_id._id,
      question_statement: question.question_statement,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      correct_option: question.correct_option
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
        <h2>Questions</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Question
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
              <th>Quiz</th>
              <th>Question</th>
              <th>Options</th>
              <th>Correct Option</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(question => (
              <tr key={question._id}>
                <td>
                  {question.quiz_id && question.quiz_id.chapter_id 
                    ? question.quiz_id.chapter_id.name 
                    : 'Quiz Deleted'}
                </td>
                <td>{question.question_statement}</td>
                <td>
                  <ol className="mb-0">
                    <li>{question.option1}</li>
                    <li>{question.option2}</li>
                    <li>{question.option3}</li>
                    <li>{question.option4}</li>
                  </ol>
                </td>
                <td>Option {question.correct_option}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openEditModal(question)}
                    disabled={!question.quiz_id}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteQuestion(question._id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg" style={{ margin: 0, width: '90%', maxWidth: '800px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Question</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddQuestion}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="quiz_id" className="form-label">Quiz</label>
                    <select
                      className="form-select"
                      id="quiz_id"
                      name="quiz_id"
                      value={formData.quiz_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a quiz</option>
                      {quizzes.map(quiz => (
                        <option key={quiz._id} value={quiz._id}>
                          {quiz.chapter_id && quiz.chapter_id.name 
                            ? `${quiz.chapter_id.name} - ${new Date(quiz.date_of_quiz).toLocaleDateString()}`
                            : `Quiz ${quiz._id.slice(-6)} - ${new Date(quiz.date_of_quiz).toLocaleDateString()}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="question_statement" className="form-label">Question</label>
                    <textarea
                      className="form-control"
                      id="question_statement"
                      name="question_statement"
                      value={formData.question_statement}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="option1" className="form-label">Option 1</label>
                    <input
                      type="text"
                      className="form-control"
                      id="option1"
                      name="option1"
                      value={formData.option1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="option2" className="form-label">Option 2</label>
                    <input
                      type="text"
                      className="form-control"
                      id="option2"
                      name="option2"
                      value={formData.option2}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="option3" className="form-label">Option 3</label>
                    <input
                      type="text"
                      className="form-control"
                      id="option3"
                      name="option3"
                      value={formData.option3}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="option4" className="form-label">Option 4</label>
                    <input
                      type="text"
                      className="form-control"
                      id="option4"
                      name="option4"
                      value={formData.option4}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="correct_option" className="form-label">Correct Option</label>
                    <select
                      className="form-select"
                      id="correct_option"
                      name="correct_option"
                      value={formData.correct_option}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select correct option</option>
                      <option value="1">Option 1</option>
                      <option value="2">Option 2</option>
                      <option value="3">Option 3</option>
                      <option value="4">Option 4</option>
                    </select>
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
                    Add Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg" style={{ margin: 0, width: '90%', maxWidth: '800px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Question</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleEditQuestion}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="edit-quiz_id" className="form-label">Quiz</label>
                    <select
                      className="form-select"
                      id="edit-quiz_id"
                      name="quiz_id"
                      value={formData.quiz_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a quiz</option>
                      {quizzes.map(quiz => (
                        <option key={quiz._id} value={quiz._id}>
                          {quiz.chapter_id && quiz.chapter_id.name 
                            ? `${quiz.chapter_id.name} - ${new Date(quiz.date_of_quiz).toLocaleDateString()}`
                            : `Quiz ${quiz._id.slice(-6)} - ${new Date(quiz.date_of_quiz).toLocaleDateString()}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-question_statement" className="form-label">Question</label>
                    <textarea
                      className="form-control"
                      id="edit-question_statement"
                      name="question_statement"
                      value={formData.question_statement}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-option1" className="form-label">Option 1</label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-option1"
                      name="option1"
                      value={formData.option1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-option2" className="form-label">Option 2</label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-option2"
                      name="option2"
                      value={formData.option2}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-option3" className="form-label">Option 3</label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-option3"
                      name="option3"
                      value={formData.option3}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-option4" className="form-label">Option 4</label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-option4"
                      name="option4"
                      value={formData.option4}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-correct_option" className="form-label">Correct Option</label>
                    <select
                      className="form-select"
                      id="edit-correct_option"
                      name="correct_option"
                      value={formData.correct_option}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select correct option</option>
                      <option value="1">Option 1</option>
                      <option value="2">Option 2</option>
                      <option value="3">Option 3</option>
                      <option value="4">Option 4</option>
                    </select>
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
                    Update Question
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

export default QuestionsList; 