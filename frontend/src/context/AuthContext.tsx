import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  getDefaultDashboardPath: (role?: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getDefaultDashboardPath = (role?: UserRole): string => {
    const currentRole = role || user?.role;
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      case 'LMO':
        return '/lmo/dashboard';
      case 'GATC':
        return '/gatc/dashboard';
      case 'BUSINESS_USER':
        return '/business/dashboard';
      default:
        return '/';
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('emetrology_token');
    const savedUser = localStorage.getItem('emetrology_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with server profile
        api.get('/auth/profile')
          .then((res) => {
            if (res.success && res.user) {
              setUser(res.user);
              localStorage.setItem('emetrology_user', JSON.stringify(res.user));
            }
          })
          .catch(() => {
            // If token invalid, clear
            localStorage.removeItem('emetrology_token');
            localStorage.removeItem('emetrology_user');
            setToken(null);
            setUser(null);
          })
          .finally(() => setIsLoading(false));
      } catch {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('emetrology_token', newToken);
    localStorage.setItem('emetrology_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('emetrology_token');
    localStorage.removeItem('emetrology_user');
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('emetrology_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshProfile,
        hasRole,
        getDefaultDashboardPath,
      }}
    >
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
