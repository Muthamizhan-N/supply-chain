import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Eye } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const RecentOrdersList = ({ orders = [] }) => {
  const { currencySymbol, openAiAnalysis } = useApp();

  return (
    <Card className="h-full">
      <CardHeader
        title="Recent Supply Orders & Deliveries"
        subtitle="Tracking vendor shipments, inbound logistics, and fulfillment status"
        action={
          <Link
            to="/purchase-orders"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Manage orders <ArrowRight className="w-3 h-3" />
          </Link>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-content-secondary uppercase font-semibold text-[10px] tracking-wider border-b border-surface-border">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Company Name</th>
              <th className="py-3 px-4">Product Details</th>
              <th className="py-3 px-4">Procured Amount</th>
              <th className="py-3 px-4">Arrival Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border text-content-primary">
            {orders.slice(0, 5).map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                  {formatDate(order.orderDate)}
                </td>
                <td className="py-3 px-4 font-semibold text-content-primary">
                  {order.companyName || order.supplierName}
                </td>
                <td className="py-3 px-4 text-content-secondary max-w-xs truncate">
                  {order.productDetails || 'Catalog Supply Batch'}
                </td>
                <td className="py-3 px-4 font-semibold text-content-primary whitespace-nowrap">
                  {formatCurrency(order.totalAmount, currencySymbol === '$' ? 'USD' : 'INR')}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={order.arrivalStatus || order.orderStatus}>
                    {order.arrivalStatus || order.orderStatus}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => openAiAnalysis({
                      orderId: order.orderNumber,
                      companyName: order.companyName || order.supplierName,
                      productDetails: order.productDetails,
                    })}
                    title="Run AI Risk Analysis on this order"
                    className="p-1 text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

