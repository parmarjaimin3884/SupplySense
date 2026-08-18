# Inventory Management and Control Policy

**Document ID**: SSE-INV-POL-001  
**Version**: 1.0  
**Status**: Approved  
**Effective Date**: 2025-01-15  
**Review Date**: 2026-01-15  
**Document Owner**: Inventory Management Department  
**Approval Authority**: Chief Operations Officer (COO)  
**Target Enterprise**: SupplySense Electronics Pvt. Ltd.  

---

## 1. Objectives & Governance
This policy establishes enterprise standards for maintaining optimal stock levels, calculating replenishment reorder points, preventing stockouts, controlling carrying costs, and managing obsolete/dead inventory across SupplySense distribution networks.

## 2. Inventory Velocity Classification
Products are categorized based on sales velocity, average daily sales (ADS), and inventory movement thresholds:

| Category | Average Daily Sales (ADS) | Movement Criteria | Policy Action |
|---|---|---|---|
| Fast Moving | > 50 units / day | Continuous daily sales movement | Maintain high safety stock; weekly replenishment |
| Normal Moving | 10 – 50 units / day | Regular weekly sales movement | Standard reorder point replenishment |
| Slow Moving | < 10 units / day | Intermittent sales movement | Review monthly; reduce reorder quantities |
| Dead Stock | 0 units / day | No sales movement for 90 consecutive days | Mandatory liquidation / supplier return review |
| Overstock | N/A | Available quantity > (Reorder Level × 3) | Freeze PO creation; initiate stock transfer |
| Stockout | N/A | Available quantity = 0 units | Trigger Emergency Procurement / Priority PO |

## 3. Mathematical Reorder Point & Replenishment Logic
3.1 Reorder Point Formula: Inventory replenishment is evaluated continuously using the standardized reorder point mathematical formula:  
**Reorder Point (ROP) = (Expected Demand During Lead Time) + Safety Stock**  
Where: Expected Demand During Lead Time = (Average Daily Sales × Supplier Lead Time in Days).  
3.2 Reorder Execution: When available_quantity (quantity_on_hand minus reserved_quantity) reaches or drops below the calculated ROP, an automated inventory risk alert is generated to trigger purchase requisition.

## 4. Safety Stock Calculation & Risk Factors
4.1 Standard Buffer: Safety stock is calculated to cushion against demand spikes and vendor delays.  
4.2 Mandated Higher Safety Stock Drivers: Higher safety stock buffer (up to 50% increase) is mandatory under the following operational conditions:  
- **High Demand Volatility**: Product categories with coefficient of variation > 30%.  
- **Long Supplier Lead Time**: Lead times exceeding 30 calendar days.  
- **Supplier Unreliability**: Supplier reliability score < 70% as per SSE-SUP-POL-001.  
- **Seasonal Spikes**: Q4 festival peak season (Diwali / Year-end sales).  
- **Critical Revenue SKUs**: Top 20 revenue-generating Laptops and Smartphones.

## 5. Inventory Valuation & Stock Adjustments
5.1 Valuation Method: Inventory is valued at Weighted Average Cost (WAC).  
5.2 Write-off Thresholds: Stock write-offs due to damage, expiry, or theft under ₹25,000 require Inventory Lead approval. Write-offs exceeding ₹25,000 require CFO sign-off.
