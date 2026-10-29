import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../common/Card';
import { formatNumber } from '../../utils/formatters';

export const DemandOverviewChart = ({ data = [] }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-surface-border shadow-dropdown text-xs">
          <p className="font-bold text-content-primary mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, idx) => (
              <p key={idx} style={{ color: entry.color }} className="font-medium">
                {entry.name}: {formatNumber(entry.value)} units
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader
        title="Product Demand & Forecast Trajectory"
        subtitle="Actual demand vs machine-learning predictive curve"
      />
      <CardBody>
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="actualDemand"
                name="Actual Demand"
                stroke="#0F172A"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0F172A' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="predictedDemand"
                name="AI Predicted Demand"
                stroke="#2563EB"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#2563EB' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

