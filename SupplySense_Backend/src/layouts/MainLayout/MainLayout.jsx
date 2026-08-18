import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import AiAssistant from '../../components/AiAssistant/AiAssistant';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { useSupplyChain } from '../../context/SupplyChainContext';
import { FiSearch, FiLayers, FiShield, FiBox, FiTruck } from 'react-icons/fi';

export const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    globalSearchOpen,
    setGlobalSearchOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    products,
    suppliers,
    shipments
  } = useSupplyChain();

  const searchResults = globalSearchQuery.trim().length > 1 ? {
    products: products.filter(p => p.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || p.sku.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3),
    suppliers: suppliers.filter(s => s.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3),
    shipments: shipments.filter(sh => sh.trackingNumber.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3)
  } : null;

  return (
    <div className="app-main-layout">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="layout-body-column">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="layout-page-wrapper">
          <Outlet />
        </main>
      </div>

      {/* AI Assistant Floating Drawer */}
      <AiAssistant />

      {/* Global Search Modal */}
      <Modal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        title="Global SupplySense Intelligence Search"
        size="lg"
      >
        <div className="global-search-modal-body">
          <Input
            icon={FiSearch}
            placeholder="Type SKU name, Supplier code, or Tracking Number..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            autoFocus
          />

          {searchResults && (
            <div className="search-modal-results">
              {searchResults.products.length > 0 && (
                <div className="result-category">
                  <h4><FiBox size={14} /> Inventory SKUs</h4>
                  {searchResults.products.map(p => (
                    <div key={p.id} className="search-result-item" onClick={() => setGlobalSearchOpen(false)}>
                      <span className="res-title">{p.name} ({p.sku})</span>
                      <span className="res-meta">{p.warehouse} • Stock: {p.stockQuantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.suppliers.length > 0 && (
                <div className="result-category">
                  <h4><FiShield size={14} /> Suppliers</h4>
                  {searchResults.suppliers.map(s => (
                    <div key={s.id} className="search-result-item" onClick={() => setGlobalSearchOpen(false)}>
                      <span className="res-title">{s.name} ({s.code})</span>
                      <span className="res-meta">{s.region} • Reliability: {s.reliability}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.shipments.length > 0 && (
                <div className="result-category">
                  <h4><FiTruck size={14} /> Shipments</h4>
                  {searchResults.shipments.map(sh => (
                    <div key={sh.id} className="search-result-item" onClick={() => setGlobalSearchOpen(false)}>
                      <span className="res-title">{sh.trackingNumber} ({sh.carrier})</span>
                      <span className="res-meta">Status: {sh.status} • ETA: {sh.estimatedDelivery}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MainLayout;
