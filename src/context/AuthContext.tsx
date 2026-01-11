import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('shakeys_user');
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const savedUser = localStorage.getItem('shakeys_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Add pagehide event listener to detect tab close
    const handlePageHide = (event: PageTransitionEvent) => {
      // Only logout if the page is being unloaded (not just hidden/restored)
      if (!event.persisted) {
        logout();
      }
    };

    window.addEventListener('pagehide', handlePageHide);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [logout]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('shakeys_user', JSON.stringify(userData));
  };

  const register = async (_email: string, _password: string, _name: string, _phone: string) => {
    return { success: false, message: 'Not implemented' };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
