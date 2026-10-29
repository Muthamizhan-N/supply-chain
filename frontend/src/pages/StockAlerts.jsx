import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { alertService } from '../services/api';
import { useApp } from '../context/AppContext';

export const StockAlerts = () => {
  const navigate = useNavigate();
  const { showToast, openAiAnalysis } = useApp();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Resolve Alert Modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedAlertForResolve, setSelectedAlertForResolve] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertService.getAll();
      setAlerts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory risk alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch =
        search === '' ||
        a.productName.toLowerCase().includes(search.toLowerCase()) ||
        a.sku.toLowerCase().includes(search.toLowerCase()) ||
        a.alertType.toLowerCase().includes(search.toLowerCase());

      const matchesSeverity = severityFilter === 'All' || a.severity === severityFilter;
      const matchesType = typeFilter === 'All' || a.alertType === typeFilter;

      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [alerts, search, severityFilter, typeFilter]);

  const handleResolveAlert = async (e) => {
    e.preventDefault();
    if (!selectedAlertForResolve) return;
    try {
      setActionLoading(true);
      const updated = await alertService.resolve(selectedAlertForResolve.id, resolutionNotes);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(`Alert for ${updated.sku} resolved`, 'success');
      setResolveModalOpen(false);
      setSelectedAlertForResolve(null);
      setResolutionNotes('');
    } catch (err) {
      showToast(err.message || 'Failed to resolve alert', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'Critical') return <Badge variant="danger">Critical Severity</Badge>;
    if (severity === 'Warning') return <Badge variant="warning">Warning Level</Badge>;
    return <Badge variant="info">Moderate Notice</Badge>;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight flex items-center gap-2">
            Stock Risk & Replenishment Alerts
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
              {alerts.filter((a) => a.status === 'Active').length} Active
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Proactive telemetry identifying potential stockouts, low-buffer SKUs, and overstocked inventory lines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchAlerts}
            leftIcon={RefreshCw}
            isLoading={loading}
          >
            Refresh Alerts
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/purchase-orders')}
            leftIcon={ShoppingBag}
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alert by product, SKU..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-border text-xs text-content-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-content-secondary">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Severity:</span>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-surface-border bg-white text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Moderate">Moderate</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs text-content-secondary ml-1">
              <span>Alert Type:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-surface-border bg-white text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Alert Types</option>
              <option value="Potential Stockout">Potential Stockout</option>
              <option value="Critical Low Stock">Critical Low Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Overstock">Overstock</option>
              <option value="Reorder Recommended">Reorder Recommended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      {error ? (
        <ErrorState message={error} onRetry={fetchAlerts} />
      ) : loading ? (
        <div className="space-y-4">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="No matching stock alerts"
            description="All active catalog inventory levels are currently operating within nominal parameters."
            actionLabel="Reset Search Filters"
            onAction={() => {
              setSearch('');
              setSeverityFilter('All');
              setTypeFilter('All');
            }}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'Resolved';

            return (
              <Card
                key={alert.id}
                className={`transition-all ${
                  isResolved
                    ? 'opacity-60 bg-slate-50/50'
                    : alert.severity === 'Critical'
                    ? 'border-l-4 border-l-red-500 hover:shadow-card-hover'
                    : alert.severity === 'Warning'
                    ? 'border-l-4 border-l-amber-500 hover:shadow-card-hover'
                    : 'border-l-4 border-l-blue-500 hover:shadow-card-hover'
                }`}
              >
                <div className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left Alert Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {getSeverityBadge(alert.severity)}
                      <span className="font-bold text-sm sm:text-base text-content-primary">
                        {alert.productName}
                      </span>
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {alert.sku}
                      </span>
                      {isResolved && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-content-secondary">
                      <span>
                        Alert Type: <strong className="text-content-primary">{alert.alertType}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Available Stock: <strong className={alert.severity === 'Critical' ? 'text-red-600 font-bold' : 'text-content-primary'}>{alert.currentQuantity}</strong> units
                      </span>
                      <span>•</span>
                      <span>
                        Reorder Threshold: <strong className="text-content-primary">{alert.reorderThreshold}</strong> units
                      </span>
                      <span>•</span>
                      <span>Detected: {alert.detectedTime}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-surface-border text-xs text-content-primary leading-relaxed">
                      <strong className="text-content-secondary uppercase text-[10px] tracking-wide block mb-0.5">
                        Recommended Action:
                      </strong>
                      {alert.recommendedAction}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-surface-border">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/purchase-orders')}
                      className="text-xs"
                    >
                      Create Replenishment PO
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAiAnalysis({
                        productDetails: `${alert.productName} (${alert.sku})`,
                      })}
                      leftIcon={Sparkles}
                      className="text-xs"
                    >
                      AI Diagnostics
                    </Button>

                    {!isResolved && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedAlertForResolve(alert);
                          setResolutionNotes('');
                          setResolveModalOpen(true);
                        }}
                        className="text-xs text-slate-600 hover:text-slate-900"
                      >
                        Mark as Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolve Alert Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Inventory Alert"
        subtitle={`Resolving notification for ${selectedAlertForResolve?.productName} (${selectedAlertForResolve?.sku})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResolveAlert} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
              Resolution Action / Audit Notes
            </label>
            <textarea
              required
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Expedited PO-2026-089 with vendor; buffer delivery arrived today at warehouse dock 3."
              className="w-full rounded-lg border border-surface-border bg-white p-2.5 text-xs text-content-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setResolveModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              size="sm"
              isLoading={actionLoading}
            >
              Confirm Resolution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

