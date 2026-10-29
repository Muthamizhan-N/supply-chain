import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ErrorState } from '../components/common/ErrorState';
import { forecastService, productService } from '../services/api';
import { useApp } from '../context/AppContext';
import { formatNumber } from '../utils/formatters';

export const DemandForecast = () => {
  const { showToast, openAiAnalysis } = useApp();

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('PRD-001');
  const [horizon, setHorizon] = useState('30d'); // '7d' | '30d' | '90d'
  const [historicalPeriod, setHistoricalPeriod] = useState('8w');

  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Load products list for the selector
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prods = await productService.getAll();
        setProducts(prods);
      } catch {
        // fallback
      }
    };
    loadProducts();
  }, []);

  const loadForecast = async (isManualRun = false) => {
    try {
      if (isManualRun) setGenerating(true);
      else setLoading(true);
      setError(null);

      const res = await forecastService.getForecast(selectedProductId, horizon);
      setForecast(res);
      if (isManualRun) {
        showToast('AI Demand Forecast generated successfully with confidence bounds', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with the forecasting service');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [selectedProductId, horizon]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || {
    name: 'Processor X Octa-Core',
    sku: 'CPU-101',
    currentStock: 120,
    reorderLevel: 60,
  };

  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isForecastPoint = dataPoint.isForecast;

      return (
        <div className="bg-white p-3.5 rounded-xl border border-surface-border shadow-dropdown text-xs max-w-xs">
          <div className="flex items-center justify-between gap-2 border-b border-surface-border pb-1.5 mb-2">
            <span className="font-bold text-content-primary">{label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isForecastPoint ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isForecastPoint ? 'Forecast Period' : 'Actual Historical'}
            </span>
          </div>

          <div className="space-y-1">
            {dataPoint.actualDemand !== null && (
              <p className="text-slate-900 font-semibold">
                Actual Demand: {formatNumber(dataPoint.actualDemand)} units
              </p>
            )}
            {dataPoint.predictedDemand !== null && (
              <p className="text-brand-600 font-bold">
                Predicted Demand: {formatNumber(dataPoint.predictedDemand)} units
              </p>
            )}
            {isForecastPoint && dataPoint.lowerBound !== null && (
              <p className="text-[11px] text-slate-500">
                Confidence Band: {dataPoint.lowerBound} – {dataPoint.upperBound} units (95% CI)
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight flex items-center gap-2.5">
            AI Demand Forecasting
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              ML Engine Active
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Predictive demand horizon modeling, stockout probability estimation, and autonomous order batch suggestions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => loadForecast(true)}
            isLoading={generating}
            leftIcon={Sparkles}
          >
            Generate New Forecast
          </Button>
        </div>
      </div>

      {/* Control Panel Card */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Product selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
              Target Product SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-surface-border bg-white text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Forecast horizon */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setHorizon('7d')}
                className={`py-1.5 rounded-md text-center transition-all ${
                  horizon === '7d' ? 'bg-white font-bold text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setHorizon('30d')}
                className={`py-1.5 rounded-md text-center transition-all ${
                  horizon === '30d' ? 'bg-white font-bold text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setHorizon('90d')}
                className={`py-1.5 rounded-md text-center transition-all ${
                  horizon === '90d' ? 'bg-white font-bold text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>

          {/* Historical training period */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
              Historical Training Basis
            </label>
            <select
              value={historicalPeriod}
              onChange={(e) => setHistoricalPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-surface-border bg-white text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="4w">Last 4 Weeks</option>
              <option value="8w">Last 8 Weeks (Optimal)</option>
              <option value="26w">Last 6 Months</option>
              <option value="52w">Last 12 Months (Full Seasonality)</option>
            </select>
          </div>

          {/* Run Action */}
          <div>
            <Button
              variant="navy"
              size="md"
              className="w-full text-xs"
              onClick={() => loadForecast(true)}
              isLoading={generating}
              leftIcon={BrainCircuit}
            >
              Run Model Inference
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <ErrorState
          title="ML Forecast Engine Unreachable"
          message={error}
          onRetry={() => loadForecast(false)}
        />
      ) : (
        <>
          {/* Model Specification Card & Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-content-secondary uppercase">
                Active Architecture
              </span>
              <p className="text-sm font-bold text-content-primary mt-1 truncate">
                {forecast?.modelName || 'SARIMAX + XGBoost'}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Trained on multi-variate sales</span>
            </Card>

            <Card className="p-4 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-content-secondary uppercase">
                Model Confidence
              </span>
              <p className="text-sm font-bold text-emerald-600 mt-1">
                {forecast?.confidenceScore || 92.4}%
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">95% statistical confidence interval</span>
            </Card>

            <Card className="p-4 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-content-secondary uppercase">
                Mean Absolute Error (MAE)
              </span>
              <p className="text-sm font-bold text-content-primary mt-1">
                {forecast?.meanAbsoluteError || '4.8 units'}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Low deviation across iterations</span>
            </Card>

            <Card className="p-4 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-content-secondary uppercase">
                Last Calibration
              </span>
              <p className="text-sm font-bold text-content-primary mt-1">
                {forecast?.lastTrained || 'Today 04:00 UTC'}
              </p>
              <span className="text-[10px] text-brand-600 font-medium mt-0.5 block">Continuous automated tuning</span>
            </Card>
          </div>

          {/* Primary Visualization Chart */}
          <Card>
            <CardHeader
              title={`Demand Forecast Curve: ${selectedProduct.name} (${selectedProduct.sku})`}
              subtitle="Historical Actuals (solid dark) vs AI Projections with upper/lower confidence bounds (dashed blue)"
              action={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-content-secondary hidden sm:inline">Forecast Boundary:</span>
                  <Badge variant="info">W8 Boundary</Badge>
                </div>
              }
            />
            <CardBody>
              <div className="h-80 sm:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={forecast?.timeSeries || []}
                    margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomForecastTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />

                    {/* Reference Boundary line */}
                    <ReferenceLine
                      x="W8 (Oct 20)"
                      stroke="#DC2626"
                      strokeDasharray="3 3"
                      label={{ value: 'Forecast Horizon Starts', fill: '#DC2626', fontSize: 10, position: 'top' }}
                    />

                    {/* Confidence band area */}
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      name="Confidence Range (Upper)"
                      stroke="transparent"
                      fill="#93C5FD"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      name="Confidence Range (Lower)"
                      stroke="transparent"
                      fill="#EFF6FF"
                      fillOpacity={0.4}
                    />

                    {/* Actual historical line */}
                    <Line
                      type="monotone"
                      dataKey="actualDemand"
                      name="Historical Actual Demand"
                      stroke="#0F172A"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0F172A' }}
                      activeDot={{ r: 6 }}
                    />

                    {/* Forecasted predicted line */}
                    <Line
                      type="monotone"
                      dataKey="predictedDemand"
                      name="Predicted Demand"
                      stroke="#2563EB"
                      strokeWidth={3}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#2563EB' }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-content-secondary">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>
                    Forecast reflects verified trend patterns; boundary separated at current week.
                  </span>
                </div>
                <button
                  onClick={() => openAiAnalysis({
                    productId: selectedProduct.id,
                    productDetails: `${selectedProduct.name} (${selectedProduct.sku})`,
                  })}
                  className="text-brand-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze Delivery Risk for this SKU
                </button>
              </div>
            </CardBody>
          </Card>

          {/* AI Recommended Inventory Actions & Insights */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-content-primary">
              AI-Generated Forecast Insights & Action Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(forecast?.insights || []).map((insight) => (
                <Card key={insight.id} className="p-5 border-slate-200 hover:border-brand-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-content-primary text-sm">
                          {insight.productName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {insight.sku}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold ${
                            insight.trendDirection === 'up' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {insight.trendDirection === 'up' ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {insight.demandTrend}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-content-secondary font-medium">
                          {insight.riskAssessment}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 whitespace-nowrap">
                      Reorder: {insight.suggestedReorderQuantity} units
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-content-primary leading-relaxed bg-slate-50 p-3 rounded-lg border border-surface-border">
                    {insight.recommendation}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Model Basis: {insight.confidenceScore}</span>
                    <button
                      onClick={() => openAiAnalysis({
                        productDetails: `${insight.productName} (${insight.sku})`,
                      })}
                      className="text-brand-600 font-semibold hover:underline"
                    >
                      Audit Risk Vector
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

