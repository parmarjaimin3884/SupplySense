"""
SupplySense Electronics Pvt. Ltd. — Enterprise Policy & SOP PDF Generator
Generates six professional internal knowledge base documents for RAG system ingestion.

Documents Created:
  1. procurement_policy.pdf       (SSE-PROC-POL-001)
  2. warehouse_sop.pdf            (SSE-WH-SOP-001)
  3. inventory_policy.pdf          (SSE-INV-POL-001)
  4. supplier_policy.pdf           (SSE-SUP-POL-001)
  5. purchase_order_sop.pdf        (SSE-PO-SOP-001)
  6. emergency_procurement.pdf     (SSE-EMG-POL-001)
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY


def create_pdf_stylesheet():
    styles = getSampleStyleSheet()

    primary_color = colors.HexColor('#0F172A')   # Navy / Dark Slate
    secondary_color = colors.HexColor('#1E40AF') # Deep Blue
    accent_color = colors.HexColor('#334155')    # Slate Gray
    body_color = colors.HexColor('#1E293B')      # Dark Charcoal

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=8,
        alignment=TA_LEFT
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=accent_color,
        spaceAfter=15,
        alignment=TA_LEFT
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=secondary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_color,
        spaceAfter=6,
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=body_color,
        alignment=TA_LEFT
    )

    meta_key_style = ParagraphStyle(
        'MetaKey',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=primary_color
    )

    meta_val_style = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=body_color
    )

    return {
        'title': title_style,
        'subtitle': subtitle_style,
        'h1': h1_style,
        'h2': h2_style,
        'body': body_style,
        'bullet': bullet_style,
        'table_header': table_header_style,
        'table_cell': table_cell_style,
        'meta_key': meta_key_style,
        'meta_val': meta_val_style
    }


def build_metadata_table(doc_meta, st):
    data = [
        [
            Paragraph("Document Title:", st['meta_key']),
            Paragraph(doc_meta['title'], st['meta_val']),
            Paragraph("Document ID:", st['meta_key']),
            Paragraph(doc_meta['doc_id'], st['meta_val'])
        ],
        [
            Paragraph("Version:", st['meta_key']),
            Paragraph(doc_meta['version'], st['meta_val']),
            Paragraph("Status:", st['meta_key']),
            Paragraph(doc_meta['status'], st['meta_val'])
        ],
        [
            Paragraph("Effective Date:", st['meta_key']),
            Paragraph(doc_meta['effective_date'], st['meta_val']),
            Paragraph("Review Date:", st['meta_key']),
            Paragraph(doc_meta['review_date'], st['meta_val'])
        ],
        [
            Paragraph("Document Owner:", st['meta_key']),
            Paragraph(doc_meta['owner'], st['meta_val']),
            Paragraph("Approval Authority:", st['meta_key']),
            Paragraph(doc_meta['authority'], st['meta_val'])
        ]
    ]

    t = Table(data, colWidths=[1.3*inch, 2.2*inch, 1.3*inch, 2.2*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t


def build_table(headers, rows, col_widths, st):
    table_data = [[Paragraph(h, st['table_header']) for h in headers]]
    for r in rows:
        row_cells = []
        for cell in r:
            row_cells.append(Paragraph(str(cell), st['table_cell']))
        table_data.append(row_cells)

    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F1F5F9')]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t


def add_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica-Bold', 8)
    canvas.setFillColor(colors.HexColor('#64748B'))
    canvas.drawString(0.75*inch, 10.5*inch, "SUPPLYSENSE ELECTRONICS PVT. LTD. — INTERNAL CONTROL DOCUMENT")
    canvas.setStrokeColor(colors.HexColor('#CBD5E1'))
    canvas.setLineWidth(0.5)
    canvas.line(0.75*inch, 10.42*inch, 7.75*inch, 10.42*inch)

    page_num = canvas.getPageNumber()
    canvas.setFont('Helvetica', 8)
    canvas.drawString(0.75*inch, 0.45*inch, "CONFIDENTIAL — FOR INTERNAL USE ONLY")
    canvas.drawRightString(7.75*inch, 0.45*inch, f"Page {page_num}")
    canvas.line(0.75*inch, 0.55*inch, 7.75*inch, 0.55*inch)
    canvas.restoreState()


# ===========================================================================
# DOCUMENT CONTENT GENERATORS
# ===========================================================================

def generate_procurement_policy(st):
    meta = {
        'title': 'SupplySense Electronics Procurement Policy',
        'doc_id': 'SSE-PROC-POL-001',
        'version': '1.0',
        'status': 'Approved',
        'effective_date': '2025-01-15',
        'review_date': '2026-01-15',
        'owner': 'Procurement Department',
        'authority': 'Board of Directors / Finance Committee'
    }

    elements = [
        Paragraph("SupplySense Electronics Procurement Policy", st['title']),
        Paragraph("Enterprise Standard Operating Guideline & Financial Governance Framework", st['subtitle']),
        build_metadata_table(meta, st),
        Spacer(1, 12),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1E3A8A'), spaceAfter=12),
    ]

    sections = [
        ("1. Purpose", [
            "The purpose of this Procurement Policy is to establish a rigorous, transparent, and standardized framework for acquiring goods, services, and inventory for SupplySense Electronics Pvt. Ltd. It ensures cost optimization, ethical vendor relationships, audit compliance, and risk mitigation across all consumer electronics distribution channels."
        ]),
        ("2. Scope", [
            "This policy applies to all employees, department heads, procurement specialists, and executive officers involved in purchasing decisions, vendor selection, purchase requisition, and purchase order authorization across all SupplySense business units and distribution centers (including WH-AHM-01, WH-MUM-01, WH-DEL-01, WH-BLR-01, and WH-HYD-01)."
        ]),
        ("3. Definitions", [
            "• Purchase Requisition (PR): An internal document initiated by a department requesting procurement of goods or services.",
            "• Purchase Order (PO): A legally binding commercial document issued by SupplySense to a Supplier committing to pay for specified products under agreed terms.",
            "• Three-Way Matching: Verification protocol comparing Purchase Order, Goods Received Note (GRN), and Supplier Invoice prior to payment release.",
            "• Approved Supplier List (ASL): Qualified vendors meeting technical, financial, and compliance criteria registered in SupplySense systems."
        ]),
        ("4. Procurement Governance & Approval Matrix", [
            "All purchase commitments must adhere strictly to the authorized financial authorization matrix based on total purchase order value in INR (₹):"
        ])
    ]

    for title, paras in sections:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    # Table for Approval Matrix
    headers = ["Purchase Order Value Threshold (INR)", "Primary Approval Authority", "Secondary / Co-Signer", "Required Quotations"]
    rows = [
        ["Below ₹50,000", "Department Manager", "N/A", "1 Vendor Quote"],
        ["₹50,000 – ₹2,00,000", "Procurement Manager", "Department Head", "2 Competitive Quotes"],
        ["₹2,00,000 – ₹5,00,000", "Procurement Head", "Finance Controller", "3 Written Quotes"],
        ["Above ₹5,00,000", "Finance Head", "Authorized Business Head / CEO", "3 Formal Bids / RFP"]
    ]
    elements.append(build_table(headers, rows, [2.0*inch, 1.8*inch, 1.7*inch, 1.5*inch], st))
    elements.append(Spacer(1, 10))

    sections_2 = [
        ("5. Supplier Selection & Quotation Requirements", [
            "5.1 Minimum Quotations: For purchases exceeding ₹50,000, procurement officers must obtain competitive written quotations from registered vendors on the Approved Supplier List (ASL).",
            "5.2 Vendor Qualification: New suppliers must pass technical audit, legal vetting, and creditworthiness checks before ASL onboarding as per SSE-SUP-POL-001.",
            "5.3 Price Negotiation: Procurement officers are required to negotiate commercial terms including volume discounts, rebates, freight absorption, and extended payment windows."
        ]),
        ("6. Purchase Order Rules & Commercial Terms", [
            "6.1 Mandatory PO Issuance: No goods or services shall be received or paid for without a valid, approved Purchase Order generated in the SupplySense ERP system.",
            "6.2 Standard Commercial Terms: Standard payment terms are Net 30 days or Net 60 days from Goods Received Note (GRN) generation. Early payment discounts (e.g. 2/10 Net 30) should be leveraged where cash flow permits.",
            "6.3 Delivery Terms: Preferred Incoterms are DDP (Delivered Duty Paid) or FOB Destination to SupplySense designated warehouses."
        ]),
        ("7. Three-Way Matching & Payment Approval", [
            "7.1 Discrepancy Tolerance: Accounts Payable will execute Three-Way Matching between PO, GRN, and Vendor Invoice. Price variations exceeding 0.5% or quantity variations exceeding 0% require Procurement Manager approval.",
            "7.2 Discrepancy Resolution: Invoices failing 3-way match are placed on Accounts Payable Hold until a credit note or revised invoice is submitted by the supplier."
        ]),
        ("8. Purchase Order Amendments & Exceptions", [
            "8.1 PO Modification: Any change in unit price, line item quantity, or delivery warehouse requires a formal PO Amendment re-routed through the approval matrix.",
            "8.2 Emergency Exceptions: Purchases under emergency operational risk follow the Emergency Procurement Policy (SSE-EMG-POL-001)."
        ]),
        ("9. Record Retention & Audit", [
            "All procurement records including quotations, approval logs, PO copies, GRNs, and correspondence must be archived for a minimum of 7 fiscal years for internal and external statutory compliance."
        ])
    ]

    for title, paras in sections_2:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    return elements


def generate_warehouse_sop(st):
    meta = {
        'title': 'Warehouse Operations Standard Operating Procedure',
        'doc_id': 'SSE-WH-SOP-001',
        'version': '1.0',
        'status': 'Approved',
        'effective_date': '2025-01-15',
        'review_date': '2026-01-15',
        'owner': 'Logistics & Warehouse Operations',
        'authority': 'Head of Supply Chain Operations'
    }

    elements = [
        Paragraph("Warehouse Operations Standard Operating Procedure", st['title']),
        Paragraph("Standard Operating Procedure for Inbound Receiving, Inspection, Storage & Discrepancy Handling", st['subtitle']),
        build_metadata_table(meta, st),
        Spacer(1, 12),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1E3A8A'), spaceAfter=12),
    ]

    sections = [
        ("1. Purpose", [
            "This Standard Operating Procedure (SOP) details the mandatory protocols for warehouse receiving, product verification, damaged goods quarantine, inventory bin put-away, and stock adjustments across all SupplySense Electronics distribution centers."
        ]),
        ("2. Scope", [
            "Applies to warehouse supervisors, receiving clerks, quality control inspectors, and inventory leads operating at WH-AHM-01, WH-MUM-01, WH-DEL-01, WH-BLR-01, and WH-HYD-01."
        ]),
        ("3. Goods Receiving Workflow", [
            "All inbound carrier shipments must strictly follow the 10-step receiving sequence:"
        ])
    ]

    for title, paras in sections:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    headers = ["Step #", "Stage", "Operational Description", "Responsible Role"]
    rows = [
        ["1", "Shipment Arrival", "Carrier gate check, dock assignment, physical seal verification.", "Gate Security / Dock Clerk"],
        ["2", "Doc Verification", "Verify Lorry Receipt (LR), Packing List, and PO Document.", "Receiving Clerk"],
        ["3", "PO Verification", "Validate active PO status in SupplySense system.", "Receiving Clerk"],
        ["4", "Quantity Verification", "Outer carton box count vs carrier consignment note.", "Warehouse Operator"],
        ["5", "Product Verification", "Unbox cartons, verify SKU, Brand, Model, and barcode labels.", "Receiving Inspector"],
        ["6", "Quality Inspection", "Inspect outer product packaging for moisture, crushing, or tampering.", "QC Inspector"],
        ["7", "Serial Verification", "Scan individual IMEI / Serial Numbers for Laptops, Phones, & Tablets.", "Receiving Clerk"],
        ["8", "Goods Received Note", "System entry of received quantities; generate Goods Received Note (GRN).", "Warehouse Supervisor"],
        ["9", "Inventory Update", "System automatically updates quantity_on_hand and available_quantity.", "System / ERP"],
        ["10", "Storage Put-away", "Move accepted inventory to assigned warehouse Bin storage locations.", "Forklift / Put-away Team"]
    ]
    elements.append(build_table(headers, rows, [0.6*inch, 1.4*inch, 3.5*inch, 1.5*inch], st))
    elements.append(Spacer(1, 10))

    sections_2 = [
        ("4. Discrepancy & Damaged Goods Handling Protocol", [
            "4.1 Damaged Goods Protocol: Upon identifying physical damage, moisture exposure, or broken seals, the inspector must immediately (a) take high-resolution photographic evidence, (b) segregate items into the designated Warehouse Quarantine Bin, (c) mark item status as 'Damaged' in GRN, and (d) issue a Supplier Damage Notice within 24 hours.",
            "4.2 Short Shipment: If delivered quantity is less than PO quantity, the receiving clerk logs actual received count on GRN. The PO remains in 'Partially Delivered' status.",
            "4.3 Excess Shipment: If delivered quantity exceeds PO quantity, excess stock is held in Receiving Staging. Quantities exceeding PO by > 2% are rejected and sent back on carrier vehicle unless approved by Procurement Manager.",
            "4.4 Wrong Product Delivered: Unordered SKUs are tagged 'Unidentified Stock' and placed in Quarantine. Notification is dispatched to Procurement immediately."
        ]),
        ("5. Bin Assignment & Stock Movements", [
            "5.1 Bin Strategy: High-velocity Fast Moving SKUs (e.g. Smartwatches, Earbuds) are assigned to Ground Floor Pick Bins near shipping bays. High-value SKUs (Laptops, Smartphones) are assigned to Secured Cage Bins.",
            "5.2 Stock Transfer Protocol: Inter-warehouse transfers between WH-MUM-01 and WH-DEL-01 require a Stock Transfer Order (STO) and dual dispatch-receiving sign-off."
        ]),
        ("6. Cycle Counting & Inventory Accuracy", [
            "6.1 Perpetual Cycle Counting: Warehouses execute daily perpetual cycle counts covering 5% of active SKUs per day, ensuring 100% warehouse coverage monthly.",
            "6.2 Adjustment Threshold: Physical count variances under ₹5,000 are adjusted by Warehouse Manager. Variance above ₹5,000 requires Internal Audit review."
        ])
    ]

    for title, paras in sections_2:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    return elements


def generate_inventory_policy(st):
    meta = {
        'title': 'Inventory Management and Control Policy',
        'doc_id': 'SSE-INV-POL-001',
        'version': '1.0',
        'status': 'Approved',
        'effective_date': '2025-01-15',
        'review_date': '2026-01-15',
        'owner': 'Inventory Management Department',
        'authority': 'Chief Operations Officer (COO)'
    }

    elements = [
        Paragraph("Inventory Management and Control Policy", st['title']),
        Paragraph("Stock Level Optimization, Reorder Logic, Safety Stock Calculation & Velocity Categorization", st['subtitle']),
        build_metadata_table(meta, st),
        Spacer(1, 12),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1E3A8A'), spaceAfter=12),
    ]

    sections = [
        ("1. Objectives & Governance", [
            "This policy establishes enterprise standards for maintaining optimal stock levels, calculating replenishment reorder points, preventing stockouts, controlling carrying costs, and managing obsolete/dead inventory across SupplySense distribution networks."
        ]),
        ("2. Inventory Velocity Classification", [
            "Products are categorized based on sales velocity, average daily sales (ADS), and inventory movement thresholds:"
        ])
    ]

    for title, paras in sections:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    headers = ["Category", "Average Daily Sales (ADS)", "Movement Criteria", "Policy Action"]
    rows = [
        ["Fast Moving", "> 50 units / day", "Continuous daily sales movement", "Maintain high safety stock; weekly replenishment"],
        ["Normal Moving", "10 – 50 units / day", "Regular weekly sales movement", "Standard reorder point replenishment"],
        ["Slow Moving", "< 10 units / day", "Intermittent sales movement", "Review monthly; reduce reorder quantities"],
        ["Dead Stock", "0 units / day", "No sales movement for 90 consecutive days", "Mandatory liquidation / supplier return review"],
        ["Overstock", "N/A", "Available quantity > (Reorder Level × 3)", "Freeze PO creation; initiate stock transfer"],
        ["Stockout", "N/A", "Available quantity = 0 units", "Trigger Emergency Procurement / Priority PO"]
    ]
    elements.append(build_table(headers, rows, [1.1*inch, 1.5*inch, 2.2*inch, 2.2*inch], st))
    elements.append(Spacer(1, 10))

    sections_2 = [
        ("3. Mathematical Reorder Point & Replenishment Logic", [
            "3.1 Reorder Point Formula: Inventory replenishment is evaluated continuously using the standardized reorder point mathematical formula:",
            "<b>Reorder Point (ROP) = (Expected Demand During Lead Time) + Safety Stock</b>",
            "Where: Expected Demand During Lead Time = (Average Daily Sales × Supplier Lead Time in Days).",
            "3.2 Reorder Execution: When available_quantity (quantity_on_hand minus reserved_quantity) reaches or drops below the calculated ROP, an automated inventory risk alert is generated to trigger purchase requisition."
        ]),
        ("4. Safety Stock Calculation & Risk Factors", [
            "4.1 Standard Buffer: Safety stock is calculated to cushion against demand spikes and vendor delays.",
            "4.2 Mandated Higher Safety Stock Drivers: Higher safety stock buffer (up to 50% increase) is mandatory under the following operational conditions:",
            "  • High Demand Volatility: Product categories with coefficient of variation > 30%.",
            "  • Long Supplier Lead Time: Lead times exceeding 30 calendar days.",
            "  • Supplier Unreliability: Supplier reliability score < 70% as per SSE-SUP-POL-001.",
            "  • Seasonal Spikes: Q4 festival peak season (Diwali / Year-end sales).",
            "  • Critical Revenue SKUs: Top 20 revenue-generating Laptops and Smartphones."
        ]),
        ("5. Inventory Valuation & Stock Adjustments", [
            "5.1 Valuation Method: Inventory is valued at Weighted Average Cost (WAC).",
            "5.2 Write-off Thresholds: Stock write-offs due to damage, expiry, or theft under ₹25,000 require Inventory Lead approval. Write-offs exceeding ₹25,000 require CFO sign-off."
        ])
    ]

    for title, paras in sections_2:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    return elements


def generate_supplier_policy(st):
    meta = {
        'title': 'Supplier Management and Performance Policy',
        'doc_id': 'SSE-SUP-POL-001',
        'version': '1.0',
        'status': 'Approved',
        'effective_date': '2025-01-15',
        'review_date': '2026-01-15',
        'owner': 'Vendor Management & Quality Assurance',
        'authority': 'Head of Procurement & Vendor Relations'
    }

    elements = [
        Paragraph("Supplier Management and Performance Policy", st['title']),
        Paragraph("Supplier Onboarding, Scoring Framework, Risk Classification & Suspension Protocols", st['subtitle']),
        build_metadata_table(meta, st),
        Spacer(1, 12),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1E3A8A'), spaceAfter=12),
    ]

    sections = [
        ("1. Purpose & Objectives", [
            "This policy establishes formal standards for onboarding, evaluating, categorizing, scoring, and managing risk for all hardware manufacturers, OEM suppliers, and component vendors supplying SupplySense Electronics."
        ]),
        ("2. Supplier Performance Scoring Framework", [
            "Supplier performance is evaluated monthly on a 100-point composite scoring model across 5 key performance indicators (KPIs):"
        ])
    ]

    for title, paras in sections:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    headers = ["Evaluation Metric", "Weightage", "Measurement Criteria", "Target Threshold"]
    rows = [
        ["Delivery Performance", "30%", "On-Time In-Full (OTIF) Delivery %", "≥ 95% On-Time"],
        ["Quality Performance", "30%", "Defect Rate % (Rejections at Receiving)", "≤ 1.0% Defect Rate"],
        ["Lead Time Reliability", "20%", "Actual Lead Time vs Agreed Lead Time (Days)", "Variance ≤ 2 Days"],
        ["Commercial Competitiveness", "10%", "Price stability, volume discounts, rebates", "Competitive market pricing"],
        ["Compliance & ESG", "10%", "Regulatory compliance, statutory filing, SLA adherence", "100% SLA Compliance"]
    ]
    elements.append(build_table(headers, rows, [1.5*inch, 0.9*inch, 2.8*inch, 1.8*inch], st))
    elements.append(Spacer(1, 10))

    sections_2 = [
        ("3. Supplier Risk Level Classification", [
            "Based on the monthly composite performance score and operational history, suppliers are classified into four risk categories:"
        ])
    ]

    for title, paras in sections_2:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    headers = ["Risk Level", "Composite Score", "Defect / Delay Thresholds", "Operational Action Required"]
    rows = [
        ["Low Risk", "85 – 100", "Defect < 1%, OTIF ≥ 95%", "Preferred Supplier; eligible for multi-year contracts"],
        ["Medium Risk", "70 – 84", "Defect 1-3%, OTIF 85-94%", "Standard Monitoring; quarterly performance review"],
        ["High Risk", "50 – 69", "Defect 3-5%, OTIF 70-84%, or repeated delays", "Mandatory Corrective Action Plan (CAP); 30-day review"],
        ["Critical Risk", "< 50", "Defect > 5%, OTIF < 70%, or major breach", "Immediate PO Freeze; initiation of supplier replacement"]
    ]
    elements.append(build_table(headers, rows, [1.1*inch, 1.1*inch, 2.3*inch, 2.5*inch], st))
    elements.append(Spacer(1, 10))

    sections_3 = [
        ("4. Supplier Escalation & Suspension Protocol", [
            "4.1 Corrective Action Plan (CAP): High Risk suppliers must submit a binding CAP within 7 working days detailing root cause analysis and resolution milestones.",
            "4.2 Supplier Suspension: Suppliers failing to improve score above 70 within 60 days of CAP issuance are suspended from new PO placement.",
            "4.3 Backup Supplier Activation: For critical product lines (Laptops, Smartwatches), Procurement must maintain at least one dual-sourced Secondary Supplier."
        ])
    ]

    for title, paras in sections_3:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    return elements


def generate_purchase_order_sop(st):
    meta = {
        'title': 'Purchase Order Lifecycle Standard Operating Procedure',
        'doc_id': 'SSE-PO-SOP-001',
        'version': '1.0',
        'status': 'Approved',
        'effective_date': '2025-01-15',
        'review_date': '2026-01-15',
        'owner': 'Procurement Operations & ERP Administration',
        'authority': 'Procurement Manager'
    }

    elements = [
        Paragraph("Purchase Order Lifecycle Standard Operating Procedure", st['title']),
        Paragraph("Complete Lifecycle Management, Status Transitions, Discrepancy & Delay Protocols", st['subtitle']),
        build_metadata_table(meta, st),
        Spacer(1, 12),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1E3A8A'), spaceAfter=12),
    ]

    sections = [
        ("1. Purpose", [
            "This SOP defines the end-to-end operational lifecycle, mandatory status transitions, and exception protocols for Purchase Orders (POs) issued by SupplySense Electronics."
        ]),
        ("2. Standard Purchase Order Lifecycle", [
            "All purchase orders must transition sequentially through the following 12 lifecycle stages:"
        ])
    ]

    for title, paras in sections:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    headers = ["Stage #", "Lifecycle Event", "System Status", "Trigger / Action Description"]
    rows = [
        ["1", "Requisition", "Draft", "PR created by inventory planner or reorder trigger."],
        ["2", "Internal Approval", "Pending Approval", "Routed to financial approval authority per SSE-PROC-POL-001."],
        ["3", "Authorization", "Approved", "Formal sign-off by approval authority in ERP."],
        ["4", "Transmission", "Sent", "PO dispatched to vendor via EDI / Email."],
        ["5", "Confirmation", "Supplier Confirmed", "Vendor accepts PO terms and confirms delivery date within 48 hrs."],
        ["6", "Processing", "In Progress", "Vendor initiates manufacturing / allocation."],
        ["7", "Partial Shipping", "Partially Delivered", "First consignment shipped; GRN logged for partial quantity."],
        ["8", "Full Shipping", "Dispatched", "Complete shipment handed over to logistics carrier."],
        ["9", "Receiving", "Delivered", "Shipment arrives at warehouse; physical GRN completed."],
        ["10", "Matching", "Invoicing", "Accounts Payable verifies 3-Way Match (PO + GRN + Invoice)."],
        ["11", "Payment", "Closed", "Final payment disbursed to vendor; PO closed."],
        ["12", "Termination", "Cancelled", "PO cancelled prior to dispatch due to breach or mutual consent."]
    ]
    elements.append(build_table(headers, rows, [0.6*inch, 1.5*inch, 1.5*inch, 3.4*inch], st))
    elements.append(Spacer(1, 10))

    sections_2 = [
        ("3. Delay Management & Delivery Date Monitoring", [
            "3.1 Delivery Tracking: Every PO specifies an Expected Delivery Date. The system automatically tracks delay_days = (Actual Delivery Date minus Expected Delivery Date).",
            "3.2 Escalation Thresholds:",
            "  • 1 – 3 Days Delay: Automated reminder sent to vendor contact.",
            "  • 4 – 7 Days Delay: Warning Notice issued; Procurement Specialist contacts vendor management.",
            "  • > 7 Days Delay: Critical Delay Escalation. Procurement Manager evaluates PO cancellation or emergency sourcing."
        ]),
        ("4. PO Amendments & Quantity Deviations", [
            "4.1 Quantity Variance: Deviations within ±1% due to bulk packaging are accepted. Deviations exceeding 1% require PO Amendment.",
            "4.2 Cancellation Rules: Unfulfilled POs pending for > 15 days past expected delivery date without vendor extension request are subject to automatic cancellation."
        ])
    ]

    for title, paras in sections_2:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    return elements


def generate_emergency_procurement(st):
    meta = {
        'title': 'Emergency Procurement Policy',
        'doc_id': 'SSE-EMG-POL-001',
        'version': '1.0',
        'status': 'Approved',
        'effective_date': '2025-01-15',
        'review_date': '2026-01-15',
        'owner': 'Executive Risk & Supply Chain Continuity Committee',
        'authority': 'Chief Executive Officer (CEO) & CFO'
    }

    elements = [
        Paragraph("Emergency Procurement Policy", st['title']),
        Paragraph("Fast-Track Procurement Framework for Operational Disruptions, Stockouts & Disasters", st['subtitle']),
        build_metadata_table(meta, st),
        Spacer(1, 12),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1E3A8A'), spaceAfter=12),
    ]

    sections = [
        ("1. Purpose", [
            "This policy establishes fast-track authorization protocols for emergency procurement during severe operational disruptions, supply chain bottlenecks, or sudden stockouts of critical revenue products, while ensuring financial control and post-event accountability."
        ]),
        ("2. Emergency Qualification Criteria", [
            "Emergency procurement protocols MAY ONLY be invoked under one or more of the following explicit conditions:",
            "  • Critical Stockout Risk: Zero stock of Top 20 revenue-generating SKUs impacting customer fulfillment.",
            "  • Primary Supplier Insolvency / Failure: Sudden shutdown or disruption at a primary OEM vendor.",
            "  • Force Majeure & Natural Disasters: Severe weather, flooding, or port strikes halting logistics.",
            "  • Facility Disruption: Fire, power failure, or physical damage at a core warehouse (e.g. WH-MUM-01).",
            "EXCLUSION RULE: Routine delays due to poor inventory planning or late requisition DO NOT qualify as emergency procurement."
        ]),
        ("3. Emergency Approval Matrix", [
            "Emergency procurement bypasses standard multi-quote delays under an accelerated dual-signoff matrix:"
        ])
    ]

    for title, paras in sections:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    headers = ["Emergency Purchase Threshold (INR)", "Authorized Approval Pair", "Processing Time Goal"]
    rows = [
        ["Up to ₹2,00,000", "Procurement Manager + Operations Head", "< 4 Hours"],
        ["Above ₹2,00,000", "Authorized Business Head + Finance Head", "< 8 Hours"]
    ]
    elements.append(build_table(headers, rows, [2.5*inch, 2.7*inch, 1.8*inch], st))
    elements.append(Spacer(1, 10))

    sections_2 = [
        ("4. Expedited Sourcing & Emergency Suppliers", [
            "4.1 Supplier Preference: Sourcing must first target pre-approved Secondary Suppliers from the ASL.",
            "4.2 Non-ASL Fast-Track Onboarding: If no ASL supplier can fulfill requirements, a non-registered supplier may be engaged under an Emergency Provisional License valid for 30 days.",
            "4.3 Expedited Freight: Air freight or express dedicated transport may be authorized by Logistics Head."
        ]),
        ("5. Mandatory Post-Event Review & Audit", [
            "5.1 Post-Event Review: Within 7 calendar days of emergency PO execution, the procurement lead must submit a formal Post-Event Governance Report to the Audit Committee.",
            "5.2 Report Requirements: The report must document (a) Root cause of emergency, (b) Total financial spend, (c) Supplier selected and price variance, (d) Business impact mitigated, and (e) Long-term corrective action to prevent recurrence."
        ])
    ]

    for title, paras in sections_2:
        elements.append(Paragraph(title, st['h1']))
        for p in paras:
            elements.append(Paragraph(p, st['body']))

    return elements


# ===========================================================================
# MAIN GENERATOR CONTROLLER
# ===========================================================================

def build_all_documents():
    st = create_pdf_stylesheet()

    output_dirs = [
        r"c:\SupplySense\knowledge_base"
    ]

    for d in output_dirs:
        os.makedirs(d, exist_ok=True)



    generators = [
        ("procurement_policy.pdf", generate_procurement_policy),
        ("warehouse_sop.pdf", generate_warehouse_sop),
        ("inventory_policy.pdf", generate_inventory_policy),
        ("supplier_policy.pdf", generate_supplier_policy),
        ("purchase_order_sop.pdf", generate_purchase_order_sop),
        ("emergency_procurement.pdf", generate_emergency_procurement),
    ]

    print("============================================================")
    print("Generating SupplySense Enterprise Policy & SOP PDF Documents")
    print("============================================================")

    for filename, gen_func in generators:
        elements = gen_func(st)

        for target_dir in output_dirs:
            filepath = os.path.join(target_dir, filename)
            doc = SimpleDocTemplate(
                filepath,
                pagesize=letter,
                leftMargin=0.75*inch,
                rightMargin=0.75*inch,
                topMargin=0.75*inch,
                bottomMargin=0.75*inch
            )
            doc.build(elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
            print(f"[SUCCESS] Generated: {filepath}")

    print("\nAll 6 PDF Knowledge Documents successfully created and verified.")


if __name__ == "__main__":
    build_all_documents()
