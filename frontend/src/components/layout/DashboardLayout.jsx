import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/Toast';
import { AIResultModal } from '../common/AIResultModal';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

export const DashboardLayout = () => {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        )}
      >
        <Topbar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <AIResultModal />
      <ToastContainer />
    </div>
  );
};

