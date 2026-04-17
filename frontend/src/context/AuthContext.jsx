import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Invalid user data in storage, resetting...");
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (phone, password) => {
    setLoading(true);
    try {
      const data = await loginUser(phone, password);
      const userData = { ...data.user, token: data.token };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const data = await registerUser(userData);
      const newUser = { ...data.data, token: data.token };
      if (newUser.token) {
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      }
      return newUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
