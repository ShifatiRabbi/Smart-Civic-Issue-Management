/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * APPLICATION RUNTIME CONFIGURATION
 * 
 * Architectural Purpose:
 * Centralizes environment access and fallback values. Prevents hardcoded URLs 
 * across the application. Note that client environment variables in Vite are public.
 */

export const APP_CONFIG = {
  appName: 'Smart Civic Issue Management Platform',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  defaultPageSize: 10,
  maxFileUploadSizeMB: 10,
  supportedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  slaWarningThresholdPercent: 75,
  defaultCoordinates: {
    // Default Municipal Center (e.g. City Hall)
    latitude: 23.8103,
    longitude: 90.4125,
  },
} as const;
