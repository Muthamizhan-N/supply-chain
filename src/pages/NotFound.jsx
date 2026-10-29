import React from 'react';
import { Link } from 'react-router-dom';
import { PackageSearch, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mb-4 shadow-sm">
        <PackageSearch className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
        Error 404
      </span>
      <h2 className="text-2xl font-bold text-content-primary">Page or Resource Not Found</h2>
      <p className="text-xs sm:text-sm text-content-secondary max-w-md mt-2 mb-6">
        The requested supply chain console view does not exist or has been relocated to another workspace route.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" leftIcon={Home}>
            Return to Dashboard
          </Button>
        </Link>
        <Link to="/inventory">
          <Button variant="secondary" size="md">
            View Inventory
          </Button>
        </Link>
      </div>
    </div>
  );
};

