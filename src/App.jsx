import './styles/app.css';
import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SupplyChainProvider } from './context/SupplyChainContext';

import MainLayout from './layouts/MainLayout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import ShipmentsPage from './pages/Shipments/ShipmentsPage';
import DemandForecastPage from './pages/DemandForecast/DemandForecastPage';
import ProcurementPage from './pages/Procurement/ProcurementPage';
import RiskCenterPage from './pages/RiskCenter/RiskCenterPage';
import WarehousesPage from './pages/Warehouses/WarehousesPage';
import KnowledgeBasePage from './pages/KnowledgeBase/KnowledgeBasePage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SupplySense ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',

          background: '#0B1220',
          color: '#FFFFFF',
          padding: 20,
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 12, color: '#EF4444' }}>SupplySense Telematics Error Caught</h2>
          <p style={{ color: '#94A3B8', marginBottom: 20, maxWidth: 500 }}>
            {this.state.error?.toString() || 'An unexpected rendering error occurred in component.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/dashboard';
            }}
            style={{
              background: '#3B82F6',
              color: '#FFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reload Executive Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SupplyChainProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Authentication Route */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Enterprise SaaS Application Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="warehouses" element={<WarehousesPage />} />
                    <Route path="suppliers" element={<SuppliersPage />} />
                    <Route path="shipments" element={<ShipmentsPage />} />
                    <Route path="demand-forecast" element={<DemandForecastPage />} />
                    <Route path="procurement" element={<ProcurementPage />} />
                    <Route path="risk-center" element={<RiskCenterPage />} />
                    <Route path="knowledge-base" element={<KnowledgeBasePage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </SupplyChainProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
