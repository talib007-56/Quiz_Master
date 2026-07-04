import axios from 'axios';

// API base URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword })
};

// Subjects API calls
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`)
};

// Chapters API calls
export const chaptersAPI = {
  getAll: () => api.get('/chapters'),
  getBySubject: (subjectId) => api.get(`/chapters?subject_id=${subjectId}`),
  getById: (id) => api.get(`/chapters/${id}`),
  create: (data) => api.post('/chapters', data),
  update: (id, data) => api.put(`/chapters/${id}`, data),
  delete: (id) => api.delete(`/chapters/${id}`)
};

// Quizzes API calls
export const quizzesAPI = {
  getAll: () => api.get('/quizzes'),
  getByChapter: (chapterId) => api.get(`/quizzes?chapter_id=${chapterId}`),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`)
};

// Questions API calls
export const questionsAPI = {
  getAll: () => api.get('/questions'),
  getByQuiz: (quizId) => api.get(`/questions?quiz_id=${quizId}`),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`)
};

// Scores API calls
export const scoresAPI = {
  getAll: () => api.get('/scores'),
  getByUser: (userId) => api.get(`/scores?user_id=${userId}`),
  getByQuiz: (quizId) => api.get(`/scores?quiz_id=${quizId}`),
  getById: (id) => api.get(`/scores/${id}`),
  getCurrentUserScores: () => api.get('/scores/user-stats'),
  submitQuiz: (data) => api.post('/scores', data),
  getUserStats: () => api.get('/scores/user-stats')
};

// Users API calls (admin only)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getProfile: () => api.get('/auth/me'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Export API calls (admin only)
export const exportAPI = {
  exportQuizData: () => api.get('/export/quiz-data', { responseType: 'blob' }),
  exportQuizAttempts: () => api.get('/export/quiz-attempts', { responseType: 'blob' }),
  exportUserEngagement: () => api.get('/export/user-engagement', { responseType: 'blob' })
};

// Notification API calls
export const notificationAPI = {
  updatePreferences: (userId, preferences) => api.put(`/notifications/preferences/${userId}`, preferences),
  triggerDailyReminders: () => api.post('/notifications/trigger/daily-reminders'),
  triggerMonthlyReports: () => api.post('/notifications/trigger/monthly-reports'),
  triggerEngagementNotification: () => api.post('/notifications/trigger/engagement-notification'),
  testEmail: (email) => api.post('/notifications/test-email', { email })
};

// AI API calls
export const aiAPI = {
  explainAnswer: (data) => api.post('/ai/explain', data),
  generateQuestions: (data) => api.post('/ai/generate-questions', data)
};

// Helper function to download CSV files
export const downloadCSV = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Export API instance for custom calls
export default api; 