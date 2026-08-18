# Purchase Order Lifecycle Standard Operating Procedure

**Document ID**: SSE-PO-SOP-001  
**Version**: 1.0  
**Status**: Approved  
**Effective Date**: 2025-01-15  
**Review Date**: 2026-01-15  
**Document Owner**: Procurement Operations & ERP Administration  
**Approval Authority**: Procurement Manager  
**Target Enterprise**: SupplySense Electronics Pvt. Ltd.  

---

## 1. Purpose
This SOP defines the end-to-end operational lifecycle, mandatory status transitions, and exception protocols for Purchase Orders (POs) issued by SupplySense Electronics.

## 2. Standard Purchase Order Lifecycle
All purchase orders must transition sequentially through the following 12 lifecycle stages:

| Stage # | Lifecycle Event | System Status | Trigger / Action Description |
|---|---|---|---|
| 1 | Requisition | Draft | PR created by inventory planner or reorder trigger. |
| 2 | Internal Approval | Pending Approval | Routed to financial approval authority per SSE-PROC-POL-001. |
| 3 | Authorization | Approved | Formal sign-off by approval authority in ERP. |
| 4 | Transmission | Sent | PO dispatched to vendor via EDI / Email. |
| 5 | Confirmation | Supplier Confirmed | Vendor accepts PO terms and confirms delivery date within 48 hrs. |
| 6 | Processing | In Progress | Vendor initiates manufacturing / allocation. |
| 7 | Partial Shipping | Partially Delivered | First consignment shipped; GRN logged for partial quantity. |
| 8 | Full Shipping | Dispatched | Complete shipment handed over to logistics carrier. |
| 9 | Receiving | Delivered | Shipment arrives at warehouse; physical GRN completed. |
| 10 | Matching | Invoicing | Accounts Payable verifies 3-Way Match (PO + GRN + Invoice). |
| 11 | Payment | Closed | Final payment disbursed to vendor; PO closed. |
| 12 | Termination | Cancelled | PO cancelled prior to dispatch due to breach or mutual consent. |

## 3. Delay Management & Delivery Date Monitoring
3.1 Delivery Tracking: Every PO specifies an Expected Delivery Date. The system automatically tracks delay_days = (Actual Delivery Date minus Expected Delivery Date).  
3.2 Escalation Thresholds:  
- **1 – 3 Days Delay**: Automated reminder sent to vendor contact.  
- **4 – 7 Days Delay**: Warning Notice issued; Procurement Specialist contacts vendor management.  
- **> 7 Days Delay**: Critical Delay Escalation. Procurement Manager evaluates PO cancellation or emergency sourcing.

## 4. PO Amendments & Quantity Deviations
4.1 Quantity Variance: Deviations within ±1% due to bulk packaging are accepted. Deviations exceeding 1% require PO Amendment.  
4.2 Cancellation Rules: Unfulfilled POs pending for > 15 days past expected delivery date without vendor extension request are subject to automatic cancellation.
