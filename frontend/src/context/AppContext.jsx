import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => settingsService.getSettings());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // AI Risk Analysis Modal State (elevates the reference mockups)
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState(null);

  const currencySymbol = settings.currency === 'USD' ? '$' : '₹';

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    settingsService.saveSettings(updated);
    showToast('Settings saved successfully', 'success');
  };

  const showToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openAiAnalysis = (data = null) => {
    setAiModalData(data);
    setAiModalOpen(true);
  };

  const closeAiAnalysis = () => {
    setAiModalOpen(false);
    setAiModalData(null);
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        currencySymbol,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        toasts,
        showToast,
        removeToast,
        aiModalOpen,
        aiModalData,
        openAiAnalysis,
        closeAiAnalysis,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

