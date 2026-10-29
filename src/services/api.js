import axios from 'axios';
import {
  mockKPIs,
  mockProducts,
  mockSuppliers,
  mockPurchaseOrders,
  mockCustomerDeliveries,
  mockStockAlerts,
  mockMonthlySales,
  mockCategoryDistribution,
  mockStockStatusBreakdown,
  mockForecastData,
  mockForecastInsights,
} from '../data/mockData';

// Determine configuration from environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'; // defaults to true unless explicitly disabled

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor for logging & headers
apiClient.interceptors.request.use(
  (config) => {
    // Auth token insertion placeholder for future backend integration
    const token = localStorage.getItem('trackgpt_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected API error occurred',
      status: error.response?.status,
      data: error.response?.data,
      isApiError: true,
    };
    return Promise.reject(customError);
  }
);

// In-Memory Reactive State for Mock Mode
// Allows additions, updates, status transitions and deletions to persist during session
let inMemoryState = {
  kpis: { ...mockKPIs },
  products: [...mockProducts],
  suppliers: [...mockSuppliers],
  purchaseOrders: [...mockPurchaseOrders],
  deliveries: [...mockCustomerDeliveries],
  alerts: [...mockStockAlerts],
  sales: [...mockMonthlySales],
  categories: [...mockCategoryDistribution],
  stockBreakdown: [...mockStockStatusBreakdown],
  forecastData: [...mockForecastData],
  forecastInsights: [...mockForecastInsights],
};

const simulateLatency = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================================================
   API CONTRACTS & SERVICE MODULES
   ========================================================================= */

// --- Dashboard Services ---
export const dashboardService = {
  getSummary: async () => {
    if (USE_MOCK_DATA) {
      await simulateLatency();
      return {
        kpis: { ...inMemoryState.kpis },
        salesTrend: [...inMemoryState.sales],
        categoryDistribution: [...inMemoryState.categories],
        stockStatusBreakdown: [...inMemoryState.stockBreakdown],
        criticalAlerts: inMemoryState.alerts.filter((a) => a.severity === 'Critical'),
        recentOrders: inMemoryState.purchaseOrders.slice(0, 5),
        replenishmentRequired: inMemoryState.products.filter(
          (p) => p.currentStock <= p.reorderLevel
        ),
      };
    }
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  },
};

// --- Product & Inventory Services ---
export const productService = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateLatency();
      let list = [...inMemoryState.products];
      if (params.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
      }
      if (params.category && params.category !== 'All') {
        list = list.filter((p) => p.category === params.category);
      }
      if (params.stockStatus && params.stockStatus !== 'All') {
        list = list.filter((p) => p.stockStatus === params.stockStatus);
      }
      return list;
    }
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getById: async (id) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(150);
      const product = inMemoryState.products.find((p) => p.id === id || p.sku === id);
      if (!product) throw new Error(`Product ${id} not found`);
      return product;
    }
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(300);
      const newProduct = {
        ...productData,
        id: `PRD-${String(inMemoryState.products.length + 1).padStart(3, '0')}`,
        currentStock: Number(productData.currentStock) || 0,
        reservedStock: 0,
        availableStock: Number(productData.currentStock) || 0,
        incomingStock: 0,
        unitCost: Number(productData.unitCost) || 0,
        sellingPrice: Number(productData.sellingPrice) || 0,
        inventoryValue: (Number(productData.currentStock) || 0) * (Number(productData.unitCost) || 0),
        reorderLevel: Number(productData.reorderLevel) || 50,
        stockStatus:
          Number(productData.currentStock) <= (Number(productData.reorderLevel) || 50)
            ? 'Low Stock'
            : 'Moderate Stock',
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      inMemoryState.products.unshift(newProduct);
      inMemoryState.kpis.totalProducts += 1;
      inMemoryState.kpis.totalInventoryValue += newProduct.inventoryValue;
      return newProduct;
    }
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  update: async (id, updates) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(250);
      const index = inMemoryState.products.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Product not found');
      
      const currentStock = updates.currentStock !== undefined ? Number(updates.currentStock) : inMemoryState.products[index].currentStock;
      const unitCost = updates.unitCost !== undefined ? Number(updates.unitCost) : inMemoryState.products[index].unitCost;
      const reorderLevel = updates.reorderLevel !== undefined ? Number(updates.reorderLevel) : inMemoryState.products[index].reorderLevel;

      let stockStatus = inMemoryState.products[index].stockStatus;
      if (currentStock <= reorderLevel * 0.5) stockStatus = 'Low Stock';
      else if (currentStock <= reorderLevel) stockStatus = 'Moderate Stock';
      else stockStatus = 'High Stock';

      inMemoryState.products[index] = {
        ...inMemoryState.products[index],
        ...updates,
        currentStock,
        unitCost,
        reorderLevel,
        stockStatus,
        inventoryValue: currentStock * unitCost,
        lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      return inMemoryState.products[index];
    }
    const response = await apiClient.put(`/products/${id}`, updates);
    return response.data;
  },

  delete: async (id) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(200);
      const index = inMemoryState.products.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Product not found');
      const removed = inMemoryState.products.splice(index, 1)[0];
      inMemoryState.kpis.totalProducts = Math.max(0, inMemoryState.kpis.totalProducts - 1);
      inMemoryState.kpis.totalInventoryValue = Math.max(0, inMemoryState.kpis.totalInventoryValue - removed.inventoryValue);
      return { success: true, id };
    }
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  updateStock: async (id, delta, reason = 'Manual Adjustment') => {
    if (USE_MOCK_DATA) {
      await simulateLatency(200);
      const product = inMemoryState.products.find((p) => p.id === id);
      if (!product) throw new Error('Product not found');
      const newStock = Math.max(0, product.currentStock + Number(delta));
      return productService.update(id, { currentStock: newStock });
    }
    const response = await apiClient.patch(`/products/${id}/stock`, { delta, reason });
    return response.data;
  },
};

// --- Supplier Services ---
export const supplierService = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateLatency();
      let list = [...inMemoryState.suppliers];
      if (params.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query) ||
            s.contactPerson.toLowerCase().includes(query) ||
            s.city.toLowerCase().includes(query)
        );
      }
      if (params.status && params.status !== 'All') {
        list = list.filter((s) => s.status === params.status);
      }
      return list;
    }
    const response = await apiClient.get('/suppliers', { params });
    return response.data;
  },

  getById: async (id) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(150);
      const supplier = inMemoryState.suppliers.find((s) => s.id === id);
      if (!supplier) throw new Error('Supplier not found');
      return supplier;
    }
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (supplierData) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(300);
      const newSupplier = {
        ...supplierData,
        id: `SUP-${String(inMemoryState.suppliers.length + 1).padStart(3, '0')}`,
        suppliedProducts: Number(supplierData.suppliedProducts) || 1,
        avgLeadTimeDays: Number(supplierData.avgLeadTimeDays) || 5,
        onTimeDeliveryRate: 95.0,
        orderCount: 1,
        status: supplierData.status || 'Active',
        rating: 4.5,
      };
      inMemoryState.suppliers.unshift(newSupplier);
      return newSupplier;
    }
    const response = await apiClient.post('/suppliers', supplierData);
    return response.data;
  },

  update: async (id, updates) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(250);
      const index = inMemoryState.suppliers.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Supplier not found');
      inMemoryState.suppliers[index] = { ...inMemoryState.suppliers[index], ...updates };
      return inMemoryState.suppliers[index];
    }
    const response = await apiClient.put(`/suppliers/${id}`, updates);
    return response.data;
  },
};

// --- Purchase Order & Delivery Services ---
export const purchaseOrderService = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateLatency();
      let list = [...inMemoryState.purchaseOrders];
      if (params.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (po) =>
            po.orderNumber.toLowerCase().includes(query) ||
            po.supplierName.toLowerCase().includes(query) ||
            po.productDetails?.toLowerCase().includes(query)
        );
      }
      if (params.status && params.status !== 'All') {
        list = list.filter((po) => po.orderStatus === params.status);
      }
      if (params.arrivalStatus && params.arrivalStatus !== 'All') {
        list = list.filter((po) => po.arrivalStatus === params.arrivalStatus);
      }
      return list;
    }
    const response = await apiClient.get('/purchase-orders', { params });
    return response.data;
  },

  create: async (orderData) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(350);
      const orderCount = inMemoryState.purchaseOrders.length + 1;
      const newOrder = {
        ...orderData,
        id: `PO-2026-${String(orderCount).padStart(3, '0')}`,
        orderNumber: `ORD-${1024 + orderCount}`,
        orderDate: new Date().toISOString().split('T')[0],
        orderStatus: orderData.orderStatus || 'Ordered',
        arrivalStatus: 'On-Time',
        paymentStatus: orderData.paymentStatus || 'Pending',
        itemCount: orderData.items?.length || 1,
        totalAmount: Number(orderData.totalAmount) || 0,
      };
      inMemoryState.purchaseOrders.unshift(newOrder);
      inMemoryState.kpis.pendingPurchaseOrders += 1;
      return newOrder;
    }
    const response = await apiClient.post('/purchase-orders', orderData);
    return response.data;
  },

  updateStatus: async (id, { orderStatus, arrivalStatus }) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(200);
      const index = inMemoryState.purchaseOrders.findIndex((po) => po.id === id || po.orderNumber === id);
      if (index === -1) throw new Error('Purchase order not found');
      if (orderStatus) inMemoryState.purchaseOrders[index].orderStatus = orderStatus;
      if (arrivalStatus) inMemoryState.purchaseOrders[index].arrivalStatus = arrivalStatus;
      return inMemoryState.purchaseOrders[index];
    }
    const response = await apiClient.patch(`/purchase-orders/${id}/status`, { orderStatus, arrivalStatus });
    return response.data;
  },

  getCustomerDeliveries: async () => {
    if (USE_MOCK_DATA) {
      await simulateLatency(150);
      return [...inMemoryState.deliveries];
    }
    const response = await apiClient.get('/deliveries/customers');
    return response.data;
  },
};

// --- Stock Alerts Services ---
export const alertService = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateLatency();
      let list = [...inMemoryState.alerts];
      if (params.severity && params.severity !== 'All') {
        list = list.filter((a) => a.severity === params.severity);
      }
      if (params.alertType && params.alertType !== 'All') {
        list = list.filter((a) => a.alertType === params.alertType);
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.productName.toLowerCase().includes(query) ||
            a.sku.toLowerCase().includes(query) ||
            a.alertType.toLowerCase().includes(query)
        );
      }
      return list;
    }
    const response = await apiClient.get('/alerts', { params });
    return response.data;
  },

  resolve: async (id, notes = '') => {
    if (USE_MOCK_DATA) {
      await simulateLatency(250);
      const index = inMemoryState.alerts.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Alert not found');
      inMemoryState.alerts[index].status = 'Resolved';
      inMemoryState.alerts[index].resolvedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      inMemoryState.alerts[index].resolutionNotes = notes;
      return inMemoryState.alerts[index];
    }
    const response = await apiClient.post(`/alerts/${id}/resolve`, { notes });
    return response.data;
  },
};

// --- AI Demand Forecasting Services ---
export const forecastService = {
  getForecast: async (productId = 'PRD-001', horizon = '30d') => {
    if (USE_MOCK_DATA) {
      await simulateLatency(400);
      return {
        productId,
        horizon,
        modelName: 'SARIMAX + XGBoost Hybrid Ensemble v2.4',
        lastTrained: '2026-10-21 04:00 UTC',
        confidenceScore: 92.4,
        meanAbsoluteError: '4.8 units',
        timeSeries: inMemoryState.forecastData,
        insights: inMemoryState.forecastInsights,
      };
    }
    const response = await apiClient.get(`/forecast`, { params: { productId, horizon } });
    return response.data;
  },

  runAIAnalysis: async ({ orderId, productId, companyName }) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(600);
      // Realistic simulation matching the reference mockup "AI Result"
      return {
        date: '21 Oct 2026',
        orderId: orderId || 'ORD-1024',
        companyName: companyName || 'AMD Pvt Ltd',
        riskOfLateDelivery: 'High',
        finding: 'The order may be delayed because the required processor shipment is late and available inventory is insufficient.',
        recommendedActions: [
          'Check whether an alternative supplier can provide the processors.',
          'Review available stock and reserve it for priority orders.',
          'Update the expected fulfilment date for the customer.'
        ]
      };
    }
    const response = await apiClient.post(`/ai/analyze-risk`, { orderId, productId, companyName });
    return response.data;
  }
};

// --- Sales Analytics Services ---
export const salesService = {
  getAnalytics: async (filters = {}) => {
    if (USE_MOCK_DATA) {
      await simulateLatency();
      return {
        summary: {
          totalRevenue: 12450000,
          unitsSold: 6250,
          averageOrderValue: 24900,
          grossMargin: 24.5,
        },
        monthlyTrends: inMemoryState.sales,
        categoryPerformance: inMemoryState.categories,
        bestSellers: inMemoryState.products.slice(0, 5),
        slowMoving: inMemoryState.products.filter(p => p.stockStatus === 'High Stock').slice(0, 4),
      };
    }
    const response = await apiClient.get('/analytics/sales', { params: filters });
    return response.data;
  },
};

// --- Settings Services ---
export const settingsService = {
  getSettings: () => {
    const saved = localStorage.getItem('trackgpt_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      businessName: 'Subash Enterprise Supply Chain Ltd.',
      currency: 'INR',
      currencySymbol: '₹',
      lowStockThresholdPercent: 20,
      overstockThresholdDays: 90,
      emailAlerts: true,
      criticalSmsAlerts: false,
      autoReplenishmentSuggestion: true,
      themeMode: 'light',
    };
  },

  saveSettings: (settings) => {
    localStorage.setItem('trackgpt_settings', JSON.stringify(settings));
    return settings;
  },
};

