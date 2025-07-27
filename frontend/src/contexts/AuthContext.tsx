'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, DashboardData, LoginData, RegisterData, LoginResponse } from '../lib/api';

interface AuthContextType {
  user: User | null;
  dashboardData: DashboardData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<LoginResponse>;
  register: (data: RegisterData) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  checkProfileCompletion: () => Promise<{ requiresCompletion: boolean; nextStep: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = api.getToken();
      
      if (token) {
        try {
          const dashboard = await api.getDashboard();
          setUser(dashboard.user);
          setDashboardData(dashboard);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Token might be expired, remove it
          api.setToken(null);
          setUser(null);
          setDashboardData(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setDashboardData(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await api.login(data);
      
      // Set basic user info first
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Always check profile completion status
      const profileCheck = await checkProfileCompletion();
      
      if (profileCheck.requiresCompletion) {
        // Don't load dashboard data, user needs to complete profile
        return {
          ...response,
          next_step: 'complete_profile'
        };
      }
      
      // Profile is complete, load dashboard data
      try {
        const dashboard = await api.getDashboard();
        setUser(dashboard.user);
        setDashboardData(dashboard);
        
        return {
          ...response,
          next_step: 'dashboard'
        };
      } catch (dashboardError) {
        console.error('Error loading dashboard:', dashboardError);
        // Even if dashboard fails, user is still logged in
        return {
          ...response,
          next_step: 'dashboard'
        };
      }
    } catch (error) {
      setUser(null);
      setDashboardData(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<LoginResponse> => {
    try {
      const response = await api.register(data);
      
      // Get full dashboard data after successful registration
      const dashboard = await api.getDashboard();
      setUser(dashboard.user);
      setDashboardData(dashboard);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      setUser(null);
      setDashboardData(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setDashboardData(null);
      setIsAuthenticated(false);
    }
  };

  const refreshDashboard = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      const dashboard = await api.getDashboard();
      setUser(dashboard.user);
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      // If dashboard refresh fails, user might be logged out
      setUser(null);
      setDashboardData(null);
      setIsAuthenticated(false);
    }
  };

  const checkProfileCompletion = async (): Promise<{ requiresCompletion: boolean; nextStep: string }> => {
    if (!isAuthenticated) {
      return { requiresCompletion: false, nextStep: '' };
    }

    try {
      const response = await api.checkProfileCompletion();
      return response;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return { requiresCompletion: false, nextStep: '' };
    }
  };

  const value: AuthContextType = {
    user,
    dashboardData,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshDashboard,
    checkProfileCompletion,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 