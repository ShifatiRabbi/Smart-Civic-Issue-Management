/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * DESIGN SYSTEM TOKENS & SYSTEM CONSTANTS
 * 
 * Architectural Purpose:
 * Centralized design tokens establishing semantic colors, typography metrics, 
 * elevation, border radii, and civic theme constants. Prevents arbitrary raw 
 * values from scattering across UI components and ensures WCAG AA compliance.
 */

export const DESIGN_TOKENS = {
  colors: {
    // Primary Civic Authority Brand (Slate & Deep Navy)
    primary: {
      50: '#f0f5fa',
      100: '#dbe7f3',
      200: '#bad2e8',
      300: '#8db7d9',
      400: '#5b98c5',
      500: '#3b7eb3',
      600: '#2c6495',
      700: '#245179',
      800: '#1b3b57', // Primary Civic Slate
      900: '#0f2438',
      950: '#081420',
    },
    // Secondary Civic Accent (Teal / Integrity)
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
    },
    // Semantic Status Tokens
    status: {
      submitted: {
        bg: '#eff6ff',
        text: '#1e40af',
        border: '#bfdbfe',
        dot: '#3b82f6',
        label: 'Submitted',
      },
      underReview: {
        bg: '#fefce8',
        text: '#854d0e',
        border: '#fef08a',
        dot: '#eab308',
        label: 'Under Review',
      },
      verified: {
        bg: '#f0fdf4',
        text: '#166534',
        border: '#bbf7d0',
        dot: '#22c55e',
        label: 'Verified',
      },
      assigned: {
        bg: '#faf5ff',
        text: '#6b21a8',
        border: '#e9d5ff',
        dot: '#a855f7',
        label: 'Assigned',
      },
      inProgress: {
        bg: '#ecfeff',
        text: '#155e75',
        border: '#a5f3fc',
        dot: '#06b6d4',
        label: 'In Progress',
      },
      resolved: {
        bg: '#f0fdf4',
        text: '#14532d',
        border: '#86efac',
        dot: '#16a34a',
        label: 'Resolved',
      },
      closed: {
        bg: '#f8fafc',
        text: '#334155',
        border: '#cbd5e1',
        dot: '#64748b',
        label: 'Closed',
      },
      rejected: {
        bg: '#fef2f2',
        text: '#991b1b',
        border: '#fecaca',
        dot: '#ef4444',
        label: 'Rejected',
      },
      reopened: {
        bg: '#fff7ed',
        text: '#9a3412',
        border: '#fed7aa',
        dot: '#f97316',
        label: 'Reopened',
      },
    },
    // Priority Tokens
    priority: {
      low: {
        bg: '#f1f5f9',
        text: '#475569',
        border: '#cbd5e1',
        badge: 'Low',
      },
      medium: {
        bg: '#fef3c7',
        text: '#92400e',
        border: '#fde68a',
        badge: 'Medium',
      },
      high: {
        bg: '#ffedd5',
        text: '#9a3412',
        border: '#fed7aa',
        badge: 'High',
      },
      critical: {
        bg: '#fee2e2',
        text: '#991b1b',
        border: '#fca5a5',
        badge: 'Critical',
      },
    },
    // Surface & Neutral Tokens
    neutral: {
      canvas: '#f8fafc',
      surface: '#ffffff',
      surfaceElevated: '#ffffff',
      surfaceMuted: '#f1f5f9',
      borderSubtle: '#e2e8f0',
      borderDefault: '#cbd5e1',
      borderStrong: '#94a3b8',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#64748b',
      textInverted: '#ffffff',
    },
  },
  typography: {
    fontSans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontDisplay: '"Plus Jakarta Sans", "Inter", sans-serif',
  },
  radius: {
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
  },
  layout: {
    maxWidth: '1280px',
    sidebarWidth: '260px',
    topbarHeight: '64px',
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
