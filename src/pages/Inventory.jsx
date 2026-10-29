import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Pagination } from '../components/common/Pagination';
import { ProductFormModal } from '../components/inventory/ProductFormModal';
import { ProductDetailsDrawer } from '../components/inventory/ProductDetailsDrawer';
import { StockUpdateModal } from '../components/inventory/StockUpdateModal';
import { productService } from '../services/api';
import { mockCategories } from '../data/mockData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';
import { useApp } from '../context/AppContext';

export const Inventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currencySymbol, showToast } = useApp();

  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'All');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('stockStatus') || 'All');

  // Sorting & Pagination
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Drawers state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync url search param if present
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
    const cat = searchParams.get('category');
    if (cat) setCategoryFilter(cat);
    const stat = searchParams.get('stockStatus');
    if (stat) setStatusFilter(stat);
  }, [searchParams]);

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          search === '' ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()) ||
          p.supplierName.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || p.stockStatus === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      });
  }, [products, search, categoryFilter, statusFilter, sortField, sortOrder]);

  // Paginated items
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Actions
  const handleCreateOrUpdate = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedProductForEdit) {
        const updated = await productService.update(selectedProductForEdit.id, formData);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`Product "${updated.name}" updated successfully`, 'success');
      } else {
        const created = await productService.create(formData);
        setProducts((prev) => [created, ...prev]);
        showToast(`Product "${created.name}" created with SKU ${created.sku}`, 'success');
      }
      setFormModalOpen(false);
      setSelectedProductForEdit(null);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockAdjust = async (id, delta, reason) => {
    try {
      setActionLoading(true);
      const updated = await productService.updateStock(id, delta, reason);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`Stock updated for ${updated.name} (Now: ${updated.currentStock})`, 'success');
      setStockModalOpen(false);
      setSelectedProductForStock(null);
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProductForDelete) return;
    try {
      setActionLoading(true);
      await productService.delete(selectedProductForDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== selectedProductForDelete.id));
      showToast(`Product ${selectedProductForDelete.sku} deleted`, 'info');
      setDeleteDialogOpen(false);
      setSelectedProductForDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'currentStock', label: 'Current Stock' },
      { key: 'reorderLevel', label: 'Reorder Level' },
      { key: 'unitCost', label: 'Unit Cost' },
      { key: 'inventoryValue', label: 'Inventory Value' },
      { key: 'supplierName', label: 'Supplier' },
      { key: 'stockStatus', label: 'Stock Status' },
      { key: 'lastUpdated', label: 'Last Updated' },
    ];
    exportToCSV(filteredProducts, 'TrackGPT_Inventory_Export', columns);
    showToast(`Exported ${filteredProducts.length} inventory records to CSV`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            Inventory & Warehouse Catalog
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Real-time SKU balances, stock replenishment thresholds, and multi-supplier sourcing.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={Download}
            disabled={filteredProducts.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedProductForEdit(null);
              setFormModalOpen(true);
            }}
            leftIcon={Plus}
          >
            Add Product SKU
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by product name, SKU..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-border text-xs text-content-primary placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-content-secondary">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Category:</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-surface-border bg-white text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {mockCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-content-secondary ml-1">
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-surface-border bg-white text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="High Stock">High Stock</option>
              <option value="Moderate Stock">Moderate Stock</option>
              <option value="Low Stock">Low Stock</option>
            </select>

            {(search || categoryFilter !== 'All' || statusFilter !== 'All') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('All');
                  setStatusFilter('All');
                  setCurrentPage(1);
                }}
                className="text-xs text-brand-600 hover:text-brand-700"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Data Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : loading ? (
        <Card className="p-6">
          <TableSkeleton rows={7} cols={8} />
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="No inventory products matched"
            description="Try modifying your search criteria or clear the filters to view the complete catalog."
            actionLabel="Reset Search Filters"
            onAction={() => {
              setSearch('');
              setCategoryFilter('All');
              setStatusFilter('All');
            }}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-content-secondary uppercase font-semibold text-[10px] tracking-wider border-b border-surface-border select-none">
                <tr>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SKU</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Category</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('currentStock')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Current Stock</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Reorder Level</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('unitCost')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Unit Cost</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('inventoryValue')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Total Value</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-content-primary">
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-content-primary">
                      <button
                        onClick={() => {
                          setSelectedProductForDetails(p);
                          setDetailsDrawerOpen(true);
                        }}
                        className="text-left hover:text-brand-600 transition-colors font-semibold"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 text-content-secondary">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-content-primary">
                      {formatNumber(p.currentStock)}
                    </td>
                    <td className="py-3 px-4 text-right text-content-secondary">
                      {p.reorderLevel}
                    </td>
                    <td className="py-3 px-4 text-right text-content-secondary">
                      {formatCurrency(p.unitCost, currencySymbol === '$' ? 'USD' : 'INR')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-content-primary">
                      {formatCurrency(p.inventoryValue || p.currentStock * p.unitCost, currencySymbol === '$' ? 'USD' : 'INR')}
                    </td>
                    <td className="py-3 px-4 text-content-secondary">
                      {p.supplierName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={p.stockStatus}>{p.stockStatus}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedProductForDetails(p);
                            setDetailsDrawerOpen(true);
                          }}
                          title="View Details Drawer"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductForStock(p);
                            setStockModalOpen(true);
                          }}
                          title="Adjust Stock Quantity"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductForEdit(p);
                            setFormModalOpen(true);
                          }}
                          title="Edit Product"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductForDelete(p);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Product"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </Card>
      )}

      {/* Modals & Drawers */}
      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedProductForEdit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedProductForEdit}
        isLoading={actionLoading}
      />

      <ProductDetailsDrawer
        isOpen={detailsDrawerOpen}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedProductForDetails(null);
        }}
        product={selectedProductForDetails}
        onEdit={(p) => {
          setSelectedProductForEdit(p);
          setFormModalOpen(true);
        }}
        onAdjustStock={(p) => {
          setSelectedProductForStock(p);
          setStockModalOpen(true);
        }}
      />

      <StockUpdateModal
        isOpen={stockModalOpen}
        onClose={() => {
          setStockModalOpen(false);
          setSelectedProductForStock(null);
        }}
        product={selectedProductForStock}
        onUpdateStock={handleStockAdjust}
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedProductForDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Inventory Product"
        message={`Are you sure you want to permanently delete "${selectedProductForDelete?.name}" (SKU: ${selectedProductForDelete?.sku})? This record will be archived from current stock audits.`}
        confirmText="Confirm Deletion"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
};

