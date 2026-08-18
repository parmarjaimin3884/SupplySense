import { ProductItem, InventoryQueryParams } from '@/types';

export interface ProductServiceContract {
  getProducts(params?: InventoryQueryParams): Promise<{
    data: ProductItem[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getProductById(id: string): Promise<ProductItem | null>;
  getProductsByWarehouse(warehouseName: string): Promise<ProductItem[]>;
  getProductsByCategory(categoryName: string): Promise<ProductItem[]>;
}
