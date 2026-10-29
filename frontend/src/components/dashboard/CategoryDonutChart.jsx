import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../common/Card';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const CategoryDonutChart = ({ data = [] }) => {
  const { currencySymbol } = useApp();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl border border-surface-border shadow-dropdown text-xs">
          <p className="font-bold text-content-primary mb-1">{item.name}</p>
          <p className="text-brand-600 font-semibold">
            Share: {item.value}% ({formatNumber(item.count)} units)
          </p>
          <p className="text-slate-500">
            Valuation: {currencySymbol}{formatNumber(item.amount)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Inventory by Category"
        subtitle="Distribution of stock value across product lines"
      />
      <CardBody className="flex-1 flex flex-col justify-between">
        <div className="h-48 sm:h-52 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || '#2563EB'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-content-secondary font-medium">Categories</span>
            <span className="text-lg font-bold text-content-primary">{data.length}</span>
          </div>
        </div>

        {/* Legend list */}
        <div className="mt-4 space-y-2 border-t border-surface-border pt-3">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-content-secondary truncate max-w-[130px] sm:max-w-[160px]">
                  {item.name}
                </span>
              </div>
              <span className="font-semibold text-content-primary">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

