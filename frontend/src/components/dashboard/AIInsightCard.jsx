import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const AIInsightCard = () => {
  const { openAiAnalysis } = useApp();

  return (
    <Card className="border-brand-200 bg-gradient-to-br from-white via-brand-50/20 to-brand-50/40 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
      <CardHeader
        title="AI Supply Intelligence & Recommendations"
        subtitle="Automated demand pattern signals and delivery risk warnings"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => openAiAnalysis()}
            leftIcon={Sparkles}
          >
            Analyse Supply Order
          </Button>
        }
      />
      <CardBody className="space-y-3.5">
        <div className="p-4 rounded-xl bg-white border border-brand-100 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                Critical Delivery Hazard Flagged
              </span>
              <span className="text-[11px] text-slate-400">Order: ORD-1024</span>
            </div>
            <p className="text-xs text-content-primary mt-1 font-medium leading-relaxed">
              Order ORD-1024 (AMD Pvt Ltd) has an 82% probability of arriving past SLA due to regional transit backlog.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => openAiAnalysis({
                  orderId: 'ORD-1024',
                  supplierName: 'AMD Pvt Ltd',
                  productDetails: 'Processor X Octa-Core',
                })}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Inspect AI Finding & Recommendations <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-brand-100 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Optimal Replenishment Detected
              </span>
              <span className="text-[11px] text-slate-400">SKU: CPU-101</span>
            </div>
            <p className="text-xs text-content-primary mt-1 font-medium leading-relaxed">
              Model forecasts +38% surge in institutional demand over the next 3 weeks. Recommended order batch: 180 units.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

