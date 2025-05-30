import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import SubjectsList from './pages/admin/subjects/SubjectsList';
import ChaptersList from './pages/admin/chapters/ChaptersList';
import QuizzesList from './pages/admin/quizzes/QuizzesList';
import QuestionsList from './pages/admin/questions/QuestionsList';
import UsersList from './pages/admin/users/UsersList';
import ReportsList from './pages/admin/reports/ReportsList';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserSubjects from './pages/user/subjects/SubjectsList';
import UserChapters from './pages/user/chapters/ChaptersList';
import UserQuizzes from './pages/user/quizzes/QuizzesList';
import AttemptQuiz from './pages/user/quizzes/AttemptQuiz';
import QuizResults from './pages/user/quizzes/QuizResults';
import UserProfile from './pages/user/Profile';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Auth guard for protected routes
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/'} />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Navigate to="/login" />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute requiredRole="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="subjects" element={<SubjectsList />} />
            <Route path="chapters" element={<ChaptersList />} />
            <Route path="quizzes" element={<QuizzesList />} />
            <Route path="questions" element={<QuestionsList />} />
            <Route path="users" element={<UsersList />} />
            <Route path="reports" element={<ReportsList />} />
          </Route>
          
          {/* User Routes */}
          <Route 
            path="/user" 
            element={
              <PrivateRoute requiredRole="user">
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="subjects" element={<UserSubjects />} />
            <Route path="chapters/:subjectId" element={<UserChapters />} />
            <Route path="quizzes/:chapterId" element={<UserQuizzes />} />
            <Route path="quiz/:quizId/attempt" element={<AttemptQuiz />} />
            <Route path="quiz/:quizId/results" element={<QuizResults />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
