/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * UNIFIED DASHBOARD LAYOUT
 * 
 * Architectural Purpose:
 * Structural container for all authenticated role portals (Citizen, Worker, Staff, Supervisor, Admin).
 * Dynamically provides role-based sidebar menus, breadcrumbs, notification indicators,
 * and seamless test-role switching without code duplication.
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Wrench, 
  CheckSquare, 
  Users, 
  ShieldAlert, 
  Sliders, 
  History, 
  Layers, 
  ChevronRight, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Sparkles,
  BarChart3,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { UserRole } from '../../types';

export const DashboardLayout: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Generate role-specific navigation items
  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.CITIZEN:
        return [
          { to: '/citizen', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/citizen/complaints', label: 'My Complaints', icon: FileText },
          { to: '/citizen/complaints/new', label: 'Report New Issue', icon: PlusCircle },
          { to: '/citizen/notifications', label: 'Notifications', icon: Bell },
          { to: '/citizen/profile', label: 'Citizen Profile', icon: UserIcon },
        ];
      case UserRole.FIELD_WORKER:
        return [
          { to: '/worker', label: 'Worker Dashboard', icon: LayoutDashboard, end: true },
          { to: '/worker/assignments', label: 'Assigned Orders', icon: Wrench },
          { to: '/worker/history', label: 'Work History', icon: History },
        ];
      case UserRole.DEPARTMENT_STAFF:
        return [
          { to: '/staff', label: 'Triage Dashboard', icon: LayoutDashboard, end: true },
          { to: '/staff/complaints', label: 'Intake Queue', icon: FileText },
          { to: '/staff/workload', label: 'Worker Dispatch Matrix', icon: Users },
          { to: '/gis', label: 'GIS Command Map', icon: Radio },
          { to: '/intelligence', label: 'AI Auto-Triage', icon: Sparkles },
        ];
      case UserRole.SUPERVISOR:
        return [
          { to: '/supervisor', label: 'Operations Command', icon: LayoutDashboard, end: true },
          { to: '/supervisor/escalations', label: 'SLA Escalations', icon: ShieldAlert },
          { to: '/supervisor/reviews', label: 'Resolution Sign-Offs', icon: CheckSquare },
          { to: '/gis', label: 'GIS Fleet & Heatmap', icon: Radio },
          { to: '/intelligence', label: 'AI Triage & Duplicates', icon: Sparkles },
          { to: '/analytics', label: 'SLA Velocity Analytics', icon: BarChart3 },
          { to: '/supervisor/reports', label: 'Department Reports', icon: Layers },
        ];
      case UserRole.ADMIN:
        return [
          { to: '/admin', label: 'System Overview', icon: LayoutDashboard, end: true },
          { to: '/admin/complaints', label: 'Master Complaints', icon: FileText },
          { to: '/gis', label: 'GIS Command Center', icon: Radio },
          { to: '/intelligence', label: 'AI Intelligence Suite', icon: Sparkles },
          { to: '/analytics', label: 'Executive SLA Analytics', icon: BarChart3 },
          { to: '/admin/users', label: 'User Directory & RBAC', icon: Users },
          { to: '/admin/departments', label: 'Departments & Wards', icon: Building2 },
          { to: '/admin/sla-rules', label: 'SLA Matrix Configuration', icon: Sliders },
          { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: History },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setIsRoleDropdownOpen(false);
    if (role === UserRole.CITIZEN) navigate('/citizen');
    else if (role === UserRole.FIELD_WORKER) navigate('/worker');
    else if (role === UserRole.DEPARTMENT_STAFF) navigate('/staff');
    else if (role === UserRole.SUPERVISOR) navigate('/supervisor');
    else if (role === UserRole.ADMIN) navigate('/admin');
    else navigate('/');
  };

  // Generate breadcrumb pieces
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#1b3b57] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center font-bold text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm">CivicAlert Portal</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded text-slate-200 hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0f2438] text-slate-300 flex flex-col border-r border-slate-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-0 max-md:-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 h-16 flex items-center gap-3 border-b border-slate-800 bg-[#081420]">
          <div className="w-9 h-9 rounded-lg bg-[#0d9488] text-white flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight leading-tight">CivicAlert</div>
            <div className="text-[11px] text-teal-400 font-medium tracking-wide uppercase">
              {user ? `${user.role} PORTAL` : 'GUEST PORTAL'}
            </div>
          </div>
        </div>

        {/* User Identity Snippet */}
        {user && (
          <div className="p-3 mx-3 my-3 rounded-lg bg-[#1b3b57]/60 border border-slate-800">
            <div className="text-xs font-semibold text-white truncate">{user.fullName}</div>
            <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            {user.ward && (
              <div className="text-[10px] text-teal-300 mt-1 flex items-center gap-1 font-mono">
                <span>Location:</span>
                <span className="truncate">{user.ward}</span>
              </div>
            )}
            {user.departmentName && (
              <div className="text-[10px] text-blue-300 mt-1 flex items-center gap-1 font-mono">
                <span>Dept:</span>
                <span className="truncate">{user.departmentName}</span>
              </div>
            )}
          </div>
        )}

        {/* Nav Link List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#1b3b57] text-white font-semibold shadow-xs border-l-3 border-teal-400'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Navigation */}
        <div className="p-3 border-t border-slate-800 space-y-1 bg-[#081420]">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <span>Public Civic Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Desktop Bar */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 capitalize">{user?.role.toLowerCase().replace('_', ' ')}</span>
            {pathSegments.map((segment, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="capitalize text-slate-900 font-medium">
                  {segment.replace('-', ' ')}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Top Actions: Persona Switcher & Indicators */}
          <div className="flex items-center gap-3">
            
            {/* Quick Testing Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-300 transition cursor-pointer"
                title="Switch role instantly to test role-based behavior"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Simulate Role: <strong>{user?.role}</strong></span>
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-60 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Persona (Evaluation Mode)
                  </div>
                  <button
                    onClick={() => handleRoleChange(UserRole.CITIZEN)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Citizen</div>
                      <div className="text-[10px] text-slate-500">File complaints, track timeline, upvote</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleChange(UserRole.FIELD_WORKER)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Field Worker</div>
                      <div className="text-[10px] text-slate-500">Dispatch queue, status update, photos</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleChange(UserRole.DEPARTMENT_STAFF)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Department Staff</div>
                      <div className="text-[10px] text-slate-500">Intake triage, reject, assign workers</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleChange(UserRole.SUPERVISOR)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Supervisor</div>
                      <div className="text-[10px] text-slate-500">Escalations, SLA warnings, sign-off</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleChange(UserRole.ADMIN)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">System Admin</div>
                      <div className="text-[10px] text-slate-500">Master registries, audit logs, SLA rules</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <Link
              to="/citizen/notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full"></span>
            </Link>
          </div>
        </header>

        {/* Dashboard Main Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
