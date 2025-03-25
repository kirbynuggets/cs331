// src/features/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const storedUser = localStorage.getItem('loggedUser');
    const storedAdmin = localStorage.getItem('loggedAdmin');
    
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    localStorage.setItem('loggedUser', JSON.stringify(userData));
    setUser(userData);
  };

  const loginAdmin = (adminData) => {
    localStorage.setItem('loggedAdmin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('loggedAdmin');
    setUser(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        admin, 
        isUser: !!user,
        isAdmin: !!admin,
        loginUser, 
        loginAdmin, 
        logout,
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);