import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const CriticalAlertsList = ({ alerts = [] }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Immediate Stock Alerts"
        subtitle="Catalog items requiring urgent inventory replenishment"
        action={
          <Link
            to="/alerts"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All alerts <ArrowRight className="w-3 h-3" />
          </Link>
        }
      />
      <CardBody className="flex-1 divide-y divide-surface-border -my-2">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-content-secondary">
            No critical stock alerts at this time.
          </div>
        ) : (
          alerts.slice(0, 4).map((alert) => (
            <div key={alert.id} className="py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-red-50 text-red-600 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-content-primary">
                    {alert.productName}
                  </h4>
                  <p className="text-[11px] text-content-secondary mt-0.5">
                    SKU: <span className="font-mono text-slate-700">{alert.sku}</span> • Available: <strong className="text-red-600">{alert.currentQuantity}</strong> (Threshold: {alert.reorderThreshold})
                  </p>
                </div>
              </div>
              <Badge variant={alert.severity === 'Critical' ? 'danger' : 'warning'}>
                {alert.alertType}
              </Badge>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
};

