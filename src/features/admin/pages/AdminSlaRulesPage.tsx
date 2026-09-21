/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ADMIN SLA RULES CONFIGURATION MATRIX
 * 
 * Architectural Purpose:
 * Fine-grained municipal SLA matrix configuration.
 * Defines turnaround targets, warning windows, and supervisor sign-off mandates by category and priority.
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Clock, 
  ShieldAlert, 
  CheckSquare, 
  Building2, 
  Layers,
  Edit2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { PriorityLevel } from '../../../types';
import { SlaRuleConfig } from '../../../types/admin';
import { MOCK_CATEGORIES } from '../../../data/mockData';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';

export const AdminSlaRulesPage: React.FC = () => {
  const { slaRules, departments, updateSlaRule, createSlaRule } = useComplaints();

  // Create Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCatCode, setSelectedCatCode] = useState(MOCK_CATEGORIES[0].code);
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.HIGH);
  const [targetHours, setTargetHours] = useState(24);
  const [warningHours, setWarningHours] = useState(4);
  const [reqSignoff, setReqSignoff] = useState(false);

  // Edit Modal
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editTargetHours, setEditTargetHours] = useState(24);
  const [editWarningHours, setEditWarningHours] = useState(4);
  const [editReqSignoff, setEditReqSignoff] = useState(false);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = MOCK_CATEGORIES.find(c => c.code === selectedCatCode) || MOCK_CATEGORIES[0];
    const dept = departments.find(d => d.id === cat.departmentId) || departments[0];

    createSlaRule({
      categoryId: cat.id,
      categoryName: cat.name,
      departmentId: dept.id,
      departmentName: dept.name,
      priority,
      targetHours,
      escalationWarningHours: warningHours,
      requiresSupervisorSignoff: reqSignoff,
      autoEscalateOnBreach: true,
      isActive: true,
    });

    setIsAddOpen(false);
  };

  const handleUpdateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRuleId) return;
    updateSlaRule(editingRuleId, {
      targetHours: editTargetHours,
      escalationWarningHours: editWarningHours,
      requiresSupervisorSignoff: editReqSignoff,
    });
    setEditingRuleId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>Service Level Policy Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SLA Matrix Configuration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure turnaround deadlines, warning escalation windows, and quality sign-off mandates.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs"
        >
          Add SLA Rule
        </Button>
      </div>

      {/* Rules Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Priority Level</th>
                <th className="py-3 px-4">Target SLA</th>
                <th className="py-3 px-4">Warning Trigger</th>
                <th className="py-3 px-4">Supervisor Sign-Off</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {slaRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {rule.categoryName}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {rule.departmentName}
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={rule.priority} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-teal-700">
                    {rule.targetHours} Hours
                  </td>
                  <td className="py-3.5 px-4 text-xs text-amber-700 font-medium">
                    &lt; {rule.escalationWarningHours}h before breach
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {rule.requiresSupervisorSignoff ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mandatory
                      </span>
                    ) : (
                      <span className="text-slate-400">Optional</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRuleId(rule.id);
                        setEditTargetHours(rule.targetHours);
                        setEditWarningHours(rule.escalationWarningHours);
                        setEditReqSignoff(rule.requiresSupervisorSignoff);
                      }}
                      className="text-xs"
                    >
                      Configure
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Add SLA Rule */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Define SLA Policy Rule</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Category *</label>
                <select
                  value={selectedCatCode}
                  onChange={(e) => setSelectedCatCode(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                >
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.departmentName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Tier</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                >
                  {Object.values(PriorityLevel).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Hours *</label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    required
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warning Window (h)</label>
                  <input
                    type="number"
                    min={1}
                    max={72}
                    required
                    value={warningHours}
                    onChange={(e) => setWarningHours(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="signoffCheck"
                  checked={reqSignoff}
                  onChange={(e) => setReqSignoff(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="signoffCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Require supervisor photo sign-off before closure
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Policy Rule</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Edit SLA Rule */}
      {editingRuleId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Adjust SLA Parameters</h3>
              <button onClick={() => setEditingRuleId(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleUpdateRule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    required
                    value={editTargetHours}
                    onChange={(e) => setEditTargetHours(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warning Window (h)</label>
                  <input
                    type="number"
                    min={1}
                    max={72}
                    required
                    value={editWarningHours}
                    onChange={(e) => setEditWarningHours(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editSignoffCheck"
                  checked={editReqSignoff}
                  onChange={(e) => setEditReqSignoff(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="editSignoffCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Require supervisor audit sign-off
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditingRuleId(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Update Policy</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
