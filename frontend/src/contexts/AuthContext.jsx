import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../services/axios';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists and is valid on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Check if token is expired
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired, log out user
            handleLogout();
            setError('Your session has expired. Please log in again.');
          } else {
            // Token valid, get current user info
            const response = await axiosInstance.get('/auth/me');
            setCurrentUser(response.data.user);
            localStorage.setItem('userRole', response.data.user.role);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Register new user
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post('/auth/register', userData);
      
      // Store token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      
      setCurrentUser(user);
      
      return {
        success: true,
        user
      };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      // Store token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      
      setCurrentUser(user);
      
      return {
        success: true,
        user
      };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 