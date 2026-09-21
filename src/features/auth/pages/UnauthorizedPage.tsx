/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * UNAUTHORIZED (401) PAGE
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Authentication Required (401)
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested municipal resource requires authenticated credentials. Please sign in with your citizen, field staff, or administrator account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <Link to="/login">
            <Button variant="primary" size="md" leftIcon={<LogIn className="w-4 h-4" />}>
              Sign In
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
