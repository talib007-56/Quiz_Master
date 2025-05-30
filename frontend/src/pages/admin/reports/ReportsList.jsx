import { useState, useEffect } from 'react';
import { scoresAPI, quizzesAPI } from '../../../services/api';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      fetchReports();
    }
  }, [selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      const response = await quizzesAPI.getAll();
      setQuizzes(response.data);
      if (response.data.length > 0) {
        setSelectedQuiz(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await scoresAPI.getByQuiz(selectedQuiz);
      setReports(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch reports');
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizChange = (e) => {
    setSelectedQuiz(e.target.value);
  };

  const calculateStats = () => {
    if (reports.length === 0) return null;

    const totalAttempts = reports.length;
    const totalScore = reports.reduce((sum, report) => sum + report.score, 0);
    const averageScore = totalScore / totalAttempts;
    const maxScore = Math.max(...reports.map(report => report.score));
    const minScore = Math.min(...reports.map(report => report.score));

    return {
      totalAttempts,
      totalScore,
      averageScore,
      maxScore,
      minScore
    };
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

  const stats = calculateStats();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quiz Reports</h2>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedQuiz}
            onChange={handleQuizChange}
          >
            {quizzes.map(quiz => (
              <option key={quiz._id} value={quiz._id}>
                {quiz.chapter_id.name} - {new Date(quiz.date_of_quiz).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Total Attempts</h5>
                <p className="card-text h3">{stats.totalAttempts}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Average Score</h5>
                <p className="card-text h3">{stats.averageScore.toFixed(2)}%</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Highest Score</h5>
                <p className="card-text h3">{stats.maxScore}%</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h5 className="card-title">Lowest Score</h5>
                <p className="card-text h3">{stats.minScore}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>User</th>
              <th>Score</th>
              <th>Time Taken</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report._id}>
                <td>{report.user_id.name}</td>
                <td>{report.score}%</td>
                <td>{report.time_taken} minutes</td>
                <td>{new Date(report.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsList; 