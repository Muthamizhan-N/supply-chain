import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

export const StockUpdateModal = ({
  isOpen,
  onClose,
  product,
  onUpdateStock,
  isLoading = false,
}) => {
  const [type, setType] = useState('add'); // 'add' or 'subtract'
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Inbound Shipment Restock');
  const [error, setError] = useState('');

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Please enter a valid positive quantity');
      return;
    }
    if (type === 'subtract' && qty > product.currentStock) {
      setError(`Cannot deduct more than current available stock (${product.currentStock})`);
      return;
    }

    const delta = type === 'add' ? qty : -qty;
    onUpdateStock(product.id, delta, reason);
  };

  const resultingStock =
    type === 'add'
      ? product.currentStock + (Number(quantity) || 0)
      : Math.max(0, product.currentStock - (Number(quantity) || 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Stock Quantity"
      subtitle={`SKU: ${product.sku} — ${product.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-surface-border flex items-center justify-between text-xs">
          <span className="text-content-secondary">Current On-Hand Stock:</span>
          <span className="font-bold text-content-primary text-sm">{product.currentStock} units</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('add')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
              type === 'add'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20'
                : 'bg-white border-surface-border text-content-secondary hover:bg-slate-50'
            }`}
          >
            + Add Stock (Restock)
          </button>
          <button
            type="button"
            onClick={() => setType('subtract')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
              type === 'subtract'
                ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-500/20'
                : 'bg-white border-surface-border text-content-secondary hover:bg-slate-50'
            }`}
          >
            - Deduct Stock (Dispatched)
          </button>
        </div>

        <Input
          label="Adjustment Quantity"
          type="number"
          min="1"
          required
          placeholder="e.g. 50"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setError('');
          }}
          error={error}
        />

        <Select
          label="Adjustment Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={[
            'Inbound Shipment Restock',
            'Vendor Delivery Verified',
            'Physical Warehouse Audit Correction',
            'Order Fulfillment Dispatch',
            'Damaged Goods Quarantine',
            'Customer Return Restock',
          ]}
        />

        <div className="p-3 rounded-lg bg-brand-50/60 border border-brand-100 flex items-center justify-between text-xs">
          <span className="text-brand-900 font-medium">Projected New Stock:</span>
          <span className="font-bold text-brand-700 text-sm">{resultingStock} units</span>
        </div>

        <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            Apply Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

