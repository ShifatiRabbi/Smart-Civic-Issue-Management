/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * DESIGN SYSTEM PRIORITY BADGE PRIMITIVE
 * 
 * Architectural Purpose:
 * Renders standardized civic priority badges (LOW, MEDIUM, HIGH, CRITICAL).
 */

import React from 'react';
import { PriorityLevel } from '../../types';
import { DESIGN_TOKENS } from '../../styles/tokens';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
}) => {
  const getPriorityConfig = (pr: PriorityLevel) => {
    switch (pr) {
      case PriorityLevel.LOW:
        return {
          ...DESIGN_TOKENS.colors.priority.low,
          icon: Info,
        };
      case PriorityLevel.MEDIUM:
        return {
          ...DESIGN_TOKENS.colors.priority.medium,
          icon: AlertCircle,
        };
      case PriorityLevel.HIGH:
        return {
          ...DESIGN_TOKENS.colors.priority.high,
          icon: AlertTriangle,
        };
      case PriorityLevel.CRITICAL:
        return {
          ...DESIGN_TOKENS.colors.priority.critical,
          icon: ShieldAlert,
        };
      default:
        return {
          bg: '#f1f5f9',
          text: '#475569',
          border: '#cbd5e1',
          badge: pr,
          icon: Info,
        };
    }
  };

  const config = getPriorityConfig(priority);
  const IconComponent = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-1.5 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${sizeClasses}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>{config.badge}</span>
    </span>
  );
};
