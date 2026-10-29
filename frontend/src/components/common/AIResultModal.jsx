import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useApp } from '../../context/AppContext';
import { forecastService } from '../../services/api';

export const AIResultModal = () => {
  const { aiModalOpen, aiModalData, closeAiAnalysis, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [productDetails, setProductDetails] = useState('');

  // When modal opens with preset data or empty
  React.useEffect(() => {
    if (aiModalOpen) {
      if (aiModalData) {
        setCompanyName(aiModalData.companyName || aiModalData.supplierName || 'AMD Pvt Ltd');
        setProductDetails(aiModalData.productDetails || aiModalData.productName || 'Processor X Octa-Core');
        runAnalysis(aiModalData);
      } else {
        setCompanyName('');
        setProductDetails('');
        setResult(null);
      }
    }
  }, [aiModalOpen, aiModalData]);

  const runAnalysis = async (customParams = null) => {
    try {
      setLoading(true);
      const params = customParams || {
        orderId: 'ORD-1024',
        companyName: companyName || 'AMD Pvt Ltd',
        productId: productDetails || 'Processor X Octa-Core',
      };
      const res = await forecastService.runAIAnalysis(params);
      setResult(res);
    } catch {
      showToast('Failed to run AI risk prediction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runAnalysis();
  };

  if (!aiModalOpen) return null;

  return (
    <Modal isOpen={aiModalOpen} onClose={closeAiAnalysis} maxWidth="max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-content-primary">
              {result ? 'AI Risk Analysis Result' : 'Select Delivery & Supply Details'}
            </h3>
            <p className="text-xs text-content-secondary">
              Predictive supply chain risk detection powered by TrackGPT Intelligence
            </p>
          </div>
        </div>
        <button
          onClick={closeAiAnalysis}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!result && !loading && (
        <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary uppercase mb-1">
              Company / Vendor / Customer Name
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. AMD Pvt Ltd or Babu IT Park"
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-content-secondary uppercase mb-1">
              Product Details & Specifications
            </label>
            <input
              type="text"
              required
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
              placeholder="e.g. Ryzen 7 7730U or 250PC + Accessories"
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="pt-3 flex justify-end gap-3">
            <Button variant="secondary" size="md" onClick={closeAiAnalysis}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={Sparkles}
            >
              Analyse with AI
            </Button>
          </div>
        </form>
      )}

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
          <h4 className="text-sm font-semibold text-content-primary">Evaluating Supply Chain Risk Vectors...</h4>
          <p className="text-xs text-content-secondary mt-1">Cross-referencing vendor lead times, stock buffers, and transit logs.</p>
        </div>
      )}

      {result && !loading && (
        <div className="mt-4 space-y-5">
          <div className="flex items-center justify-between text-xs text-content-secondary pb-3 border-b border-surface-border">
            <span>Evaluation Date: <strong className="text-content-primary">{result.date}</strong></span>
            <span>Target Ref: <strong className="text-content-primary">{result.orderId}</strong></span>
          </div>

          {/* Risk Level Badge */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-rose-800">Risk of Late Delivery:</span>
                <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-xs font-bold tracking-wide">
                  {result.riskOfLateDelivery}
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-2 font-medium leading-relaxed">
                {result.finding}
              </p>
            </div>
          </div>

          {/* Recommended actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2.5">
              AI Recommended Actions
            </h4>
            <div className="space-y-2">
              {result.recommendedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-subtle border border-surface-border text-xs text-content-primary"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResult(null)}
            >
              Analyze Another Record
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={closeAiAnalysis}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

