import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  ChevronRight,
  Eye,
  Edit2,
  FileText,
  Printer,
  Sparkles,
  ArrowUpDown,
  DollarSign,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { purchaseOrderService, supplierService, productService } from '../services/api';
import { mockSuppliers, mockProducts } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';
import { useApp } from '../context/AppContext';

export const PurchaseOrders = () => {
  const { currencySymbol, showToast, openAiAnalysis } = useApp();

  const [activeTab, setActiveTab] = useState('inbound'); // 'inbound' (Suppliers) | 'outbound' (Customer Deliveries)
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create PO Modal (elevates Supply Input)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [poForm, setPoForm] = useState({
    supplierName: 'AMD Pvt Ltd',
    productName: 'Processor X Octa-Core',
    amount: '55000',
    date: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '2026-10-30',
    paymentStatus: 'Pending',
    paymentMethod: 'Net Banking',
    senderBank: 'Indian Bank',
    transactionId: 'tx' + Math.random().toString(36).substring(2, 8),
  });
  const [actionLoading, setActionLoading] = useState(false);

  // View Details Modal (elevates Supply Details & Delivery Details)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);

  // Update Status Modal (elevates Edit Status)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedItemForStatus, setSelectedItemForStatus] = useState(null);
  const [newArrivalStatus, setNewArrivalStatus] = useState('On-Time');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pos, dels] = await Promise.all([
        purchaseOrderService.getAll(),
        purchaseOrderService.getCustomerDeliveries(),
      ]);
      setOrders(pos);
      setDeliveries(dels);
    } catch (err) {
      setError(err.message || 'Failed to fetch purchase orders and deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentDataset = activeTab === 'inbound' ? orders : deliveries;

  const filteredData = useMemo(() => {
    return currentDataset.filter((item) => {
      const targetName = item.companyName || item.supplierName || item.customerName || '';
      const orderRef = item.orderNumber || item.orderId || '';
      const details = item.productDetails || '';

      const matchesSearch =
        search === '' ||
        targetName.toLowerCase().includes(search.toLowerCase()) ||
        orderRef.toLowerCase().includes(search.toLowerCase()) ||
        details.toLowerCase().includes(search.toLowerCase());

      const statusVal = item.arrivalStatus || item.orderStatus;
      const matchesStatus = statusFilter === 'All' || statusVal === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [currentDataset, search, statusFilter]);

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const created = await purchaseOrderService.create({
        supplierName: poForm.supplierName,
        companyName: poForm.supplierName,
        productDetails: poForm.productName,
        totalAmount: Number(poForm.amount),
        orderDate: poForm.date,
        expectedDeliveryDate: poForm.expectedDeliveryDate,
        paymentStatus: poForm.paymentStatus,
        paymentMethod: poForm.paymentMethod,
        senderBank: poForm.senderBank,
        transactionId: poForm.transactionId,
        orderStatus: 'Ordered',
        arrivalStatus: 'On-Time',
      });
      setOrders((prev) => [created, ...prev]);
      showToast(`Purchase order ${created.orderNumber} created successfully`, 'success');
      setCreateModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to create order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemForStatus) return;
    try {
      setActionLoading(true);
      if (activeTab === 'inbound') {
        const updated = await purchaseOrderService.updateStatus(selectedItemForStatus.id, {
          arrivalStatus: newArrivalStatus,
        });
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      } else {
        // update local delivery item
        setDeliveries((prev) =>
          prev.map((d) =>
            d.id === selectedItemForStatus.id ? { ...d, arrivalStatus: newArrivalStatus } : d
          )
        );
      }
      showToast(`Status updated to "${newArrivalStatus}"`, 'success');
      setStatusModalOpen(false);
      setSelectedItemForStatus(null);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    const filename = activeTab === 'inbound' ? 'TrackGPT_Recent_Supplies' : 'TrackGPT_Delivery_List';
    const cols =
      activeTab === 'inbound'
        ? [
            { key: 'orderDate', label: 'Date' },
            { key: 'companyName', label: 'Company Name' },
            { key: 'productDetails', label: 'Product Name' },
            { key: 'totalAmount', label: 'Procured Amount' },
            { key: 'arrivalStatus', label: 'Arrival Status' },
          ]
        : [
            { key: 'date', label: 'Date' },
            { key: 'customerName', label: 'Company Name' },
            { key: 'productDetails', label: 'Product Details' },
            { key: 'totalAmount', label: 'Total Amount' },
            { key: 'arrivalStatus', label: 'Arrival Status' },
          ];
    exportToCSV(filteredData, filename, cols);
    showToast(`Exported ${filteredData.length} records to CSV`, 'success');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            Purchase Orders & Delivery Fulfillment
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            End-to-end procurement logistics, vendor transit tracking, and institutional deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={Download}
            disabled={filteredData.length === 0}
            className="font-semibold"
          >
            Export as CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={Plus}
          >
            Create Supply Order
          </Button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-surface-border">
        <button
          onClick={() => {
            setActiveTab('inbound');
            setStatusFilter('All');
          }}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'inbound'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          Inbound Supplier Orders ({orders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('outbound');
            setStatusFilter('All');
          }}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'outbound'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          Outbound Customer Delivery List ({deliveries.length})
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, order ID, or product..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-border text-xs text-content-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <span className="text-xs text-content-secondary">Arrival Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-surface-border bg-white text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="On-Time">On-Time</option>
              <option value="Delivered">Delivered</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : loading ? (
        <Card className="p-6">
          <TableSkeleton rows={7} cols={6} />
        </Card>
      ) : filteredData.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="No orders found"
            description="No procurement orders match your current filters."
            actionLabel="Reset Search"
            onAction={() => {
              setSearch('');
              setStatusFilter('All');
            }}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-content-secondary uppercase font-semibold text-[10px] tracking-wider border-b border-surface-border">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Company Name</th>
                  <th className="py-3.5 px-4">
                    {activeTab === 'inbound' ? 'Product Name' : 'Product Details'}
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    {activeTab === 'inbound' ? 'Procured Amount' : 'Total Amount'}
                  </th>
                  <th className="py-3.5 px-4">Arrival Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-content-primary">
                {filteredData.map((item) => {
                  const company = item.companyName || item.supplierName || item.customerName;
                  const dateStr = item.orderDate || item.date;
                  const status = item.arrivalStatus || item.orderStatus;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-content-secondary whitespace-nowrap">
                        {formatDate(dateStr)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-content-primary">
                        {company}
                      </td>
                      <td className="py-3.5 px-4 text-content-secondary max-w-xs truncate">
                        {item.productDetails}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-content-primary whitespace-nowrap">
                        {formatCurrency(item.totalAmount, currencySymbol === '$' ? 'USD' : 'INR')}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={status}>{status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedItemForDetails(item);
                              setDetailsModalOpen(true);
                            }}
                            title="View Full Supply Details"
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItemForStatus(item);
                              setNewArrivalStatus(item.arrivalStatus || 'On-Time');
                              setStatusModalOpen(true);
                            }}
                            title="Update Status"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAiAnalysis({
                              orderId: item.orderNumber || item.orderId,
                              companyName: company,
                              productDetails: item.productDetails,
                            })}
                            title="Run AI Risk Analysis"
                            className="p-1.5 text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Purchase Order Modal (Supply Input) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Supply Input"
        subtitle="Submit vendor procurement details to TrackGPT inventory ledger"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          <Input
            label="Product Name"
            required
            placeholder="e.g. Ryzen 7 7730U or 250PC + Accessories"
            value={poForm.productName}
            onChange={(e) => setPoForm({ ...poForm, productName: e.target.value })}
          />

          <Select
            label="Company Name"
            options={mockSuppliers.map((s) => s.name)}
            value={poForm.supplierName}
            onChange={(e) => setPoForm({ ...poForm, supplierName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Amount (${currencySymbol})`}
              type="number"
              required
              placeholder="55000"
              value={poForm.amount}
              onChange={(e) => setPoForm({ ...poForm, amount: e.target.value })}
            />

            <Input
              label="Date"
              type="date"
              required
              value={poForm.date}
              onChange={(e) => setPoForm({ ...poForm, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              options={['Net Banking', 'RTGS', 'NEFT', 'UPI', 'Cheque']}
              value={poForm.paymentMethod}
              onChange={(e) => setPoForm({ ...poForm, paymentMethod: e.target.value })}
            />

            <Select
              label="Sender Bank"
              options={['Indian Bank', 'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Canara Bank']}
              value={poForm.senderBank}
              onChange={(e) => setPoForm({ ...poForm, senderBank: e.target.value })}
            />
          </div>

          <Input
            label="Transaction ID"
            value={poForm.transactionId}
            onChange={(e) => setPoForm({ ...poForm, transactionId: e.target.value })}
          />

          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCreateModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={actionLoading}
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Supply Details / Delivery Details Modal (Direct visual alignment with reference screenshots) */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="max-w-lg"
      >
        {selectedItemForDetails && (
          <div className="space-y-6">
            <div className="text-center pb-3 border-b border-surface-border">
              <h3 className="text-lg font-bold text-content-primary">
                {activeTab === 'inbound' ? 'Supply Details' : 'Delivery Details'}
              </h3>
              <p className="text-xs text-content-secondary mt-0.5">
                {formatDate(selectedItemForDetails.orderDate || selectedItemForDetails.date)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-content-secondary block">Status</span>
                <span className="font-semibold text-content-primary mt-1 inline-block">
                  <Badge variant={selectedItemForDetails.arrivalStatus || 'On-Time'}>
                    {selectedItemForDetails.arrivalStatus || 'On-Time'}
                  </Badge>
                </span>
              </div>

              <div>
                <span className="text-content-secondary block">Transaction ID</span>
                <span className="font-mono text-content-primary font-semibold mt-1 inline-block">
                  {selectedItemForDetails.transactionId || 'a12hgx..xd'}
                </span>
              </div>

              <div>
                <span className="text-content-secondary block">Company Name</span>
                <span className="font-semibold text-content-primary mt-1 inline-block text-sm">
                  {selectedItemForDetails.companyName || selectedItemForDetails.supplierName || selectedItemForDetails.customerName}
                </span>
              </div>

              <div>
                <span className="text-content-secondary block">Payment Method</span>
                <span className="font-semibold text-content-primary mt-1 inline-block">
                  {selectedItemForDetails.paymentMethod || 'Net Banking'}
                </span>
              </div>

              <div>
                <span className="text-content-secondary block">Product Name / Details</span>
                <span className="font-semibold text-content-primary mt-1 inline-block">
                  {selectedItemForDetails.productDetails}
                </span>
              </div>

              <div>
                <span className="text-content-secondary block">Sender Bank</span>
                <span className="font-semibold text-content-primary mt-1 inline-block">
                  {selectedItemForDetails.senderBank || 'Indian Bank'}
                </span>
              </div>

              <div>
                <span className="text-content-secondary block">
                  {activeTab === 'inbound' ? 'Bought Amount' : 'Order Amount'}
                </span>
                <span className="font-bold text-content-primary mt-1 inline-block text-base">
                  {formatCurrency(selectedItemForDetails.totalAmount, currencySymbol === '$' ? 'USD' : 'INR')}
                </span>
              </div>

              <div>
                <span className="text-content-secondary block">Reference ID</span>
                <span className="font-mono text-content-primary font-semibold mt-1 inline-block">
                  {selectedItemForDetails.orderNumber || selectedItemForDetails.orderId || 'ORD-1024'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handlePrintPDF}
                leftIcon={Printer}
              >
                Save as PDF
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedItemForStatus(selectedItemForDetails);
                  setNewArrivalStatus(selectedItemForDetails.arrivalStatus || 'On-Time');
                  setStatusModalOpen(true);
                }}
              >
                Update Status
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal (Direct visual alignment with reference screenshot) */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        maxWidth="max-w-md"
      >
        {selectedItemForStatus && (
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-5">
            <div className="text-center pb-2">
              <h3 className="text-base font-bold text-content-primary">Edit Status</h3>
              <p className="text-xs text-content-secondary mt-0.5">
                Ref: {selectedItemForStatus.orderNumber || selectedItemForStatus.orderId || 'ORD-1024'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-content-secondary uppercase mb-1.5">
                  Arrival Status
                </label>
                <select
                  value={newArrivalStatus}
                  onChange={(e) => setNewArrivalStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-white text-sm font-semibold text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="On-Time">On-Time</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Late">Late</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStatusModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={actionLoading}
              >
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

