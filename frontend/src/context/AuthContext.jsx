import React, { createContext, useState, useContext, useCallback } from 'react';
import { authAPI } from '../services/api';

/**
 * AuthContext - Global authentication state management
 * Handles user login/logout and role-based access
 */
export const AuthContext = createContext();

/**
 * Helper to parse JWT
 */
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken) {
      // RULE #1: Prefer saved user data (includes role) over token decoding
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('Restored user from localStorage:', userData);
          return { ...userData, token: savedToken };
        } catch (e) {
          console.error('Failed to parse saved user data:', e);
        }
      }

      // Fallback: decode from token
      const decoded = parseJwt(savedToken);
      if (decoded) {
        const role = (decoded.role || decoded.scopes?.[0] || '').toLowerCase();
        console.log('Decoded user from token, role:', role);
        return { ...decoded, role, token: savedToken };
      }
    }
    return null;
  });

  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token, role } = response;

      if (!access_token) throw new Error("No token received");

      localStorage.setItem('authToken', access_token);

      const decoded = parseJwt(access_token);

      // Use role from response, or fallback to token - NO hardcoded defaults
      // This ensures we never assign the wrong role to a user
      const derivedRole = (role || decoded?.role || decoded?.scopes?.[0])?.toLowerCase();

      if (!derivedRole) {
        throw new Error('No role information received from server');
      }

      const userData = {
        username: email,
        role: derivedRole,
        ...decoded,
        token: access_token
      };

      setUser(userData);
      // Also save minimal user info if needed, but token is source of truth
      localStorage.setItem('authUser', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // Optional: Call authAPI.logout() if backend supports it
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
