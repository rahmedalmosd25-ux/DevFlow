'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken, getUser, removeToken, removeUser, setToken, setUser, UpdateProfileRequest } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string, phone: string) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        setTokenState(response.data.token);
        setUserState(response.data.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, name: string, password: string, phone: string) => {
    try {
      const response = await authApi.signUp({ email, name, password, phone });
      if (response.success && response.data) {
        setTokenState(response.data.token);
        setUserState(response.data.user);
      } else {
        throw new Error(response.message || 'Sign up failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.success && response.data) {
        setUserState(response.data.user);
      } else {
        throw new Error(response.message || 'Update profile failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setTokenState(null);
      setUserState(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    signUp,
    updateProfile,
    logout,
    isAuthenticated: !!user && !!token,
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

