# Warehouse Operations Standard Operating Procedure

**Document ID**: SSE-WH-SOP-001  
**Version**: 1.0  
**Status**: Approved  
**Effective Date**: 2025-01-15  
**Review Date**: 2026-01-15  
**Document Owner**: Logistics & Warehouse Operations  
**Approval Authority**: Head of Supply Chain Operations  
**Target Enterprise**: SupplySense Electronics Pvt. Ltd.  

---

## 1. Purpose
This Standard Operating Procedure (SOP) details the mandatory protocols for warehouse receiving, product verification, damaged goods quarantine, inventory bin put-away, and stock adjustments across all SupplySense Electronics distribution centers.

## 2. Scope
Applies to warehouse supervisors, receiving clerks, quality control inspectors, and inventory leads operating at WH-AHM-01, WH-MUM-01, WH-DEL-01, WH-BLR-01, and WH-HYD-01.

## 3. Goods Receiving Workflow
All inbound carrier shipments must strictly follow the 10-step receiving sequence:

| Step # | Stage | Operational Description | Responsible Role |
|---|---|---|---|
| 1 | Shipment Arrival | Carrier gate check, dock assignment, physical seal verification. | Gate Security / Dock Clerk |
| 2 | Doc Verification | Verify Lorry Receipt (LR), Packing List, and PO Document. | Receiving Clerk |
| 3 | PO Verification | Validate active PO status in SupplySense system. | Receiving Clerk |
| 4 | Quantity Verification | Outer carton box count vs carrier consignment note. | Warehouse Operator |
| 5 | Product Verification | Unbox cartons, verify SKU, Brand, Model, and barcode labels. | Receiving Inspector |
| 6 | Quality Inspection | Inspect outer product packaging for moisture, crushing, or tampering. | QC Inspector |
| 7 | Serial Verification | Scan individual IMEI / Serial Numbers for Laptops, Phones, & Tablets. | Receiving Clerk |
| 8 | Goods Received Note | System entry of received quantities; generate Goods Received Note (GRN). | Warehouse Supervisor |
| 9 | Inventory Update | System automatically updates quantity_on_hand and available_quantity. | System / ERP |
| 10 | Storage Put-away | Move accepted inventory to assigned warehouse Bin storage locations. | Forklift / Put-away Team |

## 4. Discrepancy & Damaged Goods Handling Protocol
4.1 Damaged Goods Protocol: Upon identifying physical damage, moisture exposure, or broken seals, the inspector must immediately (a) take high-resolution photographic evidence, (b) segregate items into the designated Warehouse Quarantine Bin, (c) mark item status as 'Damaged' in GRN, and (d) issue a Supplier Damage Notice within 24 hours.  
4.2 Short Shipment: If delivered quantity is less than PO quantity, the receiving clerk logs actual received count on GRN. The PO remains in 'Partially Delivered' status.  
4.3 Excess Shipment: If delivered quantity exceeds PO quantity, excess stock is held in Receiving Staging. Quantities exceeding PO by > 2% are rejected and sent back on carrier vehicle unless approved by Procurement Manager.  
4.4 Wrong Product Delivered: Unordered SKUs are tagged 'Unidentified Stock' and placed in Quarantine. Notification is dispatched to Procurement immediately.

## 5. Bin Assignment & Stock Movements
5.1 Bin Strategy: High-velocity Fast Moving SKUs (e.g. Smartwatches, Earbuds) are assigned to Ground Floor Pick Bins near shipping bays. High-value SKUs (Laptops, Smartphones) are assigned to Secured Cage Bins.  
5.2 Stock Transfer Protocol: Inter-warehouse transfers between WH-MUM-01 and WH-DEL-01 require a Stock Transfer Order (STO) and dual dispatch-receiving sign-off.

## 6. Cycle Counting & Inventory Accuracy
6.1 Perpetual Cycle Counting: Warehouses execute daily perpetual cycle counts covering 5% of active SKUs per day, ensuring 100% warehouse coverage monthly.  
6.2 Adjustment Threshold: Physical count variances under ₹5,000 are adjusted by Warehouse Manager. Variance above ₹5,000 requires Internal Audit review.
