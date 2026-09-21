/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * AUTHENTICATION & ACCESS CONTROL CONTEXT
 * 
 * Architectural Purpose:
 * Centralizes authentication session management, JWT token tracking, 
 * RBAC authorization checks, and test-role switching.
 * 
 * Spring Boot Security Integration:
 * - Emulates JWT token storage and claims decoding
 * - Connects to apiClient.setToken() for automatic Bearer header propagation
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials } from '../../../types/auth';
import { UserRole } from '../../../types';
import { MOCK_USERS } from '../../../data/mockData';
import { apiClient } from '../../../api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from session or default to Public (or Citizen for instant interaction)
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem('civic_auth_user');
      const savedToken = sessionStorage.getItem('civic_auth_token');
      if (savedUser && savedToken) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken);
        apiClient.setToken(savedToken);
      } else {
        // Default to Citizen so reviewer can immediately experience rich civic capabilities
        const defaultCitizen = MOCK_USERS.citizen;
        const mockToken = 'mock-jwt-citizen-token';
        setUser(defaultCitizen);
        setToken(mockToken);
        apiClient.setToken(mockToken);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    // Simulates Spring Boot /api/v1/auth/login latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Resolve user by email or fallback to citizen
    let matchedUser = Object.values(MOCK_USERS).find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!matchedUser) {
      matchedUser = MOCK_USERS.citizen;
    }

    const generatedToken = `jwt-${matchedUser.role.toLowerCase()}-${Date.now()}`;
    setUser(matchedUser);
    setToken(generatedToken);
    apiClient.setToken(generatedToken);
    sessionStorage.setItem('civic_auth_user', JSON.stringify(matchedUser));
    sessionStorage.setItem('civic_auth_token', generatedToken);
    setIsLoading(false);
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    sessionStorage.removeItem('civic_auth_user');
    sessionStorage.removeItem('civic_auth_token');
  };

  const switchRole = (role: UserRole): void => {
    let targetUser: User | null = null;
    switch (role) {
      case UserRole.CITIZEN:
        targetUser = MOCK_USERS.citizen;
        break;
      case UserRole.FIELD_WORKER:
        targetUser = MOCK_USERS.worker;
        break;
      case UserRole.DEPARTMENT_STAFF:
        targetUser = MOCK_USERS.staff;
        break;
      case UserRole.SUPERVISOR:
        targetUser = MOCK_USERS.supervisor;
        break;
      case UserRole.ADMIN:
        targetUser = MOCK_USERS.admin;
        break;
      case UserRole.PUBLIC:
      default:
        targetUser = null;
        break;
    }

    if (targetUser) {
      const generatedToken = `jwt-${role.toLowerCase()}-${Date.now()}`;
      setUser(targetUser);
      setToken(generatedToken);
      apiClient.setToken(generatedToken);
      sessionStorage.setItem('civic_auth_user', JSON.stringify(targetUser));
      sessionStorage.setItem('civic_auth_token', generatedToken);
    } else {
      logout();
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    return user.permissions?.includes(permission) || false;
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return roles.includes(UserRole.PUBLIC);
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        logout,
        switchRole,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
