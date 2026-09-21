/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * DESIGN SYSTEM STATUS BADGE PRIMITIVE
 * 
 * Architectural Purpose:
 * Renders standardized civic status badges with semantic colors, icons, and accessible labels.
 * Strictly prevents ad-hoc status color guessing across screens.
 */

import React from 'react';
import { ComplaintStatus } from '../../types';
import { DESIGN_TOKENS } from '../../styles/tokens';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Wrench, 
  CheckCheck, 
  Archive, 
  XCircle, 
  RotateCcw 
} from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getStatusConfig = (st: ComplaintStatus) => {
    switch (st) {
      case ComplaintStatus.SUBMITTED:
        return {
          ...DESIGN_TOKENS.colors.status.submitted,
          icon: FileText,
        };
      case ComplaintStatus.UNDER_REVIEW:
        return {
          ...DESIGN_TOKENS.colors.status.underReview,
          icon: Search,
        };
      case ComplaintStatus.VERIFIED:
        return {
          ...DESIGN_TOKENS.colors.status.verified,
          icon: CheckCircle2,
        };
      case ComplaintStatus.ASSIGNED:
        return {
          ...DESIGN_TOKENS.colors.status.assigned,
          icon: UserCheck,
        };
      case ComplaintStatus.IN_PROGRESS:
        return {
          ...DESIGN_TOKENS.colors.status.inProgress,
          icon: Wrench,
        };
      case ComplaintStatus.RESOLVED:
        return {
          ...DESIGN_TOKENS.colors.status.resolved,
          icon: CheckCheck,
        };
      case ComplaintStatus.CLOSED:
        return {
          ...DESIGN_TOKENS.colors.status.closed,
          icon: Archive,
        };
      case ComplaintStatus.REJECTED:
        return {
          ...DESIGN_TOKENS.colors.status.rejected,
          icon: XCircle,
        };
      case ComplaintStatus.REOPENED:
        return {
          ...DESIGN_TOKENS.colors.status.reopened,
          icon: RotateCcw,
        };
      default:
        return {
          bg: '#f1f5f9',
          text: '#475569',
          border: '#cbd5e1',
          dot: '#64748b',
          label: st,
          icon: FileText,
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {showIcon && (
        <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      )}
      <span>{config.label}</span>
    </span>
  );
};
