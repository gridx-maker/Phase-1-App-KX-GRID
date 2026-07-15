import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('kotlerx_token'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check cookie auth first
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setUser(response.data);
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('kotlerx_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token: newToken, ...userData } = response.data;
    localStorage.setItem('kotlerx_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name, role = 'student') => {
    const response = await axios.post(`${API}/auth/register`, { email, password, name, role });
    const { token: newToken, ...userData } = response.data;
    localStorage.setItem('kotlerx_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = () => {
    // Google OAuth - implement with your own OAuth provider
    console.warn('Google login not configured');
  };

  const processOAuthCallback = async (sessionId) => {
    const response = await axios.post(`${API}/auth/session`, {}, {
      headers: { 'X-Session-ID': sessionId },
      withCredentials: true
    });
    
    // Store token and user data just like normal login
    const { token: newToken, ...userData } = response.data;
    if (newToken) {
      localStorage.setItem('kotlerx_token', newToken);
      setToken(newToken);
    }
    
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('kotlerx_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    loginWithGoogle,
    processOAuthCallback,
    logout,
    checkAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
