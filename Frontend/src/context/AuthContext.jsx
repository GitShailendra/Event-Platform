import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthLoading(false);
      return;
    }
    // Try to fetch user profile with token
    getProfile()
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('token');
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    setUser(userInfo);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
