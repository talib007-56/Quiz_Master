import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesAPI, chaptersAPI } from '../../../services/api';

const QuizzesList = () => {
  const { chapterId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    fetchChapter();
  }, [chapterId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getByChapter(chapterId);
      setQuizzes(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch quizzes');
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapter = async () => {
    try {
      const response = await chaptersAPI.getById(chapterId);
      setChapter(response.data);
    } catch (error) {
      setChapter(null);
    }
  };

  const handleQuizClick = (quizId) => {
    navigate(`/user/quiz/${quizId}/attempt`);
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
      <h2 className="mb-4">
        {chapter ? `Quizzes for ${chapter.name}` : 'Quizzes'}
      </h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="row">
        {quizzes.map(quiz => (
          <div className="col-md-4 mb-4" key={quiz._id}>
            <div
              className="card h-100 shadow-sm quiz-card cursor-pointer"
              style={{ cursor: 'pointer' }}
              onClick={() => handleQuizClick(quiz._id)}
            >
              <div className="card-body">
                <h5 className="card-title">Quiz on {new Date(quiz.date_of_quiz).toLocaleDateString()}</h5>
                <p className="card-text">Duration: {quiz.time_duration} min</p>
                {quiz.remarks && <p className="card-text text-muted">{quiz.remarks}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesList; 