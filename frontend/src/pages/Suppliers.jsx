import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit2,
  Star,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Drawer } from '../components/common/Drawer';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { supplierService, purchaseOrderService } from '../services/api';
import { mockCategories } from '../data/mockData';
import { exportToCSV } from '../utils/exportCsv';
import { formatCurrency, formatDate } from '../../src/utils/formatters';
import { useApp } from '../context/AppContext';

export const Suppliers = () => {
  const navigate = useNavigate();
  const { currencySymbol, showToast } = useApp();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add/Edit Modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    city: 'Bangalore',
    state: 'Karnataka',
    category: 'Processors',
    avgLeadTimeDays: '5',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Details Drawer
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedSupplierForDetails, setSelectedSupplierForDetails] = useState(null);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch suppliers directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  // Open Form
  const handleOpenForm = (supplier = null) => {
    setSelectedSupplierForEdit(supplier);
    if (supplier) {
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        city: supplier.city,
        state: supplier.state,
        category: supplier.category,
        avgLeadTimeDays: String(supplier.avgLeadTimeDays),
        status: supplier.status,
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        city: 'Bangalore',
        state: 'Karnataka',
        category: 'Processors',
        avgLeadTimeDays: '5',
        status: 'Active',
      });
    }
    setFormErrors({});
    setFormModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Supplier company name is required';
    if (!formData.contactPerson.trim()) errs.contactPerson = 'Contact representative is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Enter a valid corporate email';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.avgLeadTimeDays || Number(formData.avgLeadTimeDays) <= 0) {
      errs.avgLeadTimeDays = 'Lead time must be at least 1 day';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      if (selectedSupplierForEdit) {
        const updated = await supplierService.update(selectedSupplierForEdit.id, {
          ...formData,
          avgLeadTimeDays: Number(formData.avgLeadTimeDays),
        });
        setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        showToast(`Supplier ${updated.name} updated successfully`, 'success');
      } else {
        const created = await supplierService.create({
          ...formData,
          avgLeadTimeDays: Number(formData.avgLeadTimeDays),
        });
        setSuppliers((prev) => [created, ...prev]);
        showToast(`Supplier ${created.name} registered (ID: ${created.id})`, 'success');
      }
      setFormModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (supplier) => {
    setSelectedSupplierForDetails(supplier);
    setDetailsDrawerOpen(true);
    try {
      const allOrders = await purchaseOrderService.getAll();
      const matched = allOrders.filter(
        (po) => po.supplierId === supplier.id || po.supplierName === supplier.name
      );
      setSupplierOrders(matched);
    } catch {
      setSupplierOrders([]);
    }
  };

  const handleExport = () => {
    const columns = [
      { key: 'id', label: 'Supplier ID' },
      { key: 'name', label: 'Supplier Name' },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'city', label: 'City' },
      { key: 'category', label: 'Category' },
      { key: 'avgLeadTimeDays', label: 'Lead Time (Days)' },
      { key: 'onTimeDeliveryRate', label: 'On-Time Rate (%)' },
      { key: 'status', label: 'Status' },
    ];
    exportToCSV(filteredSuppliers, 'TrackGPT_Suppliers_Directory', columns);
    showToast(`Exported ${filteredSuppliers.length} supplier profiles to CSV`, 'success');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            Supplier Directory & SLA Performance
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Vendor relationship management, lead-time benchmarking, and on-time fulfillment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            leftIcon={Download}
            disabled={filteredSuppliers.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenForm(null)}
            leftIcon={Plus}
          >
            Add New Supplier
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by vendor name, city, contact..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-border text-xs text-content-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <span className="text-xs text-content-secondary">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-surface-border bg-white text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Suppliers Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchSuppliers} />
      ) : loading ? (
        <Card className="p-6">
          <TableSkeleton rows={6} cols={7} />
        </Card>
      ) : filteredSuppliers.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="No suppliers matched"
            description="Adjust your search filters or add a new vendor to the network."
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
                  <th className="py-3.5 px-4">Supplier Name</th>
                  <th className="py-3.5 px-4">Supplier ID</th>
                  <th className="py-3.5 px-4">Contact Representative</th>
                  <th className="py-3.5 px-4 text-center">Avg Lead Time</th>
                  <th className="py-3.5 px-4 text-center">On-Time SLA Rate</th>
                  <th className="py-3.5 px-4 text-center">Order Count</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-content-primary">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-content-primary">
                      <button
                        onClick={() => handleViewDetails(s)}
                        className="text-left hover:text-brand-600 transition-colors"
                      >
                        {s.name}
                      </button>
                      <div className="text-[11px] text-content-secondary font-normal flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {s.city}, {s.state}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {s.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-content-primary">{s.contactPerson}</div>
                      <div className="text-[11px] text-content-secondary">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-content-primary">
                      {s.avgLeadTimeDays} days
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                          s.onTimeDeliveryRate >= 90
                            ? 'text-emerald-700 bg-emerald-50'
                            : s.onTimeDeliveryRate >= 75
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {s.onTimeDeliveryRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {s.orderCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={s.status}>{s.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(s)}
                          title="View Supplier Profile & Orders"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenForm(s)}
                          title="Edit Supplier"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={selectedSupplierForEdit ? 'Edit Supplier Record' : 'Register New Supplier'}
        subtitle="Manage supplier credentials, contact details, and procurement SLA parameters"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Supplier Company Name"
            required
            placeholder="e.g. AMD Pvt Ltd"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              required
              placeholder="e.g. Rajesh Sharma"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              error={formErrors.contactPerson}
            />

            <Input
              label="Official Email"
              type="email"
              required
              placeholder="e.g. rajesh@supplier.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              required
              placeholder="+91 98450 12345"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formErrors.phone}
            />

            <Input
              label="City / Hub Location"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              options={mockCategories}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />

            <Input
              label="Avg Lead Time (Days)"
              type="number"
              min="1"
              required
              value={formData.avgLeadTimeDays}
              onChange={(e) => setFormData({ ...formData, avgLeadTimeDays: e.target.value })}
              error={formErrors.avgLeadTimeDays}
            />

            <Select
              label="Partnership Status"
              options={['Active', 'Under Review', 'Inactive']}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setFormModalOpen(false)}
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
              {selectedSupplierForEdit ? 'Save Changes' : 'Register Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Supplier Details Drawer */}
      <Drawer
        isOpen={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        title={selectedSupplierForDetails?.name || 'Supplier Profile'}
        subtitle={`ID: ${selectedSupplierForDetails?.id} • City: ${selectedSupplierForDetails?.city}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDetailsDrawerOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDetailsDrawerOpen(false);
                navigate('/purchase-orders');
              }}
            >
              Issue Purchase Order
            </Button>
          </div>
        }
      >
        {selectedSupplierForDetails && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-surface-border flex items-center justify-between">
              <div>
                <span className="text-xs text-content-secondary uppercase font-semibold">Vendor Status</span>
                <div className="mt-1">
                  <Badge variant={selectedSupplierForDetails.status}>
                    {selectedSupplierForDetails.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-content-secondary uppercase font-semibold">SLA On-Time Fulfillment</span>
                <p className="text-xl font-bold text-emerald-600 mt-0.5">
                  {selectedSupplierForDetails.onTimeDeliveryRate}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-surface-border">
                <span className="text-content-secondary">Primary Contact:</span>
                <p className="font-semibold text-content-primary mt-0.5">{selectedSupplierForDetails.contactPerson}</p>
                <p className="text-slate-500 mt-1">{selectedSupplierForDetails.email}</p>
                <p className="text-slate-500">{selectedSupplierForDetails.phone}</p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-surface-border">
                <span className="text-content-secondary">Procurement Benchmarks:</span>
                <p className="font-semibold text-content-primary mt-0.5">Lead Time: {selectedSupplierForDetails.avgLeadTimeDays} days</p>
                <p className="text-slate-500 mt-1">Supplied Lines: {selectedSupplierForDetails.suppliedProducts} SKUs</p>
                <p className="text-slate-500">Historical Orders: {selectedSupplierForDetails.orderCount}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2.5">
                Recent Purchase Orders Placed with this Vendor
              </h4>
              {supplierOrders.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-content-secondary text-center">
                  No purchase orders linked to this vendor record yet.
                </div>
              ) : (
                <div className="border border-surface-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-content-secondary uppercase text-[10px] border-b border-surface-border">
                      <tr>
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Product Summary</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border text-content-primary">
                      {supplierOrders.slice(0, 5).map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold">{po.orderNumber}</td>
                          <td className="py-2.5 px-3 text-content-secondary">{formatDate(po.orderDate)}</td>
                          <td className="py-2.5 px-3 max-w-[150px] truncate">{po.productDetails}</td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            {formatCurrency(po.totalAmount, currencySymbol === '$' ? 'USD' : 'INR')}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant={po.arrivalStatus || po.orderStatus}>
                              {po.arrivalStatus || po.orderStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

