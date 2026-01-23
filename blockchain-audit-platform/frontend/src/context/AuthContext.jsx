import React, { createContext, useState, useContext, useCallback } from 'react';

/**
 * AuthContext - Global authentication state management
 * Handles user login/logout and role-based access
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback((username, role) => {
    const userData = {
      id: `user_${Date.now()}`,
      username,
      role,
      loginTime: new Date().toISOString(),
      sessionId: Math.random().toString(36).substring(2, 11),
    };
    setUser(userData);
    localStorage.setItem('authUser', JSON.stringify(userData));
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authUser');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use AuthContext
 * Throws error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
