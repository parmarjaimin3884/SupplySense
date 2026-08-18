export type POStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'SUPPLIER_CONFIRMED' 
  | 'SHIPPED' 
  | 'GOODS_RECEIVED' 
  | 'INVOICE_VERIFIED' 
  | 'CLOSED';

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId: string;
  warehouseName: string;
  orderDate: string;
  expectedDelivery: string;
  totalValue: number;
  status: POStatus;
  isDelayed: boolean;
  delayDays: number;
  itemsCount: number;
  paymentTerms: string;
  skuList: Array<{ sku: string; name: string; quantity: number; unitPrice: number }>;
}
