import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { AuthBrandPanel } from './AuthBrandPanel';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-bg antialiased selection:bg-brand-100 selection:text-brand-900">
      {/* Left Brand Panel for Desktop */}
      <AuthBrandPanel />

      {/* Right Content Area */}
      <div className="flex flex-col justify-between min-h-screen px-4 sm:px-6 lg:px-12 py-8 overflow-y-auto">
        {/* Top Mobile Brand Header */}
        <div className="flex lg:hidden items-center justify-between pb-6 border-b border-surface-border">
          <Link to="/signin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-content-primary tracking-tight">
                Track<span className="text-brand-600">GPT</span>
              </span>
              <span className="text-[9px] text-content-secondary uppercase font-semibold">
                Supply Intelligence
              </span>
            </div>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700">
            Enterprise Console
          </span>
        </div>

        {/* Center Auth Form Card Container */}
        <div className="my-auto flex flex-col items-center justify-center py-6 sm:py-10">
          <div className="w-full max-w-md bg-white rounded-2xl border border-surface-border shadow-card p-6 sm:p-8 transition-all">
            {children}
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="pt-6 border-t border-surface-border text-center text-xs text-content-secondary flex flex-col sm:flex-row items-center justify-between gap-2 max-w-md mx-auto w-full">
          <span>&copy; {new Date().getFullYear()} TrackGPT Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-brand-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-brand-600 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

