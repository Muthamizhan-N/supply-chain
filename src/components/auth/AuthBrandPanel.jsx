import React from 'react';
import {
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Package,
  CheckCircle2,
  BrainCircuit,
  ArrowUpRight,
} from 'lucide-react';

export const AuthBrandPanel = () => {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-900 text-white overflow-hidden select-none">
      {/* Background ambient glow & geometric grid accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-brand-600/15 blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-1">
              Track<span className="text-brand-400">GPT</span>
            </span>
            <span className="text-[10px] text-brand-200 uppercase font-bold tracking-widest">
              Supply Chain Intelligence
            </span>
          </div>
        </div>

        <div className="mt-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-400/20 text-brand-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Inventory Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Autonomous supply chain intelligence for high-velocity enterprises.
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Monitor real-time inventory balances, forecast demand with multi-variate SARIMAX models, eliminate stockouts, and streamline multi-vendor procurement.
          </p>
        </div>
      </div>

      {/* Middle Interactive Supply Chain Preview Card */}
      <div className="relative z-10 my-8 max-w-md">
        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Demand Prediction</p>
                <p className="text-[10px] text-slate-300">Processor X Octa-Core (CPU-101)</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              +38% Surge Forecast
            </span>
          </div>

          <div className="p-3 rounded-xl bg-navy-900/60 border border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Model Accuracy:</span>
              <span className="text-emerald-400 font-semibold">94.2% (SARIMAX Hybrid)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Recommended Action:</span>
              <span className="text-white font-medium">Reorder 180 units from AMD Pvt Ltd</span>
            </div>
            <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-gradient-to-r from-brand-400 to-emerald-400 h-full rounded-full w-[85%]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Inventory Monitored</span>
              <span className="text-sm font-bold text-white mt-0.5 block">128 Active SKUs</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block">SLA On-Time Rate</span>
              <span className="text-sm font-bold text-emerald-300 mt-0.5 block">94.8% Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust & Compliance Strip */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>SOC2 Type II Certified & End-to-End Encrypted</span>
        </div>
        <span>v1.0.0 Enterprise</span>
      </div>
    </div>
  );
};

