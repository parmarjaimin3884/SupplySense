import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { generateProducts, generateSuppliers, MOCK_PURCHASE_ORDERS, MOCK_SHIPMENTS } from '@/lib/mock/fixtures';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Products' | 'Suppliers' | 'Purchase Orders' | 'Shipments';
  href: string;
}

const mockProducts = generateProducts(50);
const mockSuppliers = generateSuppliers(20);

export const searchService = {
  async search(query: string): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];

    if (DataSourceConfig.isApi) {
      const response = await apiClient.get('/api/v1/search', { params: { query } });
      return response.data;
    }

    const q = query.toLowerCase();
    const results: SearchResultItem[] = [];

    // Products
    mockProducts.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          title: p.name,
          subtitle: `SKU: ${p.sku} • Stock: ${p.stockQuantity} units • ${p.category}`,
          category: 'Products',
          href: `/inventory/${p.id}`,
        });
      }
    });

    // Suppliers
    mockSuppliers.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.region.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          title: s.name,
          subtitle: `Code: ${s.code} • Region: ${s.region} • Rating: ${s.rating}/5.0`,
          category: 'Suppliers',
          href: `/suppliers/${s.id}`,
        });
      }
    });

    // Purchase Orders
    MOCK_PURCHASE_ORDERS.forEach(po => {
      if (po.poNumber.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q)) {
        results.push({
          id: po.id,
          title: `Purchase Order ${po.poNumber}`,
          subtitle: `Supplier: ${po.supplierName} • Status: ${po.status}`,
          category: 'Purchase Orders',
          href: `/purchase-orders/${po.id}`,
        });
      }
    });

    // Shipments
    MOCK_SHIPMENTS.forEach(shp => {
      if (shp.shipmentNo.toLowerCase().includes(q) || shp.trackingNo.toLowerCase().includes(q) || shp.carrier.toLowerCase().includes(q)) {
        results.push({
          id: shp.id,
          title: `Shipment ${shp.shipmentNo}`,
          subtitle: `Carrier: ${shp.carrier} • Tracking: ${shp.trackingNo}`,
          category: 'Shipments',
          href: `/shipments/${shp.id}`,
        });
      }
    });

    return results.slice(0, 12);
  }
};
