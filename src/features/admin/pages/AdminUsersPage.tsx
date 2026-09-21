/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ADMIN USER DIRECTORY & ROLE-BASED ACCESS CONTROL (RBAC)
 * 
 * Architectural Purpose:
 * Enterprise user administration interface for managing identities, roles,
 * department assignments, and security permissions.
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Building2, 
  Mail, 
  Phone,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { UserRole } from '../../../types';
import { User } from '../../../types/auth';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const AdminUsersPage: React.FC = () => {
  const { users, departments, createUser, updateUserRole, deleteUser } = useComplaints();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // New User Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.DEPARTMENT_STAFF);
  const [newUserDeptId, setNewUserDeptId] = useState('');
  const [newUserWard, setNewUserWard] = useState('Ward 1 - Downtown Core');

  // Edit Role Modal
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>(UserRole.DEPARTMENT_STAFF);
  const [editDeptId, setEditDeptId] = useState('');

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.departmentName && u.departmentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUser({
      fullName: newUserFullName,
      email: newUserEmail,
      phone: newUserPhone,
      role: newUserRole,
      departmentId: newUserDeptId || undefined,
      ward: newUserWard,
    });
    setIsAddUserOpen(false);
    setNewUserFullName('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    updateUserRole(editingUserId, editRole, editDeptId || undefined);
    setEditingUserId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Identity &amp; Access Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Directory &amp; RBAC</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Administer municipal personnel, grant supervisory rights, and assign department jurisdictions.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsAddUserOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="text-xs"
        >
          Provision User Account
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-teal-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700"
          >
            <option value="ALL">All Roles</option>
            {Object.values(UserRole).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-xs text-slate-400 font-mono">{u.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === UserRole.ADMIN 
                        ? 'bg-purple-100 text-purple-800' 
                        : u.role === UserRole.SUPERVISOR
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === UserRole.DEPARTMENT_STAFF
                        ? 'bg-blue-100 text-blue-800'
                        : u.role === UserRole.FIELD_WORKER
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {u.departmentName || <span className="text-slate-400 italic">None (Municipal-wide)</span>}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {u.ward || 'Central Headquarters'}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUserId(u.id);
                          setEditRole(u.role);
                          setEditDeptId(u.departmentId || '');
                        }}
                        className="text-xs"
                      >
                        Edit Role
                      </Button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Add User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Provision Municipal Account</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arif Hossain"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@citygov.org"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Security Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                  >
                    {Object.values(UserRole).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
                  <select
                    value={newUserDeptId}
                    onChange={(e) => setNewUserDeptId(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                  >
                    <option value="">No Department (General)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create User</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Edit User Role */}
      {editingUserId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Modify Role &amp; Permissions</h3>
              <button onClick={() => setEditingUserId(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Classification</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                >
                  {Object.values(UserRole).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Jurisdiction</label>
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                >
                  <option value="">None / Cross-Department Authority</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditingUserId(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
