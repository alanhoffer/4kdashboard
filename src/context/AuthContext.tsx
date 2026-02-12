import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, refreshToken } from '@/lib/api';

interface User {
  user_id: string;
  email: string;
  client_id?: number;
  client_name?: string;
  dealer_name?: string;
  role: 'admin' | 'user';
  global_role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      console.log('User data from API:', userData); // Debug
      setUser(userData);
    } catch (error) {
      // Si falla, intentar refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        try {
          const userData = await getCurrentUser();
          console.log('User data from API (after refresh):', userData); // Debug
          setUser(userData);
        } catch (err) {
          console.error('Error obteniendo usuario después de refresh:', err);
          apiLogout();
        }
      } else {
        apiLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await apiLogin(email, password);
      const userData = await getCurrentUser();
      console.log('User data after login:', userData); // Debug
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error refrescando usuario:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
