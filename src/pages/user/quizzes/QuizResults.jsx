import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scoresAPI } from '../../../services/api';

const QuizResults = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await scoresAPI.getByQuiz(quizId);
      setResults(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch quiz results');
      console.error('Error fetching quiz results:', error);
    } finally {
      setLoading(false);
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

  if (!results) {
    return <div className="alert alert-warning my-4">No results found for this quiz.</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Quiz Results</h2>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Your Score: {results.score}%</h5>
          <p className="card-text">Time Taken: {results.time_taken} minutes</p>
          <p className="card-text">Date: {new Date(results.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/user/quizzes')}>
        Back to Quizzes
      </button>
    </div>
  );
};

export default QuizResults; 