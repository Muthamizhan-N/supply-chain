import React, { useEffect, useState } from 'react';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Archive,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { SalesTrendChart } from '../components/dashboard/SalesTrendChart';
import { DemandOverviewChart } from '../components/dashboard/DemandOverviewChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { StockBreakdownChart } from '../components/dashboard/StockBreakdownChart';
import { AIInsightCard } from '../components/dashboard/AIInsightCard';
import { CriticalAlertsList } from '../components/dashboard/CriticalAlertsList';
import { RecentOrdersList } from '../components/dashboard/RecentOrdersList';
import { CustomerPartnersList } from '../components/dashboard/CustomerPartnersList';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { dashboardService, forecastService } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const Dashboard = () => {
  const { currencySymbol, openAiAnalysis } = useApp();
  const [data, setData] = useState(null);
  const [forecastTrend, setForecastTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summary, forecastRes] = await Promise.all([
        dashboardService.getSummary(),
        forecastService.getForecast(),
      ]);
      setData(summary);
      setForecastTrend(forecastRes.timeSeries);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            Supply Chain Command Center
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Real-time warehouse metrics, automated inventory risk telemetry, and demand predictions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadDashboardData}
            leftIcon={RefreshCw}
            isLoading={loading}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openAiAnalysis()}
            leftIcon={Sparkles}
          >
            Run AI Diagnostic
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Products"
              value={formatNumber(kpis.totalProducts)}
              icon={Package}
              trend={8.4}
              trendLabel="active catalog"
              linkTo="/inventory"
              iconColor="text-brand-600 bg-brand-50 border-brand-100"
            />
            <KPICard
              title="Inventory Value"
              value={formatCurrency(kpis.totalInventoryValue, currencySymbol === '$' ? 'USD' : 'INR')}
              icon={DollarSign}
              trend={12.1}
              trendLabel="vs last month"
              linkTo="/inventory"
              iconColor="text-emerald-600 bg-emerald-50 border-emerald-100"
            />
            <KPICard
              title="Sales Revenue"
              value={formatCurrency(kpis.totalSalesRevenue, currencySymbol === '$' ? 'USD' : 'INR')}
              icon={TrendingUp}
              trend={kpis.monthlyRevenueGrowth}
              trendLabel="growth rate"
              linkTo="/sales"
              iconColor="text-blue-600 bg-blue-50 border-blue-100"
            />
            <KPICard
              title="Low-Stock Items"
              value={kpis.lowStockItems}
              icon={AlertTriangle}
              trend={-2}
              isPositiveGood={false}
              badgeText="Action Needed"
              linkTo="/alerts"
              iconColor="text-rose-600 bg-rose-50 border-rose-100"
            />
            <KPICard
              title="Overstocked"
              value={kpis.overstockedItems}
              icon={Archive}
              trend={1}
              isPositiveGood={false}
              linkTo="/inventory?stockStatus=High Stock"
              iconColor="text-amber-600 bg-amber-50 border-amber-100"
            />
            <KPICard
              title="Pending POs"
              value={kpis.pendingPurchaseOrders}
              icon={FileSpreadsheet}
              trend={4}
              linkTo="/purchase-orders"
              iconColor="text-purple-600 bg-purple-50 border-purple-100"
            />
          </>
        )}
      </div>

      {/* AI Intelligence Spotlight */}
      <AIInsightCard />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTrendChart data={data?.salesTrend || []} />
        <DemandOverviewChart data={forecastTrend} />
      </div>

      {/* Distribution & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CategoryDonutChart data={data?.categoryDistribution || []} />
        </div>
        <div className="lg:col-span-1">
          <StockBreakdownChart data={data?.stockStatusBreakdown || []} />
        </div>
        <div className="lg:col-span-1">
          <CriticalAlertsList alerts={data?.criticalAlerts || []} />
        </div>
      </div>

      {/* Recent Orders & Institutional Client Partners */}
      <RecentOrdersList orders={data?.recentOrders || []} />

      <CustomerPartnersList />
    </div>
  );
};

