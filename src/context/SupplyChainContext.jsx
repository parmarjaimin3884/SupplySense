import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApiService } from '../services/mockApi';
import { COMPANY_OPTIONS } from '../utils/constants';

const SupplyChainContext = createContext(null);

export const SupplyChainProvider = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState(COMPANY_OPTIONS[0]);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global Refresh Data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, supRes, whRes, shpRes] = await Promise.all([
        mockApiService.getDashboardData(),
        mockApiService.getProducts({ limit: 10 }),
        mockApiService.getSuppliers(),
        mockApiService.getWarehouses(),
        mockApiService.getShipments()
      ]);

      setDashboardData(dashRes.data);
      setProducts(prodRes.data);
      setSuppliers(supRes.data);
      setWarehouses(whRes.data);
      setShipments(shpRes.data);
    } catch (err) {
      console.error('Error loading supply chain context data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedCompany]);

  return (
    <SupplyChainContext.Provider value={{
      selectedCompany,
      setSelectedCompany,
      globalSearchOpen,
      setGlobalSearchOpen,
      globalSearchQuery,
      setGlobalSearchQuery,
      isAiDrawerOpen,
      setIsAiDrawerOpen,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      dashboardData,
      products,
      suppliers,
      warehouses,
      shipments,
      loading,
      refreshData
    }}>
      {children}
    </SupplyChainContext.Provider>
  );
};


export const useSupplyChain = () => useContext(SupplyChainContext);
