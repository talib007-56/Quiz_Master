import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionsAPI, quizzesAPI, scoresAPI } from '../../../services/api';

const AttemptQuiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
  }, [quizId]);

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
      setQuestions(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Prepare answers in the format expected by the backend
      const payload = {
        quiz_id: quizId,
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          question_id: questionId,
          selected_option: selectedOption
        }))
      };
      await scoresAPI.submitQuiz(payload);
      navigate(`/user/quiz/${quizId}/results`);
    } catch (error) {
      setSubmitError('Failed to submit quiz. Please try again.');
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
    return <div className="alert alert-danger my-4">{error}</div>;
  }

  return (
    <div>
      <h2 className="mb-4">{quiz ? `Attempt Quiz: ${quiz.chapter_id.name}` : 'Attempt Quiz'}</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((q, idx) => (
          <div className="card mb-3" key={q._id}>
            <div className="card-body">
              <h5 className="card-title">Q{idx + 1}. {q.question_statement}</h5>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={q._id}
                  id={`${q._id}-option1`}
                  value="1"
                  checked={answers[q._id] === '1'}
                  onChange={() => handleOptionChange(q._id, '1')}
                  required
                />
                <label className="form-check-label" htmlFor={`${q._id}-option1`}>
                  {q.option1}
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={q._id}
                  id={`${q._id}-option2`}
                  value="2"
                  checked={answers[q._id] === '2'}
                  onChange={() => handleOptionChange(q._id, '2')}
                />
                <label className="form-check-label" htmlFor={`${q._id}-option2`}>
                  {q.option2}
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={q._id}
                  id={`${q._id}-option3`}
                  value="3"
                  checked={answers[q._id] === '3'}
                  onChange={() => handleOptionChange(q._id, '3')}
                />
                <label className="form-check-label" htmlFor={`${q._id}-option3`}>
                  {q.option3}
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={q._id}
                  id={`${q._id}-option4`}
                  value="4"
                  checked={answers[q._id] === '4'}
                  onChange={() => handleOptionChange(q._id, '4')}
                />
                <label className="form-check-label" htmlFor={`${q._id}-option4`}>
                  {q.option4}
                </label>
              </div>
            </div>
          </div>
        ))}
        {submitError && <div className="alert alert-danger">{submitError}</div>}
        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </form>
    </div>
  );
};

export default AttemptQuiz; 