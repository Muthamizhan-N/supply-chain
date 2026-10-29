import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const StockBreakdownChart = ({ data = [] }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Stock Health Breakdown"
        subtitle="Current status categorization of warehouse catalog"
      />
      <CardBody className="flex-1 flex flex-col justify-between">
        {/* Visual segmented bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 shadow-inner mb-6">
          {data.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              title={`${item.status}: ${item.percentage}%`}
              className="h-full transition-all hover:opacity-85"
            />
          ))}
        </div>

        {/* Detailed breakdown list */}
        <div className="space-y-3.5">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-content-primary">{item.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-content-secondary">{item.count} SKUs</span>
                <span className="font-bold text-content-primary w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-surface-border text-xs text-content-secondary flex items-center justify-between">
          <span>Safe Buffer Target: <strong>&gt;85% Healthy</strong></span>
          <Badge variant="success">Compliant</Badge>
        </div>
      </CardBody>
    </Card>
  );
};

