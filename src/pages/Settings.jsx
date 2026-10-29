import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Building,
  DollarSign,
  Bell,
  Sliders,
  CheckCircle2,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useApp } from '../context/AppContext';

export const Settings = () => {
  const { settings, updateSettings, showToast } = useApp();

  const [formData, setFormData] = useState({
    businessName: settings.businessName || 'Subash Enterprise Supply Chain Ltd.',
    contactEmail: settings.contactEmail || 'subash@trackgpt.enterprise.io',
    contactPhone: settings.contactPhone || '+91 98450 99887',
    currency: settings.currency || 'INR',
    lowStockThresholdPercent: settings.lowStockThresholdPercent || 20,
    overstockThresholdDays: settings.overstockThresholdDays || 90,
    emailAlerts: settings.emailAlerts ?? true,
    criticalSmsAlerts: settings.criticalSmsAlerts ?? false,
    autoReplenishmentSuggestion: settings.autoReplenishmentSuggestion ?? true,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateSettings(formData);
      setSaving(false);
    }, 300);
  };

  const handleReset = () => {
    const defaults = {
      businessName: 'Subash Enterprise Supply Chain Ltd.',
      contactEmail: 'subash@trackgpt.enterprise.io',
      contactPhone: '+91 98450 99887',
      currency: 'INR',
      lowStockThresholdPercent: 20,
      overstockThresholdDays: 90,
      emailAlerts: true,
      criticalSmsAlerts: false,
      autoReplenishmentSuggestion: true,
    };
    setFormData(defaults);
    updateSettings(defaults);
    showToast('Reset to default configurations', 'info');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            Platform Configuration & Preferences
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Manage organization credentials, regional currency standards, and AI telemetry triggers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            leftIcon={RotateCcw}
          >
            Reset Defaults
          </Button>
          <Button
            type="submit"
            form="settings-form"
            variant="primary"
            size="sm"
            isLoading={saving}
            leftIcon={Save}
          >
            Save Preferences
          </Button>
        </div>
      </div>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile */}
        <Card>
          <CardHeader
            title="Enterprise Identity & Business Profile"
            subtitle="Company details displayed on purchase orders, delivery challans, and export sheets"
          />
          <CardBody className="space-y-4">
            <Input
              label="Organization Name"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Contact Email"
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />

              <Input
                label="Direct Operations Phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </CardBody>
        </Card>

        {/* Currency & Regional Formatting */}
        <Card>
          <CardHeader
            title="Currency & Regional Financial Formatting"
            subtitle="Configure currency denomination and display symbols across the dashboard"
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Base Operating Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={[
                  { value: 'INR', label: 'INR (₹) — Indian Rupee' },
                  { value: 'USD', label: 'USD ($) — United States Dollar' },
                ]}
              />

              <div className="p-4 bg-slate-50 rounded-xl border border-surface-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-content-secondary font-medium">Selected Symbol:</span>
                  <p className="font-bold text-lg text-content-primary">
                    {formData.currency === 'USD' ? '$ USD' : '₹ INR'}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  Applied to all financial cards, tables, and PDF invoices.
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Inventory Safety Thresholds */}
        <Card>
          <CardHeader
            title="Inventory Safety Buffers & Stockout Thresholds"
            subtitle="Parameters driving automated alert generation and model reorder triggers"
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Low-Stock Alert Threshold (% of Reorder Level)"
                type="number"
                min="5"
                max="100"
                value={formData.lowStockThresholdPercent}
                onChange={(e) => setFormData({ ...formData, lowStockThresholdPercent: Number(e.target.value) })}
                helperText="Triggers critical risk alert when current stock drops within this buffer."
              />

              <Input
                label="Overstock Detection Threshold (Days of Supply)"
                type="number"
                min="30"
                max="365"
                value={formData.overstockThresholdDays}
                onChange={(e) => setFormData({ ...formData, overstockThresholdDays: Number(e.target.value) })}
                helperText="Flags holding capital risk when inventory exceeds projected days of demand."
              />
            </div>
          </CardBody>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader
            title="AI Alerts & Notification Channels"
            subtitle="Manage distribution of real-time supply chain exception warnings"
          />
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-surface-border hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.emailAlerts}
                  onChange={(e) => setFormData({ ...formData, emailAlerts: e.target.checked })}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-content-primary block">
                    Email Digest for Critical Stockouts
                  </span>
                  <span className="text-content-secondary">
                    Send automated notification to procurement managers when inventory dips below minimum safety.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-surface-border hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.autoReplenishmentSuggestion}
                  onChange={(e) => setFormData({ ...formData, autoReplenishmentSuggestion: e.target.checked })}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-content-primary block">
                    Autonomous AI Demand & Restock Suggestions
                  </span>
                  <span className="text-content-secondary">
                    Allow machine learning models to continuously pre-calculate suggested order batch sizes.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-surface-border hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.criticalSmsAlerts}
                  onChange={(e) => setFormData({ ...formData, criticalSmsAlerts: e.target.checked })}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-content-primary block">
                    SMS Escalations for Vendor Shipment Delays
                  </span>
                  <span className="text-content-secondary">
                    Send SMS dispatch alert to supply chain directors when a purchase order is flagged Late.
                  </span>
                </div>
              </label>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
};

