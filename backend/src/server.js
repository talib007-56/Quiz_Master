const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { initializeData } = require('./config/init');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Custom CORS middleware
app.use((req, res, next) => {
  // Get allowed origins from environment or default to localhost
  const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173'];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Body parser middleware
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('Quiz Master API is running');
});

// Import route files with try-catch blocks
let authRoutes, subjectRoutes, chapterRoutes, quizRoutes, questionRoutes, scoreRoutes, userRoutes, exportRoutes, notificationRoutes, aiRoutes;

try {
  authRoutes = require('./routes/auth.routes');
  console.log('Auth routes loaded successfully');
} catch (err) {
  console.error('Failed to load auth routes:', err);
}

try {
  subjectRoutes = require('./routes/subject.routes');
  console.log('Subject routes loaded successfully');
} catch (err) {
  console.error('Failed to load subject routes:', err);
}

try {
  chapterRoutes = require('./routes/chapter.routes');
  console.log('Chapter routes loaded successfully');
} catch (err) {
  console.error('Failed to load chapter routes:', err);
}

try {
  quizRoutes = require('./routes/quiz.routes');
  console.log('Quiz routes loaded successfully');
} catch (err) {
  console.error('Failed to load quiz routes:', err);
}

try {
  questionRoutes = require('./routes/question.routes');
  console.log('Question routes loaded successfully');
} catch (err) {
  console.error('Failed to load question routes:', err);
}

try {
  scoreRoutes = require('./routes/score.routes');
  console.log('Score routes loaded successfully');
} catch (err) {
  console.error('Failed to load score routes:', err);
}

try {
  userRoutes = require('./routes/user.routes');
  console.log('User routes loaded successfully');
} catch (err) {
  console.error('Failed to load user routes:', err);
}

try {
  exportRoutes = require('./routes/export.routes');
  console.log('Export routes loaded successfully');
} catch (err) {
  console.error('Failed to load export routes:', err);
}

try {
  notificationRoutes = require('./routes/notification.routes');
  console.log('Notification routes loaded successfully');
} catch (err) {
  console.error('Failed to load notification routes:', err);
}

try {
  aiRoutes = require('./routes/ai.routes');
  console.log('AI routes loaded successfully');
} catch (err) {
  console.error('Failed to load AI routes:', err);
}

// Use routes with explicit paths
if (authRoutes) app.use('/api/auth', authRoutes);
if (subjectRoutes) app.use('/api/subjects', subjectRoutes);
if (chapterRoutes) app.use('/api/chapters', chapterRoutes);
if (quizRoutes) app.use('/api/quizzes', quizRoutes);
if (questionRoutes) app.use('/api/questions', questionRoutes);
if (scoreRoutes) app.use('/api/scores', scoreRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (exportRoutes) app.use('/api/export', exportRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);
if (aiRoutes) app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-master';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    initializeData();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Initialize cron jobs with try-catch
try {
  require('./jobs/cron');
} catch (err) {
  console.error('Failed to initialize cron jobs:', err);
}

module.exports = app; 