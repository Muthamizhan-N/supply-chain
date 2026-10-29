import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { SalesAnalytics } from './pages/SalesAnalytics';
import { DemandForecast } from './pages/DemandForecast';
import { StockAlerts } from './pages/StockAlerts';
import { Suppliers } from './pages/Suppliers';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

// Authentication Pages
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Directs the root URL (localhost:3000) to Sign In page by default
const RootEntryRedirect = () => {
  const { isAuthenticated } = useApp();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/signin'} replace />;
};

export const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Default Root: Opens the Sign In page first */}
          <Route path="/" element={<RootEntryRedirect />} />

          {/* Public Authentication Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Dashboard Routes: Requires Sign In */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/sales" element={<SalesAnalytics />} />
              <Route path="/forecasting" element={<DemandForecast />} />
              <Route path="/alerts" element={<StockAlerts />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
