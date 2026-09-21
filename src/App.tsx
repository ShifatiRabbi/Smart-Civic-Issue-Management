/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ROOT APPLICATION ENTRY POINT
 * 
 * Architectural Purpose:
 * Top-level application coordinator injecting AuthContext, ComplaintProvider, and Router hierarchy.
 */

import React from 'react';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ComplaintProvider } from './features/complaints/context/ComplaintContext';
import { AppRouter } from './app/router/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <AppRouter />
      </ComplaintProvider>
    </AuthProvider>
  );
}
