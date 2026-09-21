/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * PUBLIC CIVIC LAYOUT
 * 
 * Architectural Purpose:
 * Clean, trustworthy governmental layout for public pages (Landing, Explorer, Map, Public Detail).
 * Features accessibility-conscious header, role simulation switcher for evaluation, and civic footer.
 */

import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Search, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Shield, 
  PhoneCall, 
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { UserRole } from '../../types';
import { Button } from '../ui/Button';

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setIsRoleMenuOpen(false);
    if (role === UserRole.CITIZEN) navigate('/citizen');
    else if (role === UserRole.FIELD_WORKER) navigate('/worker');
    else if (role === UserRole.DEPARTMENT_STAFF) navigate('/staff');
    else if (role === UserRole.SUPERVISOR) navigate('/supervisor');
    else if (role === UserRole.ADMIN) navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Governmental Bar */}
      <div className="bg-[#0f2438] text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Official Municipal Civic Grievance & Issue Management Portal</span>
          </div>
          
          {/* Fast Role Switcher for Platform Evaluation */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 bg-[#1b3b57] hover:bg-[#245179] text-teal-300 px-2.5 py-0.5 rounded border border-teal-500/30 text-xs transition cursor-pointer"
              title="Test the platform as different municipal actors"
            >
              <Shield className="w-3 h-3" />
              <span>Role: <strong className="text-white">{user ? user.role : 'Public User'}</strong></span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-50 text-slate-800">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Persona (Demo & Testing)
                </div>
                <button
                  onClick={() => handleRoleSelect(UserRole.PUBLIC)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 flex items-center justify-between ${!user ? 'bg-slate-50 font-semibold text-[#1b3b57]' : ''}`}
                >
                  <span>Public Anonymous User</span>
                  {!user && <span className="text-[10px] text-teal-600 font-bold">Active</span>}
                </button>
                <button
                  onClick={() => handleRoleSelect(UserRole.CITIZEN)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 flex items-center justify-between ${user?.role === UserRole.CITIZEN ? 'bg-slate-50 font-semibold text-[#1b3b57]' : ''}`}
                >
                  <span>Citizen (Rahim Chowdhury)</span>
                  {user?.role === UserRole.CITIZEN && <span className="text-[10px] text-teal-600 font-bold">Active</span>}
                </button>
                <button
                  onClick={() => handleRoleSelect(UserRole.FIELD_WORKER)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 flex items-center justify-between ${user?.role === UserRole.FIELD_WORKER ? 'bg-slate-50 font-semibold text-[#1b3b57]' : ''}`}
                >
                  <span>Field Worker (Unit 4)</span>
                  {user?.role === UserRole.FIELD_WORKER && <span className="text-[10px] text-teal-600 font-bold">Active</span>}
                </button>
                <button
                  onClick={() => handleRoleSelect(UserRole.DEPARTMENT_STAFF)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 flex items-center justify-between ${user?.role === UserRole.DEPARTMENT_STAFF ? 'bg-slate-50 font-semibold text-[#1b3b57]' : ''}`}
                >
                  <span>Department Triage Staff</span>
                  {user?.role === UserRole.DEPARTMENT_STAFF && <span className="text-[10px] text-teal-600 font-bold">Active</span>}
                </button>
                <button
                  onClick={() => handleRoleSelect(UserRole.SUPERVISOR)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 flex items-center justify-between ${user?.role === UserRole.SUPERVISOR ? 'bg-slate-50 font-semibold text-[#1b3b57]' : ''}`}
                >
                  <span>Operations Supervisor</span>
                  {user?.role === UserRole.SUPERVISOR && <span className="text-[10px] text-teal-600 font-bold">Active</span>}
                </button>
                <button
                  onClick={() => handleRoleSelect(UserRole.ADMIN)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 flex items-center justify-between ${user?.role === UserRole.ADMIN ? 'bg-slate-50 font-semibold text-[#1b3b57]' : ''}`}
                >
                  <span>Municipal Administrator</span>
                  {user?.role === UserRole.ADMIN && <span className="text-[10px] text-teal-600 font-bold">Active</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Civic Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & City Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-[#1b3b57] text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-[#0f2438] transition">
              <Building2 className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight block leading-tight">
                CivicAlert
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Municipal Issue & Resolution System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? 'text-[#1b3b57] bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive ? 'text-[#1b3b57] bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Search className="w-4 h-4" />
              <span>Explore Issues</span>
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive ? 'text-[#1b3b57] bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Civic Map</span>
            </NavLink>
          </nav>

          {/* Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/citizen/complaints/new">
              <Button variant="secondary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Report an Issue
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to={
                    user.role === UserRole.CITIZEN
                      ? '/citizen'
                      : user.role === UserRole.FIELD_WORKER
                      ? '/worker'
                      : user.role === UserRole.DEPARTMENT_STAFF
                      ? '/staff'
                      : user.role === UserRole.SUPERVISOR
                      ? '/supervisor'
                      : '/admin'
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#1b3b57]" />
                  <span>Dashboard ({user.role})</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Explore Issues
            </Link>
            <Link
              to="/map"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Civic Map
            </Link>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/citizen/complaints/new" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Report an Issue
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link to="/citizen" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Go to Portal Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Citizen Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Civic Footer */}
      <footer className="bg-[#0f2438] text-slate-300 pt-12 pb-8 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Col 1: Portal Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Building2 className="w-5 h-5 text-teal-400" />
                <span>CivicAlert Platform</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The centralized municipal grievance and infrastructure monitoring platform 
                connecting citizens, dispatch workers, and city administration for transparent governance.
              </p>
              <div className="flex items-center gap-2 text-xs text-teal-400 pt-1">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>City Emergency Hotline: <strong>311</strong></span>
              </div>
            </div>

            {/* Col 2: Citizen Services */}
            <div className="space-y-2">
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Citizen Services</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link to="/citizen/complaints/new" className="hover:text-white transition">Report Civic Problem</Link></li>
                <li><Link to="/explore" className="hover:text-white transition">Track Public Complaints</Link></li>
                <li><Link to="/map" className="hover:text-white transition">Live Incident Map</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Create Citizen Account</Link></li>
              </ul>
            </div>

            {/* Col 3: Municipal Departments */}
            <div className="space-y-2">
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Departments & SLA</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>Roads & Bridges (48h SLA)</li>
                <li>Waste & Sanitation (24h SLA)</li>
                <li>Water & Sewerage (12h SLA)</li>
                <li>Electricity & Lighting (72h SLA)</li>
              </ul>
            </div>

            {/* Col 4: Platform Compliance */}
            <div className="space-y-2">
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Data & Security</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All public views are strictly anonymized according to the Municipal Citizen Data Privacy Charter. 
                Full audit trails are recorded for administrative actions.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 font-mono">
                API Version: v1 (Spring Boot REST)
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© 2026 Smart Civic Issue Management System. All municipal rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Citizen Privacy Notice</span>
              <span className="hover:text-slate-400 cursor-pointer">Open Data Terms</span>
              <span className="hover:text-slate-400 cursor-pointer">Accessibility Statement</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
