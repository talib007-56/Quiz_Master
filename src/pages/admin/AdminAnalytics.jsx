import { useState, useEffect } from 'react';
import { scoresAPI, quizzesAPI, questionsAPI, usersAPI } from '../../services/api';
import { 
  calculateQuizStats, 
  generateQuizInsights, 
  getDifficultyLevel,
  formatTime,
  calculateTimeAnalytics
} from '../../utils/quizUtils';
import { useToast } from '../../components/NotificationToast';

const AdminAnalytics = () => {
  const { success, error: showError } = useToast();
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Analytics states
  const [overallStats, setOverallStats] = useState(null);
  const [quizAnalytics, setQuizAnalytics] = useState([]);
  const [userPerformance, setUserPerformance] = useState([]);
  const [insights, setInsights] = useState([]);
  const [filteredScoresCount, setFilteredScoresCount] = useState(0);
  
  // Filter states
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (scores.length > 0 && quizzes.length > 0 && questions.length > 0 && users.length > 0) {
      calculateAnalytics();
    }
  }, [scores, quizzes, questions, users, selectedTimeRange, selectedQuiz]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING ADMIN ANALYTICS DATA ===');
      
      const [scoresRes, quizzesRes, questionsRes, usersRes] = await Promise.all([
        scoresAPI.getAll(),
        quizzesAPI.getAll(),
        questionsAPI.getAll(),
        usersAPI.getAll()
      ]);
      
      console.log('Scores response:', scoresRes);
      console.log('Quizzes response:', quizzesRes);
      console.log('Questions response:', questionsRes);
      console.log('Users response:', usersRes);
      
      // Handle both array and object responses
      const scoresData = Array.isArray(scoresRes.data) ? scoresRes.data : (scoresRes.data?.data || []);
      const quizzesData = Array.isArray(quizzesRes.data) ? quizzesRes.data : (quizzesRes.data?.data || []);
      const questionsData = Array.isArray(questionsRes.data) ? questionsRes.data : (questionsRes.data?.data || []);
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);
      
      setScores(scoresData);
      setQuizzes(quizzesData);
      setQuestions(questionsData);
      setUsers(usersData);
      
      console.log('Final data set:');
      console.log('- Scores:', scoresData.length);
      console.log('- Quizzes:', quizzesData.length);
      console.log('- Questions:', questionsData.length);
      console.log('- Users:', usersData.length);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      console.error('Error details:', error.response?.data || error.message);
      showError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    try {
      console.log('=== ADMIN ANALYTICS DEBUG ===');
      console.log('Total scores before filtering:', scores.length);
      console.log('Selected time range:', selectedTimeRange);
      console.log('Selected quiz:', selectedQuiz);
      
      // Debug null values and quiz references
      const scoresWithNullUser = scores.filter(s => !s.user_id);
      const scoresWithNullQuiz = scores.filter(s => !s.quiz_id);
      const scoresWithUnpopulatedQuiz = scores.filter(s => s.quiz_id && !s.quiz_id.chapter_id);
      
      if (scoresWithNullUser.length > 0) {
        console.warn('Scores with null user_id:', scoresWithNullUser.length, scoresWithNullUser);
      }
      if (scoresWithNullQuiz.length > 0) {
        console.warn('Scores with null quiz_id:', scoresWithNullQuiz.length, scoresWithNullQuiz);
      }
      if (scoresWithUnpopulatedQuiz.length > 0) {
        console.warn('Scores with unpopulated quiz references:', scoresWithUnpopulatedQuiz.length, scoresWithUnpopulatedQuiz);
      }
      
      console.log('Sample score for reference check:', scores[0]);
      
      // Filter scores based on selected filters
      let filteredScores = scores;
      
      // Time range filter
      if (selectedTimeRange !== 'all') {
        const now = new Date();
        const timeRanges = {
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
          '90d': 90 * 24 * 60 * 60 * 1000
        };
        
        const cutoffDate = new Date(now.getTime() - timeRanges[selectedTimeRange]);
        filteredScores = filteredScores.filter(score => {
          // Use time_stamp_of_attempt (when quiz was actually taken) instead of createdAt
          const attemptDate = new Date(score.time_stamp_of_attempt || score.createdAt);
          const isInRange = attemptDate >= cutoffDate;
          return isInRange;
        });
        
        console.log('Scores after time range filter:', filteredScores.length);
        console.log('Cutoff date:', cutoffDate);
      }
      
      // Quiz filter
      if (selectedQuiz !== 'all') {
        filteredScores = filteredScores.filter(score => {
          if (!score.quiz_id) return false;
          return score.quiz_id._id === selectedQuiz || score.quiz_id === selectedQuiz;
        });
        console.log('Scores after quiz filter:', filteredScores.length);
      }
      
      console.log('Final filtered scores:', filteredScores.length);
      setFilteredScoresCount(filteredScores.length);

      // Calculate overall statistics with safety checks
      const totalAttempts = filteredScores.length;
      const totalQuestions = filteredScores.reduce((sum, score) => {
        if (!score.answers || !Array.isArray(score.answers)) {
          console.warn('Score without valid answers array:', score);
          return sum;
        }
        return sum + score.answers.length;
      }, 0);
      const totalCorrect = filteredScores.reduce((sum, score) => sum + (score.total_scored || 0), 0);
      const averageScore = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100) : 0;
      
      // Time analytics removed as requested

      setOverallStats({
        totalAttempts,
        totalQuestions,
        totalCorrect,
        averageScore: Math.round(averageScore * 100) / 100,
        totalUsers: new Set(filteredScores
          .filter(s => s.user_id)
          .map(s => s.user_id._id || s.user_id)
        ).size,
        totalQuizzes: new Set(filteredScores
          .filter(s => s.quiz_id)
          .map(s => s.quiz_id._id || s.quiz_id)
        ).size,
        completionRate: Math.round((filteredScores.length / users.length) * 100)
      });

      // Calculate per-quiz analytics
      const quizStats = {};
      filteredScores.forEach(score => {
        // Safety checks for required fields
        if (!score.quiz_id) {
          console.warn('Score without quiz_id:', score);
          return;
        }
        if (!score.answers || !Array.isArray(score.answers)) {
          console.warn('Score without valid answers:', score);
          return;
        }
        
        const quizId = score.quiz_id._id || score.quiz_id;
        if (!quizStats[quizId]) {
          quizStats[quizId] = {
            quiz: score.quiz_id,
            attempts: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            users: new Set()
          };
        }
        
        quizStats[quizId].attempts++;
        quizStats[quizId].totalQuestions += score.answers.length;
        quizStats[quizId].totalCorrect += (score.total_scored || 0);
        if (score.user_id) {
          quizStats[quizId].users.add(score.user_id._id || score.user_id);
        }
      });

      console.log('=== QUIZ ANALYTICS DEBUG ===');
      console.log('Quiz stats object:', quizStats);
      console.log('Number of quizzes found:', Object.keys(quizStats).length);

      const quizAnalyticsData = Object.values(quizStats).map(stat => {
        const averageScore = stat.totalQuestions > 0 ? 
          (stat.totalCorrect / stat.totalQuestions * 100) : 0;
        const difficultyLevel = getDifficultyLevel(averageScore);
        
        console.log(`Quiz ${stat.quiz?.chapter_id?.name}:`, {
          attempts: stat.attempts,
          totalQuestions: stat.totalQuestions,
          totalCorrect: stat.totalCorrect,
          averageScore,
          uniqueUsers: stat.users.size,
          quiz: stat.quiz
        });
        
        return {
          ...stat,
          averageScore: Math.round(averageScore * 100) / 100,
          uniqueUsers: stat.users.size,
          difficultyLevel
        };
      }).sort((a, b) => b.attempts - a.attempts);

      console.log('Final quiz analytics data:', quizAnalyticsData);
      setQuizAnalytics(quizAnalyticsData);

      // Calculate user performance
      const userStats = {};
      filteredScores.forEach(score => {
        // Safety checks for required fields
        if (!score.user_id) {
          console.warn('Score without user_id:', score);
          return;
        }
        if (!score.answers || !Array.isArray(score.answers)) {
          console.warn('Score without valid answers:', score);
          return;
        }
        
        const userId = score.user_id._id || score.user_id;
        if (!userStats[userId]) {
          userStats[userId] = {
            user: score.user_id,
            attempts: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            quizzes: new Set()
          };
        }
        
        userStats[userId].attempts++;
        userStats[userId].totalQuestions += score.answers.length;
        userStats[userId].totalCorrect += (score.total_scored || 0);
        if (score.quiz_id) {
          userStats[userId].quizzes.add(score.quiz_id._id || score.quiz_id);
        }
      });

      const topUsers = Object.values(userStats)
        .map(stat => {
          const averageScore = stat.totalQuestions > 0 ? 
            (stat.totalCorrect / stat.totalQuestions * 100) : 0;
          
          return {
            ...stat,
            averageScore: Math.round(averageScore * 100) / 100,
            uniqueQuizzes: stat.quizzes.size
          };
        })
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 10);

      setUserPerformance(topUsers);

      // Generate insights
      const allInsights = generateQuizInsights(filteredScores, questions);
      setInsights(allInsights.slice(0, 6)); // Show top 6 insights

    } catch (error) {
      console.error('Error calculating analytics:', error);
      showError('Failed to calculate analytics');
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-graph-up me-2"></i>
            Quiz Analytics Dashboard
          </h2>
          <p className="text-muted mb-0">Comprehensive insights into quiz performance and user engagement</p>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={fetchAllData}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Data
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label">Time Range:</label>
              <select 
                className="form-select"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Quiz:</label>
              <select 
                className="form-select"
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
              >
                <option value="all">All Quizzes</option>
                {quizzes.map(quiz => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.chapter_id?.name} - {quiz.chapter_id?.subject_id?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      {overallStats && (
        <div className="row mb-4">
          <div className="col-lg-4 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="text-primary mb-2">
                  <i className="bi bi-clipboard-check fs-1"></i>
                </div>
                <h3 className="text-primary">{overallStats.totalAttempts}</h3>
                <p className="text-muted mb-0">Total Attempts</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="text-success mb-2">
                  <i className="bi bi-percent fs-1"></i>
                </div>
                <h3 className="text-success">{overallStats.averageScore}%</h3>
                <p className="text-muted mb-0">Average Score</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="text-info mb-2">
                  <i className="bi bi-people fs-1"></i>
                </div>
                <h3 className="text-info">{overallStats.totalUsers}</h3>
                <p className="text-muted mb-0">Active Users</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-lightbulb me-2"></i>
                  Key Insights
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {insights.map((insight, index) => (
                    <div key={index} className="col-lg-4 col-md-6 mb-3">
                      <div className={`alert alert-${insight.type} d-flex align-items-center mb-0`}>
                        <span className="me-2 fs-4">{insight.icon}</span>
                        <div>
                          <strong>{insight.title}</strong>
                          <br />
                          <small>{insight.message}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Quiz Analytics */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Quiz Performance Analytics
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Attempts</th>
                      <th>Users</th>
                      <th>Avg Score</th>
                      <th>Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizAnalytics.length > 0 ? (
                      quizAnalytics.map((quiz, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <strong>
                                {quiz.quiz?.chapter_id?.name || 
                                 quiz.quiz?.remarks || 
                                 `Quiz ${quiz.quiz?._id || 'Unknown'}`}
                              </strong>
                              <br />
                              <small className="text-muted">
                                {quiz.quiz?.chapter_id?.subject_id?.name || 'Unknown Subject'}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-primary">{quiz.attempts}</span>
                          </td>
                          <td>
                            <span className="badge bg-info">{quiz.uniqueUsers}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                                <div 
                                  className={`progress-bar ${
                                    quiz.averageScore >= 80 ? 'bg-success' :
                                    quiz.averageScore >= 60 ? 'bg-warning' : 'bg-danger'
                                  }`}
                                  style={{ width: `${quiz.averageScore}%` }}
                                ></div>
                              </div>
                              <span>{quiz.averageScore}%</span>
                            </div>
                          </td>
                          <td>
                            <span 
                              className="badge"
                              style={{ 
                                backgroundColor: quiz.difficultyLevel.color,
                                color: 'white'
                              }}
                            >
                              {quiz.difficultyLevel.icon} {quiz.difficultyLevel.level}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="text-muted">
                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                            <h5>No Quiz Analytics Available</h5>
                            <p className="mb-0">
                              {filteredScoresCount === 0 
                                ? 'No quiz attempts found for the selected time range.'
                                : 'Quiz data may be incomplete or missing references.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                Top Performers
              </h5>
            </div>
            <div className="card-body">
              {userPerformance.map((user, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <div 
                      className={`rounded-circle d-flex align-items-center justify-content-center ${
                        index === 0 ? 'bg-warning' : 
                        index === 1 ? 'bg-secondary' :
                        index === 2 ? 'bg-dark' : 'bg-light'
                      }`}
                      style={{ width: '40px', height: '40px' }}
                    >
                      <span className={`fw-bold ${index < 3 ? 'text-white' : 'text-dark'}`}>
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold">
                      {user.user?.full_name || user.user?.name || 'Unknown User'}
                    </div>
                    <small className="text-muted">
                      {user.attempts}  quize attempts
                    </small>
                  </div>
                  <div className="text-end">
                    <small>Avg Score</small>
                    <div className="fw-bold text-success">{user.averageScore}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 