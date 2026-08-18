import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('supplysense_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-101',
      name: 'Dr. Sarah Vance',
      email: 'sarah.vance@supplysense.ai',
      role: 'VP of Global Supply Chain',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      company: 'Global Enterprise Corp'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('supplysense_auth') === 'true';
  });

  const login = async (email, password) => {
    // Simulate auth API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const loggedUser = {
          id: 'usr-101',
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: email,
          role: 'Supply Chain Operations Lead',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          company: 'Global Enterprise Corp'
        };
        setUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem('supplysense_user', JSON.stringify(loggedUser));
        localStorage.setItem('supplysense_auth', 'true');
        resolve({ success: true, user: loggedUser });
      }, 600);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('supplysense_user');
    localStorage.setItem('supplysense_auth', 'false');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
