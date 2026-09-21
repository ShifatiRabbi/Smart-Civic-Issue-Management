/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * FORBIDDEN (403) ACCESS RESTRICTION PAGE
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Access Restricted (403 Forbidden)
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your current active role ({user?.role || 'Guest'}) does not hold the required RBAC permissions to inspect or alter this municipal module.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded text-left text-xs space-y-1">
          <div className="font-semibold text-slate-700">Security Diagnostic:</div>
          <div className="text-slate-500 font-mono text-[11px]">User ID: {user?.id || 'ANONYMOUS'}</div>
          <div className="text-slate-500 font-mono text-[11px]">Active Role: {user?.role || 'NONE'}</div>
          <div className="text-slate-500 text-[11px] pt-1">
            Tip: You can use the top bar <strong>"Simulate Role"</strong> menu to test this screen under an authorized role (e.g. Department Staff or Admin).
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Civic Home
            </Button>
          </Link>
          <Link to="/citizen">
            <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              My Portal
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
