/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * UNIFIED LOGIN PAGE
 * 
 * Architectural Purpose:
 * Entry portal for citizens, staff, field workers, and administrators.
 * Provides standard credential inputs plus one-click persona autofill for instant evaluation.
 * 
 * Spring Boot Integration:
 * - Expected Endpoint: POST /api/v1/auth/login
 * - Expected Payload: { email, password }
 * - Expected Response: { token, refreshToken, user: { id, email, role, permissions } }
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('citizen@example.com');
  const [password, setPassword] = useState('Secret123!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your registered municipal email and password.');
      return;
    }

    try {
      await login({ email, password });
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Direct to appropriate portal
        if (email.includes('worker')) navigate('/worker');
        else if (email.includes('staff')) navigate('/staff');
        else if (email.includes('supervisor')) navigate('/supervisor');
        else if (email.includes('admin')) navigate('/admin');
        else navigate('/citizen');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  const autofillPersona = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Secret123!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Civic Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#1b3b57] text-white items-center justify-center shadow-md">
            <Building2 className="w-7 h-7 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to CivicAlert
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Access citizen reporting, active field orders, department triage, or administrative controls.
          </p>
        </div>

        {/* Demo Fast-Login Persona Selector */}
        <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Select Test Persona (1-Click Fill):</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => autofillPersona('citizen@example.com')}
              className="px-2 py-1.5 bg-white rounded border border-slate-300 text-left hover:border-teal-500 transition text-[11px]"
            >
              <div className="font-semibold text-slate-800">Citizen</div>
              <div className="text-slate-500 truncate">citizen@example.com</div>
            </button>
            <button
              type="button"
              onClick={() => autofillPersona('worker@citygov.org')}
              className="px-2 py-1.5 bg-white rounded border border-slate-300 text-left hover:border-teal-500 transition text-[11px]"
            >
              <div className="font-semibold text-slate-800">Field Worker</div>
              <div className="text-slate-500 truncate">worker@citygov.org</div>
            </button>
            <button
              type="button"
              onClick={() => autofillPersona('staff@citygov.org')}
              className="px-2 py-1.5 bg-white rounded border border-slate-300 text-left hover:border-teal-500 transition text-[11px]"
            >
              <div className="font-semibold text-slate-800">Dept Staff</div>
              <div className="text-slate-500 truncate">staff@citygov.org</div>
            </button>
            <button
              type="button"
              onClick={() => autofillPersona('admin@citygov.org')}
              className="px-2 py-1.5 bg-white rounded border border-slate-300 text-left hover:border-teal-500 transition text-[11px]"
            >
              <div className="font-semibold text-slate-800">System Admin</div>
              <div className="text-slate-500 truncate">admin@citygov.org</div>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Official / Citizen Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  placeholder="name@example.com"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link to="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Platform
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Don't have a Citizen Account? </span>
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700 underline">
              Register as a Resident
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
};
