import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-surface-subtle text-content-secondary border border-surface-border',
    primary: 'bg-brand-50 text-brand-700 border border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
    danger: 'bg-red-50 text-red-700 border border-red-200 font-medium',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    // Supply chain specific statuses
    'High Stock': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Moderate Stock': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Low Stock': 'bg-rose-50 text-rose-700 border border-rose-200',
    'Critical Shortage': 'bg-red-100 text-red-800 border border-red-300 font-semibold',
    'Delivered': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'On-Time': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Late': 'bg-rose-50 text-rose-700 border border-rose-200 font-medium',
    'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Active': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Inactive': 'bg-slate-100 text-slate-600 border border-slate-200',
    'Under Review': 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  const selectedClass = variants[variant] || variants.default;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs transition-colors',
        selectedClass,
        className
      )}
    >
      {children}
    </span>
  );
};

