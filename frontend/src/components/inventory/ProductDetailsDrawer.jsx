import React from 'react';
import {
  Package,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ProductDetailsDrawer = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onAdjustStock,
}) => {
  const { currencySymbol, openAiAnalysis } = useApp();

  if (!product) return null;

  // Realistic mock history for this product
  const movementHistory = [
    { date: '21 Oct 2026', type: 'Dispatched', qty: '-40', balance: product.currentStock, ref: 'ORD-1024' },
    { date: '18 Oct 2026', type: 'Inbound Restock', qty: '+100', balance: product.currentStock + 40, ref: 'PO-2026-081' },
    { date: '14 Oct 2026', type: 'Dispatched', qty: '-25', balance: product.currentStock - 60, ref: 'ORD-1011' },
    { date: '05 Oct 2026', type: 'Audit Adjustment', qty: '+5', balance: product.currentStock - 35, ref: 'AUD-882' },
  ];

  // Mini sales trend chart for product drawer
  const miniTrend = [
    { period: 'Jun', sales: 45 },
    { period: 'Jul', sales: 62 },
    { period: 'Aug', sales: 88 },
    { period: 'Sep', sales: 115 },
    { period: 'Oct', sales: 94 },
    { period: 'Nov*', sales: 130 },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`SKU: ${product.sku} • Category: ${product.category}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              openAiAnalysis({
                companyName: product.supplierName,
                productDetails: `${product.name} (${product.sku})`,
              });
            }}
            leftIcon={Sparkles}
          >
            AI Risk Assessment
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onAdjustStock(product);
              }}
            >
              Update Stock
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
            >
              Edit Product
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Status & Valuation Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-surface-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-content-secondary uppercase font-semibold">Stock Status</span>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={product.stockStatus}>{product.stockStatus}</Badge>
              <span className="text-xs text-content-secondary">
                Last updated {product.lastUpdated || 'recently'}
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs text-content-secondary uppercase font-semibold">Total Stock Valuation</span>
            <p className="text-base font-bold text-content-primary">
              {formatCurrency(product.inventoryValue || product.currentStock * product.unitCost, currencySymbol === '$' ? 'USD' : 'INR')}
            </p>
          </div>
        </div>

        {/* Stock Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white border border-surface-border">
            <span className="text-[11px] text-content-secondary uppercase font-semibold">Current Stock</span>
            <p className="text-xl font-bold text-content-primary mt-1">{product.currentStock}</p>
            <span className="text-[10px] text-slate-400">Total units on-hand</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-surface-border">
            <span className="text-[11px] text-content-secondary uppercase font-semibold">Reserved Stock</span>
            <p className="text-xl font-bold text-content-primary mt-1">{product.reservedStock || 0}</p>
            <span className="text-[10px] text-amber-600 font-medium">Pending order allocation</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-surface-border">
            <span className="text-[11px] text-content-secondary uppercase font-semibold">Available Stock</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">{product.availableStock || product.currentStock}</p>
            <span className="text-[10px] text-slate-400">Ready for dispatch</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-surface-border">
            <span className="text-[11px] text-content-secondary uppercase font-semibold">Reorder Level</span>
            <p className="text-xl font-bold text-brand-600 mt-1">{product.reorderLevel}</p>
            <span className="text-[10px] text-slate-400">Min safe threshold</span>
          </div>
        </div>

        {/* Financial & Supplier Data */}
        <div className="p-4 rounded-xl bg-white border border-surface-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
            Financial & Procurement Attributes
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-content-secondary">Unit Procurement Cost:</span>
              <p className="font-semibold text-content-primary mt-0.5">
                {formatCurrency(product.unitCost, currencySymbol === '$' ? 'USD' : 'INR')}
              </p>
            </div>
            <div>
              <span className="text-content-secondary">Suggested Selling Price:</span>
              <p className="font-semibold text-content-primary mt-0.5">
                {formatCurrency(product.sellingPrice, currencySymbol === '$' ? 'USD' : 'INR')}
              </p>
            </div>
            <div>
              <span className="text-content-secondary">Gross Margin:</span>
              <p className="font-semibold text-emerald-600 mt-0.5">
                {product.sellingPrice ? Math.round(((product.sellingPrice - product.unitCost) / product.sellingPrice) * 100) : 25}%
              </p>
            </div>
            <div>
              <span className="text-content-secondary">Supplier Name:</span>
              <p className="font-semibold text-content-primary mt-0.5">{product.supplierName}</p>
            </div>
            <div>
              <span className="text-content-secondary">Average Lead Time:</span>
              <p className="font-semibold text-content-primary mt-0.5">{product.leadTimeDays || 5} days</p>
            </div>
            <div>
              <span className="text-content-secondary">Next Incoming Shipment:</span>
              <p className="font-semibold text-brand-600 mt-0.5">{product.expectedArrival || 'None scheduled'}</p>
            </div>
          </div>
        </div>

        {/* Demand & Sales Forecast Preview */}
        <div className="p-4 rounded-xl bg-white border border-surface-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                Demand Trajectory & Forecast Preview
              </h4>
              <p className="text-[11px] text-content-secondary mt-0.5">Past 5 months historical + 1 month projection (*)</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 rounded-md">
              AI Projected: +38%
            </span>
          </div>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniTrend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} units`, 'Demand']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2} fill="url(#prodGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Movement Audit Log */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2.5">
            Recent Stock Movement History
          </h4>
          <div className="border border-surface-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-content-secondary uppercase text-[10px] border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Movement Type</th>
                  <th className="py-2.5 px-3">Qty Delta</th>
                  <th className="py-2.5 px-3">Balance</th>
                  <th className="py-2.5 px-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-content-primary">
                {movementHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-content-secondary whitespace-nowrap">{row.date}</td>
                    <td className="py-2.5 px-3 font-medium">{row.type}</td>
                    <td className={`py-2.5 px-3 font-semibold ${row.qty.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.qty}
                    </td>
                    <td className="py-2.5 px-3 font-mono">{row.balance}</td>
                    <td className="py-2.5 px-3 text-content-secondary font-mono text-[11px]">{row.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

