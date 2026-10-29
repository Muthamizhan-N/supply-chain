import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../common/Card';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const SalesTrendChart = ({ data = [] }) => {
  const { currencySymbol } = useApp();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-surface-border shadow-dropdown text-xs">
          <p className="font-bold text-content-primary mb-1">{label} 2026</p>
          <div className="space-y-1">
            <p className="text-brand-600 font-semibold">
              Revenue: {currencySymbol}{formatNumber(payload[0].value)}
            </p>
            {payload[1] && (
              <p className="text-slate-500">
                Units Sold: {formatNumber(payload[1].value)} units
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader
        title="Monthly Sales & Revenue Trend"
        subtitle="Historical revenue performance and product shipment volumes"
      />
      <CardBody>
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
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
                tickFormatter={(val) => `${currencySymbol}${(val / 100000).toFixed(0)}L`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

