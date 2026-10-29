import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { mockCategories, mockSuppliers } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export const ProductFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const { currencySymbol } = useApp();
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Processors',
    description: '',
    currentStock: '',
    reorderLevel: '50',
    unitCost: '',
    sellingPrice: '',
    supplierName: 'AMD Pvt Ltd',
    leadTimeDays: '5',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || 'Processors',
        description: initialData.description || '',
        currentStock: initialData.currentStock ?? '',
        reorderLevel: initialData.reorderLevel ?? '50',
        unitCost: initialData.unitCost ?? '',
        sellingPrice: initialData.sellingPrice ?? '',
        supplierName: initialData.supplierName || 'AMD Pvt Ltd',
        leadTimeDays: initialData.leadTimeDays ?? '5',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'Processors',
        description: '',
        currentStock: '',
        reorderLevel: '50',
        unitCost: '',
        sellingPrice: '',
        supplierName: 'AMD Pvt Ltd',
        leadTimeDays: '5',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';
    if (!formData.category) errs.category = 'Category is required';
    if (formData.currentStock === '' || Number(formData.currentStock) < 0) {
      errs.currentStock = 'Enter a valid non-negative stock quantity';
    }
    if (formData.reorderLevel === '' || Number(formData.reorderLevel) < 0) {
      errs.reorderLevel = 'Enter a valid reorder threshold';
    }
    if (formData.unitCost === '' || Number(formData.unitCost) <= 0) {
      errs.unitCost = 'Unit cost must be greater than zero';
    }
    if (formData.sellingPrice && Number(formData.sellingPrice) < Number(formData.unitCost)) {
      errs.sellingPrice = 'Selling price should not be less than unit cost';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      currentStock: Number(formData.currentStock),
      reorderLevel: Number(formData.reorderLevel),
      unitCost: Number(formData.unitCost),
      sellingPrice: Number(formData.sellingPrice) || Number(formData.unitCost) * 1.25,
      leadTimeDays: Number(formData.leadTimeDays) || 5,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Inventory Product' : 'Add New Inventory Product'}
      subtitle={isEditing ? `Modifying records for SKU ${initialData?.sku}` : 'Register a new SKU and supplier link in TrackGPT warehouse catalog'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            required
            placeholder="e.g. Ryzen 7 7730U Processor"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />

          <Input
            label="SKU Identifier"
            required
            placeholder="e.g. CPU-7730"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            error={errors.sku}
            disabled={isEditing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            required
            options={mockCategories}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            error={errors.category}
          />

          <Select
            label="Primary Supplier"
            required
            options={mockSuppliers.map((s) => s.name)}
            value={formData.supplierName}
            onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Technical specifications, model series, and form factor notes..."
            className="w-full rounded-lg border border-surface-border bg-white p-2.5 text-sm text-content-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`Unit Cost (${currencySymbol})`}
            type="number"
            min="0"
            step="any"
            required
            placeholder="0.00"
            value={formData.unitCost}
            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
            error={errors.unitCost}
          />

          <Input
            label={`Selling Price (${currencySymbol})`}
            type="number"
            min="0"
            step="any"
            placeholder="Optional suggested retail price"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
            error={errors.sellingPrice}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Initial / Current Stock"
            type="number"
            min="0"
            required
            placeholder="0"
            value={formData.currentStock}
            onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
            error={errors.currentStock}
          />

          <Input
            label="Reorder Threshold"
            type="number"
            min="1"
            required
            placeholder="50"
            value={formData.reorderLevel}
            onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
            error={errors.reorderLevel}
          />

          <Input
            label="Supplier Lead Time (Days)"
            type="number"
            min="1"
            value={formData.leadTimeDays}
            onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
          />
        </div>

        <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            {isEditing ? 'Save Product Changes' : 'Create Product SKU'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

