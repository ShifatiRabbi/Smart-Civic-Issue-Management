/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CITIZEN NOTIFICATIONS CENTER
 * 
 * Architectural Purpose:
 * Alert center for residents tracking municipal status changes,
 * field worker dispatch updates, SLA alerts, and resolution approvals.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  FileText, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useComplaints, CitizenNotification } from '../../complaints/context/ComplaintContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const CitizenNotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useComplaints();
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIconForType = (type: CitizenNotification['type']) => {
    switch (type) {
      case 'WORKER_ASSIGNED':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'RESOLUTION':
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      case 'SLA_ALERT':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" />
            <span>Municipal Notification Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status milestones, dispatch notices, and photo verification alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllNotificationsAsRead} leftIcon={<CheckCheck className="w-3.5 h-3.5" />}>
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
            filterType === 'ALL'
              ? 'bg-[#1b3b57] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
            filterType === 'UNREAD'
              ? 'bg-[#1b3b57] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notification Stream */}
      {filteredNotifs.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No Notifications</h3>
          <p className="text-xs text-slate-500">
            You are all caught up with your municipal reports and work orders.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !notif.isRead ? 'border-l-4 border-l-teal-600 bg-teal-50/20' : ''
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 mt-0.5 shrink-0">
                  {getIconForType(notif.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">
                      {notif.title}
                    </h3>
                    <span className="font-mono text-[11px] font-semibold text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
                      {notif.referenceNumber}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono pt-1">
                    {new Date(notif.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {!notif.isRead && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1"
                  >
                    Mark read
                  </button>
                )}
                <Link to={`/citizen/complaints/${notif.complaintId}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Complaint
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
