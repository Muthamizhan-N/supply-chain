import React from 'react';
import { Building, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { mockCustomers } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const CustomerPartnersList = () => {
  const { currencySymbol, openAiAnalysis } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-content-primary">Key Institutional Clients & Partners</h3>
          <p className="text-xs text-content-secondary">Major recurring distribution accounts and academic research labs</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {mockCustomers.map((c) => (
          <div
            key={c.id}
            onClick={() => openAiAnalysis({
              companyName: c.name,
              productDetails: 'Batch Supply for ' + c.name,
            })}
            className="p-4 bg-white rounded-xl border border-surface-border shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-600 mb-2.5 group-hover:scale-105 transition-transform">
              <Building className="w-6 h-6 text-brand-700" />
            </div>
            <h4 className="text-xs font-bold text-content-primary group-hover:text-brand-600 transition-colors line-clamp-1">
              {c.name}
            </h4>
            <span className="text-[10px] text-content-secondary mt-0.5">{c.totalOrders} Completed Orders</span>
            <span className="text-[11px] font-semibold text-content-primary mt-1.5">
              {formatCurrency(c.spent, currencySymbol === '$' ? 'USD' : 'INR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

