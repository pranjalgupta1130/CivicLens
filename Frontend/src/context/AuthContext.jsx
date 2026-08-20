import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('civiclens_admin_auth') === 'true';
  });
  const [adminUser, setAdminUser] = useState(() => {
    return JSON.parse(sessionStorage.getItem('civiclens_admin_user') || 'null');
  });

  const adminLogin = (email, password) => {
    // Simple admin validation for demo/portal
    if (email && password) {
      setIsAdminAuthenticated(true);
      const user = { email, role: 'Senior Treasury Auditor', loginTime: new Date().toLocaleTimeString() };
      setAdminUser(user);
      sessionStorage.setItem('civiclens_admin_auth', 'true');
      sessionStorage.setItem('civiclens_admin_user', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, error: 'Please enter a valid email and password' };
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    sessionStorage.removeItem('civiclens_admin_auth');
    sessionStorage.removeItem('civiclens_admin_user');
  };

  return (
    <AuthContext.Provider value={{ isAdminAuthenticated, adminUser, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
