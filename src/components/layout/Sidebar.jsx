import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Sales Analytics', path: '/sales', icon: TrendingUp },
  { name: 'Demand Forecasting', path: '/forecasting', icon: BrainCircuit },
  { name: 'Stock Alerts', path: '/alerts', icon: AlertTriangle, badge: '6' },
  { name: 'Suppliers', path: '/suppliers', icon: Building2 },
  { name: 'Purchase Orders', path: '/purchase-orders', icon: FileSpreadsheet },
  { name: 'Reports', path: '/reports', icon: FileBarChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    openAiAnalysis,
  } = useApp();
  const location = useLocation();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white select-none">
      {/* Top Logo & App Title */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-border">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-content-primary tracking-tight flex items-center gap-1">
                  Track<span className="text-brand-600">GPT</span>
                </span>
                <span className="text-[10px] text-content-secondary uppercase font-semibold tracking-wider">
                  Supply Intelligence
                </span>
              </div>
            )}
          </NavLink>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                title={sidebarCollapsed ? item.name : undefined}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'text-content-secondary hover:text-content-primary hover:bg-slate-100/70'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-brand-600 rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom AI Quick Action Banner & Collapse Toggle */}
      <div className="p-3 border-t border-surface-border space-y-3">
        {!sidebarCollapsed ? (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-brand-200 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-100">
                Analyse with AI
              </span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed mb-3">
              Detect delivery risks and vendor bottlenecks with TrackGPT intelligence.
            </p>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAiAnalysis();
              }}
              className="w-full py-1.5 px-3 bg-white text-brand-700 hover:bg-brand-50 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Run Quick Analysis
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAiAnalysis()}
            title="Analyse with AI"
            className="w-full p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 flex items-center justify-center shadow-xs transition-transform active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-brand-100" />
          </button>
        )}

        {/* Desktop Collapse Button */}
        <div className="hidden md:flex items-center justify-between pt-1">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-content-secondary hover:text-content-primary rounded-lg hover:bg-slate-100 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={cn(
          'hidden md:block fixed inset-y-0 left-0 z-30 border-r border-surface-border bg-white transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

