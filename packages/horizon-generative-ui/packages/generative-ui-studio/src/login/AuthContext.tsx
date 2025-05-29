import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getUserProfile, logoutUser } from './authService';
import { useLogin } from '@/service/auth';

interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any; // Allow for additional fields from API
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useLogin();
  
  const refreshUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await getUserProfile();
      setUser(userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  useEffect(() => {
    // On initial load, try to fetch user profile
    const initAuth = async () => {
      // Check if token exists
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile();
        setUser(userProfile);
      } catch (err) {
        // Clear any invalid tokens on error
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
