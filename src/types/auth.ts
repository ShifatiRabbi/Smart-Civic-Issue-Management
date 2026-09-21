/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * AUTHENTICATION & ACCESS CONTROL TYPES
 * 
 * Architectural Purpose:
 * Defines user authentication models, session states, and permission sets.
 * Mirrors Spring Security UserDetails and JWT token payload.
 * 
 * Spring Boot Security Mapping:
 * - org.springframework.security.core.userdetails.UserDetails
 * - org.springframework.security.core.GrantedAuthority
 */

import { UserRole } from './index';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  ward?: string;
  avatarUrl?: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  nationalId?: string;
  ward: string;
  address: string;
  password: string;
}
