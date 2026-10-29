import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Settings,
  Sparkles,
  ChevronDown,
  User,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';

import { authService } from '../../services/authService';

const pageTitles = {
  '/dashboard': { title: 'Executive Overview', breadcrumb: 'Platform / Dashboard' },
  '/inventory': { title: 'Inventory Management', breadcrumb: 'Supply Chain / Inventory' },
  '/sales': { title: 'Historical Sales Analytics', breadcrumb: 'Intelligence / Sales' },
  '/forecasting': { title: 'AI Demand Forecasting', breadcrumb: 'Machine Learning / Demand' },
  '/alerts': { title: 'Stock Risk Alerts', breadcrumb: 'Risk Monitoring / Alerts' },
  '/suppliers': { title: 'Supplier Directory & Performance', breadcrumb: 'Procurement / Suppliers' },
  '/purchase-orders': { title: 'Purchase Orders & Deliveries', breadcrumb: 'Procurement / Orders' },
  '/reports': { title: 'Supply Chain Intelligence Reports', breadcrumb: 'Analytics / Reports' },
  '/settings': { title: 'Platform Settings', breadcrumb: 'Administration / Settings' },
};

export const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setMobileMenuOpen, openAiAnalysis, showToast, currentUser: contextUser, logoutUser } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentUser = contextUser || authService.getCurrentUser() || {
    fullName: 'Subash Kumar',
    role: 'Supply Chain Director',
    email: 'subash@trackgpt.enterprise.io',
  };

  const handleSignOut = () => {
    logoutUser();
    setProfileOpen(false);
    navigate('/signin');
  };

  const userInitial = (currentUser.fullName || 'S').charAt(0).toUpperCase();

  const currentPath = '/' + location.pathname.split('/')[1];
  const pageInfo = pageTitles[currentPath] || {
    title: 'TrackGPT Platform',
    breadcrumb: 'TrackGPT / Console',
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchVal.trim())}`);
      showToast(`Searching for "${searchVal.trim()}" in Inventory`, 'info');
    }
  };

  const mockNotifications = [
    {
      id: 1,
      title: 'Potential Stockout Risk: Processor X',
      desc: 'Available quantity at 40 units below threshold (60).',
      time: '12m ago',
      type: 'critical',
      link: '/alerts',
    },
    {
      id: 2,
      title: 'Purchase Order ORD-1024 Delayed',
      desc: 'Vendor shipment from AMD Pvt Ltd is marked late.',
      time: '45m ago',
      type: 'warning',
      link: '/purchase-orders',
    },
    {
      id: 3,
      title: 'Demand Surge Predicted',
      desc: 'ML Model predicts +38% surge for Octa-Core CPUs.',
      time: '2h ago',
      type: 'info',
      link: '/forecasting',
    },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-sm border-b border-surface-border px-4 md:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger & Page Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="hidden sm:block text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
            {pageInfo.breadcrumb}
          </div>
          <h1 className="text-base sm:text-lg font-bold text-content-primary tracking-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Global search */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:block relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search SKU, product, order..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-surface-border bg-slate-50/70 text-xs text-content-primary placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </form>

        {/* Quick Analyse with AI button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => openAiAnalysis()}
          leftIcon={Sparkles}
          className="hidden sm:inline-flex text-brand-700 bg-brand-50/80 border-brand-200 hover:bg-brand-100 font-semibold"
        >
          Analyse with AI
        </Button>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-surface-border shadow-dropdown p-4 z-50 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-content-primary">System Notifications</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                    3 new
                  </span>
                </div>
                <button
                  onClick={() => navigate('/alerts')}
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  View all alerts
                </button>
              </div>

              <div className="divide-y divide-surface-border my-2 max-h-72 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotificationOpen(false);
                      navigate(n.link);
                    }}
                    className="py-3 px-1 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      {n.type === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-content-primary">{n.title}</p>
                        <p className="text-[11px] text-content-secondary mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-surface-border text-center">
                <span className="text-[11px] text-slate-400">
                  Real-time events synced with supply monitoring engine
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings direct link */}
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:block"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Profile Pill ("Hi Subash," from reference screenshots) */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {userInitial}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-content-primary">Hi {currentUser.fullName?.split(' ')[0] || 'Subash'},</span>
              <span className="text-[10px] text-content-secondary">{currentUser.role || 'Supply Chain Director'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-surface-border shadow-dropdown p-2 z-50 animate-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-surface-border mb-1">
                <p className="text-xs font-bold text-content-primary">{currentUser.fullName}</p>
                <p className="text-[11px] text-content-secondary truncate">{currentUser.email}</p>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-content-secondary hover:text-content-primary hover:bg-slate-50 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Organization
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-content-secondary hover:text-content-primary hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                System Preferences
              </button>

              <div className="my-1 border-t border-surface-border" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

