import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  Package,
  DollarSign,
  TrendingUp,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { productService, supplierService, purchaseOrderService, salesService } from '../services/api';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';
import { useApp } from '../context/AppContext';

export const Reports = () => {
  const { currencySymbol, showToast } = useApp();

  const [reportType, setReportType] = useState('inventory-valuation');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});

  const reportDefinitions = [
    {
      id: 'inventory-valuation',
      title: 'Inventory Stock Valuation Report',
      description: 'Comprehensive breakdown of current warehouse on-hand stock and tied capital value per SKU.',
      icon: Package,
    },
    {
      id: 'low-stock-audit',
      title: 'Low-Stock & Stockout Vulnerability Audit',
      description: 'Products operating below minimum reorder thresholds requiring urgent replenishment POs.',
      icon: AlertTriangle,
    },
    {
      id: 'supplier-performance',
      title: 'Supplier Lead Time & SLA Compliance',
      description: 'Vendor evaluation analyzing historical fulfillment lead times and on-time shipment rates.',
      icon: Building2,
    },
    {
      id: 'order-fulfillment',
      title: 'Purchase Order & Delivery Ledger',
      description: 'Audit log of all procurement orders and outbound delivery transit records.',
      icon: FileSpreadsheet,
    },
  ];

  const generateReport = async () => {
    try {
      setLoading(true);

      if (reportType === 'inventory-valuation') {
        const prods = await productService.getAll();
        setReportData(prods);
        const totalVal = prods.reduce((acc, p) => acc + (p.inventoryValue || p.currentStock * p.unitCost), 0);
        const totalUnits = prods.reduce((acc, p) => acc + p.currentStock, 0);
        setSummaryStats({
          metric1: { label: 'Total Catalog Valuation', value: formatCurrency(totalVal, currencySymbol === '$' ? 'USD' : 'INR') },
          metric2: { label: 'Total Physical Units', value: formatNumber(totalUnits) },
          metric3: { label: 'Active SKUs Count', value: prods.length },
        });
      } else if (reportType === 'low-stock-audit') {
        const prods = await productService.getAll();
        const lowProds = prods.filter((p) => p.currentStock <= p.reorderLevel);
        setReportData(lowProds);
        setSummaryStats({
          metric1: { label: 'Vulnerable SKUs', value: lowProds.length },
          metric2: { label: 'Replenishment Priority', value: 'High' },
          metric3: { label: 'Critical Under 20%', value: lowProds.filter(p => p.currentStock <= p.reorderLevel * 0.5).length },
        });
      } else if (reportType === 'supplier-performance') {
        const sups = await supplierService.getAll();
        setReportData(sups);
        const avgSla = Math.round(sups.reduce((acc, s) => acc + s.onTimeDeliveryRate, 0) / (sups.length || 1));
        setSummaryStats({
          metric1: { label: 'Registered Vendors', value: sups.length },
          metric2: { label: 'Average On-Time SLA', value: `${avgSla}%` },
          metric3: { label: 'Active Tier 1 Vendors', value: sups.filter(s => s.status === 'Active').length },
        });
      } else if (reportType === 'order-fulfillment') {
        const orders = await purchaseOrderService.getAll();
        setReportData(orders);
        const totalAmount = orders.reduce((acc, o) => acc + o.totalAmount, 0);
        setSummaryStats({
          metric1: { label: 'Total Procured Volume', value: formatCurrency(totalAmount, currencySymbol === '$' ? 'USD' : 'INR') },
          metric2: { label: 'Orders Processed', value: orders.length },
          metric3: { label: 'Delivered / On-Time', value: orders.filter(o => o.arrivalStatus !== 'Late').length },
        });
      }
    } catch {
      showToast('Failed to generate report dataset', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const handleExportCSV = () => {
    if (!reportData.length) return;
    exportToCSV(reportData, `TrackGPT_${reportType}_Report`);
    showToast(`Exported ${reportData.length} report rows to CSV`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const activeDef = reportDefinitions.find((r) => r.id === reportType);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            Supply Chain Intelligence & Audit Reports
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Generate printable audit logs, inventory valuations, vendor delivery compliance, and stockout hazards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            leftIcon={Printer}
          >
            Print / Save PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={Download}
            disabled={reportData.length === 0}
          >
            Export Report CSV
          </Button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportDefinitions.map((def) => {
          const Icon = def.icon;
          const isSelected = reportType === def.id;

          return (
            <button
              key={def.id}
              onClick={() => setReportType(def.id)}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                  : 'bg-white border-surface-border hover:border-slate-300 shadow-card'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className={`text-xs font-bold ${isSelected ? 'text-brand-900' : 'text-content-primary'}`}>
                {def.title}
              </h3>
              <p className="text-[11px] text-content-secondary mt-1 line-clamp-2 leading-relaxed">
                {def.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Summary KPI Strip for Current Report */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-50/50">
          <span className="text-[11px] font-semibold text-content-secondary uppercase">
            {summaryStats.metric1?.label || 'Total'}
          </span>
          <p className="text-xl font-bold text-content-primary mt-1">
            {summaryStats.metric1?.value || '—'}
          </p>
        </Card>
        <Card className="p-4 bg-slate-50/50">
          <span className="text-[11px] font-semibold text-content-secondary uppercase">
            {summaryStats.metric2?.label || 'Volume'}
          </span>
          <p className="text-xl font-bold text-brand-600 mt-1">
            {summaryStats.metric2?.value || '—'}
          </p>
        </Card>
        <Card className="p-4 bg-slate-50/50">
          <span className="text-[11px] font-semibold text-content-secondary uppercase">
            {summaryStats.metric3?.label || 'Count'}
          </span>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {summaryStats.metric3?.value || '—'}
          </p>
        </Card>
      </div>

      {/* Report Table Preview */}
      <Card className="overflow-hidden">
        <CardHeader
          title={activeDef?.title}
          subtitle={`Audit snapshot generated at ${new Date().toLocaleTimeString()} on ${formatDate(new Date())}`}
          action={
            <Badge variant="primary">
              {reportData.length} records verified
            </Badge>
          }
        />

        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Dynamic table rendering based on active report */}
            {reportType === 'inventory-valuation' || reportType === 'low-stock-audit' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-content-secondary uppercase text-[10px] font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Current Stock</th>
                    <th className="py-3 px-4 text-right">Reorder Threshold</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Inventory Valuation</th>
                    <th className="py-3 px-4">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-content-primary">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-semibold">{row.sku}</td>
                      <td className="py-3 px-4 font-bold">{row.name}</td>
                      <td className="py-3 px-4 text-content-secondary">{row.category}</td>
                      <td className="py-3 px-4 text-right font-bold">{row.currentStock}</td>
                      <td className="py-3 px-4 text-right text-content-secondary">{row.reorderLevel}</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(row.unitCost, currencySymbol === '$' ? 'USD' : 'INR')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {formatCurrency(row.inventoryValue || row.currentStock * row.unitCost, currencySymbol === '$' ? 'USD' : 'INR')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={row.stockStatus}>{row.stockStatus}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : reportType === 'supplier-performance' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-content-secondary uppercase text-[10px] font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-3 px-4">Vendor ID</th>
                    <th className="py-3 px-4">Supplier Company</th>
                    <th className="py-3 px-4">Representative</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4 text-center">Avg Lead Time</th>
                    <th className="py-3 px-4 text-center">On-Time SLA Rate</th>
                    <th className="py-3 px-4 text-center">Order Volume</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-content-primary">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono">{row.id}</td>
                      <td className="py-3 px-4 font-bold">{row.name}</td>
                      <td className="py-3 px-4 text-content-secondary">{row.contactPerson}</td>
                      <td className="py-3 px-4 text-content-secondary">{row.city}</td>
                      <td className="py-3 px-4 text-center font-bold">{row.avgLeadTimeDays} days</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">{row.onTimeDeliveryRate}%</td>
                      <td className="py-3 px-4 text-center">{row.orderCount}</td>
                      <td className="py-3 px-4">
                        <Badge variant={row.status}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-content-secondary uppercase text-[10px] font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Company / Partner</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4 text-right">Order Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Arrival Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-content-primary">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-semibold">{row.orderNumber || row.orderId}</td>
                      <td className="py-3 px-4 text-content-secondary">{formatDate(row.orderDate || row.date)}</td>
                      <td className="py-3 px-4 font-bold">{row.companyName || row.supplierName}</td>
                      <td className="py-3 px-4 text-content-secondary max-w-xs truncate">{row.productDetails}</td>
                      <td className="py-3 px-4 text-right font-bold">
                        {formatCurrency(row.totalAmount, currencySymbol === '$' ? 'USD' : 'INR')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={row.paymentStatus === 'Completed' ? 'success' : 'warning'}>
                          {row.paymentStatus || 'Completed'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={row.arrivalStatus || 'On-Time'}>
                          {row.arrivalStatus || 'On-Time'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

