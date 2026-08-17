import { ProductServiceContract } from '../contracts/products';
import { generateProducts } from '@/lib/mock/fixtures';
import { ProductItem, InventoryQueryParams } from '@/types';

const mockProducts = generateProducts(50);

export class MockProductService implements ProductServiceContract {
  async getProducts(params: InventoryQueryParams = {}): Promise<{
    data: ProductItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = 'ALL',
      brand = 'ALL',
    } = params;

    let filtered = [...mockProducts];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (category !== 'ALL') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (brand !== 'ALL') {
      filtered = filtered.filter(p => p.brand === brand);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: paginated,
      total,
      page,
      totalPages,
    };
  }

  async getProductById(id: string): Promise<ProductItem | null> {
    const item = mockProducts.find(p => p.id === id || p.sku === id);
    return item || mockProducts[0];
  }

  async getProductsByWarehouse(warehouseName: string): Promise<ProductItem[]> {
    return mockProducts.filter(p => p.warehouse.toLowerCase().includes(warehouseName.toLowerCase()));
  }

  async getProductsByCategory(categoryName: string): Promise<ProductItem[]> {
    return mockProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
  }
}

export const mockProductService = new MockProductService();
