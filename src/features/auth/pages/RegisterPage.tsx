/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CITIZEN REGISTRATION PAGE
 * 
 * Architectural Purpose:
 * Self-service registration for residents. Collects identity details, ward location, and phone.
 * 
 * Spring Boot Integration:
 * - Expected Endpoint: POST /api/v1/auth/register
 * - Expected Payload: { fullName, email, phone, ward, address, password }
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { MOCK_WARDS } from '../../../data/mockData';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../../types';

export const RegisterPage: React.FC = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ward: MOCK_WARDS[0],
    address: '',
    password: '',
    agreeTerms: false,
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError('You must agree to the Municipal Citizen Charter terms.');
      return;
    }
    setError(null);
    setIsSuccess(true);

    // Automatically transition to Citizen portal after brief delay
    setTimeout(() => {
      switchRole(UserRole.CITIZEN);
      navigate('/citizen');
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#1b3b57] text-white items-center justify-center shadow-md">
            <Building2 className="w-7 h-7 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Citizen Profile
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Register to submit grievances, receive real-time SMS/Email status updates, and endorse community projects.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Registration Complete</h3>
              <p className="text-xs text-slate-500">
                Welcome to CivicAlert! Redirecting to your Citizen Dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Fatima Begum"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="citizen@example.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Ward / Municipal Zone <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  {MOCK_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Apartment, House #, Street Name"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agree-terms" className="text-xs text-slate-600">
                  I agree to the Municipal Citizen Charter, open data privacy guidelines, and verification rules.
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Register Citizen Profile
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Already registered? </span>
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 underline">
              Sign In here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
