import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

export const KPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last period',
  isPositiveGood = true,
  statusVariant = 'default',
  linkTo,
  badgeText,
  iconColor = 'text-brand-600 bg-brand-50 border-brand-100',
}) => {
  const isUp = trend && trend > 0;
  const isDown = trend && trend < 0;

  const trendColor = isUp
    ? isPositiveGood ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
    : isDown
    ? isPositiveGood ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'
    : 'text-slate-500 bg-slate-50';

  return (
    <Card className="hover:shadow-card-hover transition-all group relative overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
            {title}
          </span>
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-content-primary tracking-tight">
            {value}
          </div>
          {badgeText && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              {badgeText}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-surface-border text-xs">
          {trend !== undefined ? (
            <div className="flex items-center gap-1.5">
              <span className={cn('px-1.5 py-0.5 rounded text-[11px] font-bold flex items-center', trendColor)}>
                {isUp ? <ArrowUpRight className="w-3.5 h-3.5 inline" /> : <ArrowDownRight className="w-3.5 h-3.5 inline" />}
                {Math.abs(trend)}%
              </span>
              <span className="text-content-secondary text-[11px]">{trendLabel}</span>
            </div>
          ) : (
            <span className="text-[11px] text-content-secondary">Live inventory metric</span>
          )}

          {linkTo && (
            <Link
              to={linkTo}
              className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

