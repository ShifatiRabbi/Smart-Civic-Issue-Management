/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ADMIN DEPARTMENTS & WARDS CONFIGURATION
 * 
 * Architectural Purpose:
 * Administers municipal agencies, their code identifiers, service phone lines,
 * and geographic ward assignments.
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { Department } from '../../../types';
import { MOCK_WARDS } from '../../../data/mockData';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const AdminDepartmentsPage: React.FC = () => {
  const { departments, createDepartment, updateDepartment } = useComplaints();

  // Create department modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Edit department modal
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createDepartment({
      code: code.toUpperCase(),
      name,
      contactEmail,
      phone,
    });
    setIsAddOpen(false);
    setCode('');
    setName('');
    setContactEmail('');
    setPhone('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeptId) return;
    updateDepartment(editingDeptId, {
      name: editName,
      contactEmail: editEmail,
      phone: editPhone,
    });
    setEditingDeptId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Jurisdictional Hierarchy</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Departments &amp; Wards Configuration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure municipal departments, agency routing codes, contact lines, and geographic ward sectors.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs"
        >
          Add Municipal Agency
        </Button>
      </div>

      {/* Departments Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Configured Municipal Agencies ({departments.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="p-5 flex flex-col justify-between space-y-4 border border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {dept.code}
                  </span>
                  <button
                    onClick={() => {
                      setEditingDeptId(dept.id);
                      setEditName(dept.name);
                      setEditEmail(dept.contactEmail);
                      setEditPhone(dept.phone);
                    }}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{dept.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{dept.id}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{dept.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{dept.phone}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Field Units</span>
                  <span className="font-bold text-slate-800 text-sm">{dept.activeWorkersCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Open Tickets</span>
                  <span className="font-bold text-teal-700 text-sm">{dept.openComplaintsCount}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Municipal Wards Registry */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Geographic Administrative Wards</h2>
          </div>
          <span className="text-xs text-slate-500">{MOCK_WARDS.length} zones mapped</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {MOCK_WARDS.map((ward, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block">{ward}</span>
              <span className="text-slate-500 text-[11px] mt-1 block">Full civic service routing active</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal: Add Department */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Provision Municipal Department</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agency Code (3-4 Letters) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRD"
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parks, Recreation & Environment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="parks@citygov.org"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Hotline / Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 019-2835"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Department</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Edit Department */}
      {editingDeptId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Update Agency Information</h3>
              <button onClick={() => setEditingDeptId(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agency Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditingDeptId(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
