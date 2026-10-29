import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-surface-border shadow-card transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={cn('px-6 py-4 border-b border-surface-border flex items-center justify-between gap-4', className)}>
      <div>
        {title && <h3 className="font-semibold text-content-primary text-base tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-content-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={cn('px-6 py-3 border-t border-surface-border bg-slate-50/50 rounded-b-xl flex items-center justify-between', className)}>
      {children}
    </div>
  );
};

