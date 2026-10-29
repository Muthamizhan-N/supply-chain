import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { salesService } from '../services/api';
import { mockCategories } from '../data/mockData';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';
import { useApp } from '../context/AppContext';

export const SalesAnalytics = () => {
  const { currencySymbol, showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [timeRange, setTimeRange] = useState('year'); // 'month' | 'quarter' | 'year'
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await salesService.getAnalytics({ timeRange, category: categoryFilter });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to retrieve sales analytics metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [timeRange, categoryFilter]);

  const handleExport = () => {
    if (!data?.monthlyTrends) return;
    const cols = [
      { key: 'month', label: 'Month' },
      { key: 'revenue', label: 'Revenue' },
      { key: 'unitsSold', label: 'Units Sold' },
      { key: 'orders', label: 'Total Orders' },
      { key: 'profit', label: 'Estimated Gross Profit' },
    ];
    exportToCSV(data.monthlyTrends, 'TrackGPT_Sales_Performance', cols);
    showToast('Exported sales trend reports to CSV', 'success');
  };

  const summary = data?.summary || {};
  const monthlyTrends = data?.monthlyTrends || [];
  const categoryPerformance = data?.categoryPerformance || [];
  const bestSellers = data?.bestSellers || [];
  const slowMoving = data?.slowMoving || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            Sales & Revenue Business Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Historical revenue trajectories, product sales volume velocity, and category contributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Pills */}
          <div className="bg-white p-1 rounded-xl border border-surface-border flex items-center gap-1 shadow-xs text-xs font-medium">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'month'
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Past 30 Days
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'quarter'
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Past Quarter
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'year'
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Year-to-Date
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            leftIcon={Download}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchSalesData} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                  Total Sales Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-content-primary">
                {formatCurrency(summary.totalRevenue, currencySymbol === '$' ? 'USD' : 'INR')}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+16.4% vs previous cycle</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                  Units Dispatched
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-content-primary">
                {formatNumber(summary.unitsSold)}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+9.8% volume growth</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                  Average Order Value (AOV)
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-content-primary">
                {formatCurrency(summary.averageOrderValue, currencySymbol === '$' ? 'USD' : 'INR')}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+5.2% basket expansion</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                  Gross Profit Margin
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-content-primary">
                {summary.grossMargin}%
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-content-secondary font-medium">
                <span>Healthy retail benchmark</span>
              </div>
            </Card>
          </div>

          {/* Revenue & Units Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader
                  title="Revenue & Unit Sales Over Time"
                  subtitle="Monthly breakdown of top-line commercial turnover"
                />
                <CardBody>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="salesBiGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'revenue' ? formatCurrency(value, currencySymbol === '$' ? 'USD' : 'INR') : `${value} units`,
                            name === 'revenue' ? 'Gross Revenue' : 'Units Sold',
                          ]}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="revenue" name="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#salesBiGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader
                  title="Sales Volume by Units"
                  subtitle="Units delivered across months"
                />
                <CardBody>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip
                          formatter={(value) => [`${value} units`, 'Units Sold']}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Bar dataKey="unitsSold" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Product Performance Tables: Best Sellers vs Slow Moving */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader
                title="Top-Selling High-Velocity Products"
                subtitle="SKUs generating maximum turnover and consistent order throughput"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-content-secondary uppercase text-[10px] border-b border-surface-border">
                    <tr>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4 text-right">Selling Price</th>
                      <th className="py-3 px-4 text-right">Current Stock</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border text-content-primary">
                    {bestSellers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold">{p.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{p.sku}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(p.sellingPrice, currencySymbol === '$' ? 'USD' : 'INR')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">{p.currentStock}</td>
                        <td className="py-3 px-4">
                          <Badge variant={p.stockStatus}>{p.stockStatus}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Slow-Moving & Excess Inventory Items"
                subtitle="Products with prolonged holding days and sub-optimal velocity"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-content-secondary uppercase text-[10px] border-b border-surface-border">
                    <tr>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4 text-right">Tied Capital</th>
                      <th className="py-3 px-4 text-right">Stock</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border text-content-primary">
                    {slowMoving.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold">{p.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{p.sku}</td>
                        <td className="py-3 px-4 text-right font-semibold text-amber-700">
                          {formatCurrency(p.inventoryValue, currencySymbol === '$' ? 'USD' : 'INR')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-700">{p.currentStock}</td>
                        <td className="py-3 px-4">
                          <Badge variant="warning">Evaluate Promotion</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

