/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CITIZEN PROFILE & PREFERENCES PAGE
 * 
 * Architectural Purpose:
 * Personal account management for residents. Configures residential ward,
 * contact details, and automated notification channels.
 */

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Save, 
  Bell 
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { MOCK_WARDS } from '../../../data/mockData';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const CitizenProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || 'Fatima Begum');
  const [email, setEmail] = useState(user?.email || 'citizen@example.com');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-2830');
  const [ward, setWard] = useState(user?.ward || MOCK_WARDS[0]);
  const [address, setAddress] = useState('42 Lakeview Avenue, Apartment 3B');

  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RESIDENTIAL CITIZEN REGISTRY</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Citizen Profile & Contact Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Maintain your municipal residence ward and dispatch notification preferences.
        </p>
      </div>

      {showSavedFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">Profile Successfully Updated</div>
            <div>Your contact details and notification channels are synchronized with municipal dispatch.</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Contact Information */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>Identity & Contact Details</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Used strictly for verification of physical reports and automated SMS dispatches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Contact Phone (for SMS updates)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </Card>

        {/* Residential Ward & Location */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Municipal Residence & Ward Affiliation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensures that local ward councilors receive community escalation reports.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Municipal Ward
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white font-medium"
              >
                {MOCK_WARDS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Alert & Dispatch Communication Channels</span>
            </h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-slate-900">SMS Milestone Notifications</div>
                <div className="text-[11px] text-slate-500">
                  Send immediate SMS alerts when a field worker unit is assigned and when repairs are complete.
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-slate-900">Email Audit Receipts</div>
                <div className="text-[11px] text-slate-500">
                  Send detailed email summaries with photographic before-and-after resolution evidence.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailReports}
                onChange={(e) => setEmailReports(e.target.checked)}
                className="rounded text-blue-600"
              />
            </label>
          </div>
        </Card>

        {/* Save Button Bar */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" leftIcon={<Save className="w-4 h-4" />}>
            Save Profile Changes
          </Button>
        </div>

      </form>
    </div>
  );
};
