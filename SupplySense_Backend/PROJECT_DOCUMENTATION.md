# Official Software Documentation & Specification Manual

## Project Name: SupplySense – AI Supply Chain Risk & Inventory Intelligence

---

## 📑 Table of Contents
1. [Executive Summary & Abstract](#1-executive-summary--abstract)
2. [System Architecture & Technology Stack](#2-system-architecture--technology-stack)
3. [Functional Requirements Specification (FRS)](#3-functional-requirements-specification-frs)
4. [Data Simulation Engine Architecture (`dummyData.js` & `mockApi.js`)](#4-data-simulation-engine-architecture-dummydatajs--mockapijs)
5. [Real-World Enterprise Integration Blueprint (Croma / SAP / ERP)](#5-real-world-enterprise-integration-blueprint-croma--sap--erp)
6. [Page-by-Page Component & Function Index](#6-page-by-page-component--function-index)
7. [Faculty Presentation & Viva Q&A Script](#7-faculty-presentation--viva-qa-script)

---

## 1. Executive Summary & Abstract

### 1.1 Abstract
**SupplySense** is an enterprise-grade, AI-powered Supply Chain Risk and Inventory Intelligence platform designed for large-scale multi-brand electronics retailers (e.g., Croma, Reliance Digital, Apple Retail). The system unifies real-time inventory tracking, vendor SLA performance analytics, in-transit ocean/air freight GPS tracking, transformer-based predictive demand forecasting, and natural language Retrieval-Augmented Generation (RAG) contract intelligence into a single, cohesive command center.

### 1.2 Problem Statement
Traditional enterprise supply chains suffer from:
- **Unseen Stockouts**: Retail stores run out of high-demand items (e.g., 65" 4K Smart TVs, Pro Laptops) during seasonal spikes without advance warning.
- **Supply Bottlenecks**: Geopolitical customs delays or port congestion cause shipment holds without automated rerouting recommendations.
- **Capital Bloat & Holding Costs**: Warehouses suffer from uneven stock distribution—one depot experiences 92% capacity overflow while another remains underutilized at 60%.
- **Manual Purchase Orders**: Slow, error-prone manual PO approval workflows increase lead times.

### 1.3 System Solution
SupplySense addresses these challenges by acting as a **predictive AI neural layer**. It classifies stock levels in real-time, projects demand 30–90 days ahead with 95% confidence intervals, visualizes supply threats via a **3x3 Likelihood vs. Impact Risk Matrix**, auto-drafts Purchase Orders, and allows executives to query ERP ledgers using plain natural language.

---

## 2. System Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPPLYSENSE FRONTEND                           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     React 19 & Router DOM v6                     │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │                   Global Context API Store                       │  │
│  │  (SupplyChainContext | AuthContext | NotificationContext | Theme)│  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │               Master CSS Architecture (app.css)                  │  │
│  │  (CSS Variables | Glassmorphism | Flexbox | CSS Grid | Radius)    │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │                     Recharts Visualization                       │  │
│  │  (Area | Line | Bar | Pie | Radar | SVG Risk Gauge | Heatmap)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   MOCK REST SERVICE & DATA ENGINE                      │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  mockApi.js (Axios REST Layer)                   │  │
│  │   • Simulated 300ms Cloud Latency                                │  │
│  │   • Search, Filtering, Sorting & Pagination Engine               │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │               dummyData.js (Simulation Engine)                   │  │
│  │   • 500 Electronics SKUs (Smart TVs, Laptops, Phones, Servers)  │  │
│  │   • 100 Vendors & SLA Reliability Algorithms                     │  │
│  │   • 50 Distribution Hubs & Spatial Capacity Metrics            │  │
│  │   • Telematics GPS Tracking & 3x3 Threat Matrix Data             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Core Technologies
- **UI Framework**: React 19 (Functional Components, Custom Hooks, React.memo).
- **Routing**: React Router DOM v6 (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `ProtectedRoute`).
- **State Management**: React Context API (`SupplyChainContext`, `AuthContext`, `NotificationContext`, `ThemeContext`).
- **HTTP/Service Layer**: Axios-backed service (`mockApi.js`) with simulated async network latency.
- **Data Visualization**: Recharts (Area, Line, Bar, Pie, Radar charts), custom SVG Risk Gauge, and Heatmaps.
- **Icons & Motion**: React Icons (`react-icons/fi`), Framer Motion micro-interactions.
- **Styling Architecture**: **100% Pure Common CSS** (`src/styles/app.css`) using CSS Variables, Clamp typography, Backdrop Filter Glassmorphism, 18px border radius, and CSS Grid/Flexbox layouts.

---

## 3. Functional Requirements Specification (FRS)

| Requirement ID | Module Name | Functional Description | Technical Implementation |
| :--- | :--- | :--- | :--- |
| **FR-01** | User Authentication | Validate corporate user credentials, persist login session across page refreshes, provide Google & Microsoft SSO UI. | `AuthContext.jsx`, `LoginPage.jsx`, `localStorage` (`supplysense_user`, `supplysense_auth`). |
| **FR-02** | Executive Dashboard | Display real-time telemetry KPI cards (Inventory Health, Risk Index, Delayed Shipments, Revenue Impact) & AI summary. | `DashboardPage.jsx`, `StatCard.jsx`, `ChartCard.jsx`, Recharts Area/Line/Bar charts. |
| **FR-03** | Electronics Inventory | Manage 500+ SKUs across 7 categories (Smart TVs, Laptops, Phones, Smartwatches, Audio, Cameras, Servers). | `InventoryPage.jsx`, `Table.jsx`, search box, status dropdowns (`LOW_STOCK`, `CRITICAL`), SKU detail `Drawer.jsx`. |
| **FR-04** | Vendor SLA Intelligence | Track 100+ suppliers by quality ratings, lead time, on-time delivery %, and risk score. | `SuppliersPage.jsx`, tier filter tabs (Preferred, Moderate, High Risk), supplier slide-out drawer. |
| **FR-05** | Freight GPS Tracking | Track live ocean and air freight shipments with delay alerts, carrier status, and ETA calculation. | `ShipmentsPage.jsx`, simulated GPS radar canvas, transit `Timeline.jsx`. |
| **FR-06** | Predictive Demand Forecast | Predict 12-month product consumption curves using machine learning forecasting. | `DemandForecastPage.jsx`, Recharts AreaChart with 95% Confidence Interval band. |
| **FR-07** | Autonomous Procurement | Auto-generate purchase order drafts for depleted stock with cost estimates & vendor recommendations. | `ProcurementPage.jsx`, interactive PO table with `Approve PO` and `Reject` workflow triggers. |
| **FR-08** | Threat Matrix & Risk Gauge | Compute composite risk score out of 100 and map threats into a visual 3x3 matrix. | `RiskCenterPage.jsx`, animated SVG `Gauge.jsx`, 3x3 Likelihood vs Impact grid, Root Cause Analysis. |
| **FR-09** | Warehouse Rebalancing | Monitor 50+ hub storage utilization % and suggest inter-depot stock transfers. | `WarehousesPage.jsx`, `ProgressRing.jsx` capacity monitors, stock transfer prescription triggers. |
| **FR-10** | RAG Neural Knowledge Base | Execute natural language vector queries over indexed contracts, customs manifests, and ERP ledgers. | `KnowledgeBasePage.jsx`, `AiAssistant.jsx`, prompt chat, dropzone upload area, source citations. |
| **FR-11** | Supply Chain Analytics | Provide multi-chart analytics for vendor SLA radar scores and category capital allocation. | `AnalyticsPage.jsx`, Recharts RadarChart & horizontal BarChart, period filters (30D, 90D, YTD). |
| **FR-12** | Executive Reports & Export | Digest platform metrics into board briefings and trigger PDF / Excel data exports. | `ReportsPage.jsx`, PDF / Excel export triggers, 256-bit hash timestamp. |

---

## 4. Data Simulation Engine Architecture (`dummyData.js` & `mockApi.js`)

To simulate a live enterprise cloud environment without requiring an external backend during offline demonstrations, SupplySense uses a mathematical data generator and an asynchronous mock REST API.

### 4.1 Electronics SKU Generation Algorithm (`generateProducts`)
Inside `src/services/dummyData.js`, `generateProducts(500)` uses mathematical functions to create 500 varied electronics products across 7 categories:

```javascript
// Stock Distribution Formula
const stock = (i * 37 + 120) % 4500;
```

#### Status Classification Logic:
- **`CRITICAL` (Stock < 200 units)**: Simulates severe shortages (e.g. only 15, 45, or 120 items left). Triggers red alert badges and urgent reorder flags.
- **`LOW_STOCK` (Stock < 500 units)**: Below minimum safety threshold. Automatically queues a Purchase Order Draft on the Procurement page.
- **`OPTIMAL` (500 ≤ Stock ≤ 3,800 units)**: Healthy inventory levels.
- **`OVERSTOCK` (Stock > 3,800 units)**: Storage surplus. Triggers AI inter-warehouse transfer recommendations.
- **`EXPIRED` (`i % 19 === 0`)**: Defective or warranty-expired units.

#### Valuation & Pricing Logic:
```javascript
unitPrice = Number(((i * 24.5) % 1800 + 199.99).toFixed(2));
totalValue = Number((stockQuantity * unitPrice).toFixed(2));
```
- Pricing dynamically ranges from **$199.99** (Earbuds/Smartwatches) to **$1,999.99** (65" Smart TVs, Server Racks).
- Multiplies `stockQuantity * unitPrice` to compute real-time dollar valuations across the platform.

### 4.2 Asynchronous REST Service Layer (`mockApi.js`)
`mockApi.js` wraps datasets in an Axios-like service interface with simulated cloud latency:

```javascript
// Simulated Network Delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
```

- **State Persistence**: Modifications (e.g., approving a PO, marking notifications as read) update the in-memory cache live.
- **Search, Filter & Pagination Engine**: Filters products dynamically by search text, status, category, and sorts by stock ascending/descending or valuation.

---

## 5. Real-World Enterprise Integration Blueprint (Croma / SAP / ERP)

If a retail chain like **Croma**, **Reliance Digital**, or **Apple Retail** adopts SupplySense, the system integrates via a 4-Tier Enterprise API Gateway:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      REAL-WORLD ENTERPRISE FEEDS                       │
│                                                                        │
│  1. Croma POS & Store ERP (SAP S/4HANA / Oracle SCM)                   │
│     └─► Sends live billing data & stock depletion rates via Webhooks.  │
│                                                                        │
│  2. Warehouse Management Systems (WMS & RFID / Barcode Scanners)       │
│     └─► Sends real-time spatial utilization & inward stock receipts.   │
│                                                                        │
│  3. Supplier Portals (Samsung, LG, Sony, Apple, Dell)                  │
│     └─► Sends PO acknowledgments, factory lead times & SLA metrics.    │
│                                                                        │
│  4. Ocean & Air Freight Telematics (Maersk, DHL, BlueDart, FedEx APIs)  │
│     └─► Sends live GPS vessel coordinates & port customs clearance.    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ (REST APIs & JSON Webhooks)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SUPPLYSENSE ENGINE                            │
│                                                                        │
│   • Aggregates all 4 data streams into one Unified Command Center      │
│   • Executes AI Transformer models for 30–90 day demand forecasting    │
│   • Plots 3x3 Threat Matrix for port congestion & supplier defaults    │
│   • Auto-drafts POs before Croma stores run out of Smart TVs/Laptops   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Page-by-Page Component & Function Index

| Page Name | Main File Path | Associated Components | Core Functions & Purpose |
| :--- | :--- | :--- | :--- |
| **Login** | `src/pages/Login/LoginPage.jsx` | `FcGoogle`, `FaMicrosoft`, `FiLock` | `handleSubmit()`, `handleSocialLogin()`. Handles auth session creation. |
| **Dashboard** | `src/pages/Dashboard/DashboardPage.jsx` | `StatCard`, `ChartCard`, `RiskBadge`, `Loader` | `useSupplyChain()`. Renders Executive KPI grid, Recharts trends, and live activity stream. |
| **Inventory** | `src/pages/Inventory/InventoryPage.jsx` | `Table`, `StatusChip`, `Pagination`, `SearchBox`, `Select`, `Heatmap`, `Drawer` | `fetchInventory()`, `onRowClick()`. Filters 500+ electronics SKUs and triggers PO drafts in drawer. |
| **Suppliers** | `src/pages/Suppliers/SuppliersPage.jsx` | `SearchBox`, `StatusChip`, `Drawer`, `Loader` | `fetchSuppliers()`. Evaluates 100+ vendor SLA ratings, on-time delivery %, and lead times. |
| **Shipments** | `src/pages/Shipments/ShipmentsPage.jsx` | `Table`, `StatusChip`, `SearchBox`, `Timeline`, `Loader` | `fetchShipments()`. Renders GPS tracking radar, transit timeline, and delay warnings. |
| **Demand Forecast** | `src/pages/DemandForecast/DemandForecastPage.jsx` | `ChartCard`, `StatCard`, Recharts AreaChart | Evaluates 12-month demand curve with 95% Confidence Interval band and top sellers. |
| **Procurement** | `src/pages/Procurement/ProcurementPage.jsx` | `Table`, `StatusChip`, `RiskBadge` | `handleApprove()`, `handleReject()`. Manages automated purchase order approval workflows. |
| **Risk Center** | `src/pages/RiskCenter/RiskCenterPage.jsx` | `Gauge`, `StatCard`, `RiskBadge`, `ChartCard` | Renders SVG Risk Gauge, 3x3 Likelihood vs Impact Matrix, and Root Cause Analysis. |
| **Warehouses** | `src/pages/Warehouses/WarehousesPage.jsx` | `ProgressRing`, `ChartCard`, `Loader` | `suggestStockTransfer()`. Monitors spatial capacity and recommends inter-warehouse transfers. |
| **Knowledge Base** | `src/pages/KnowledgeBase/KnowledgeBasePage.jsx` | `AiAssistant`, prompt form, dropzone | `handleAsk()`. Executes RAG vector queries over indexed contracts with source citations. |
| **Analytics** | `src/pages/Analytics/AnalyticsPage.jsx` | `ChartCard`, `Select`, Recharts RadarChart | Visualizes vendor SLA radar scores and category spend allocation across 30D/90D/YTD. |
| **Reports** | `src/pages/Reports/ReportsPage.jsx` | `StatCard`, download triggers | `handleExport('pdf')`, `handleExport('excel')`. Generates downloadable reports with hash timestamps. |
| **Notifications** | `src/pages/Notifications/NotificationsPage.jsx` | `RiskBadge`, filter tabs | `markAsRead()`, `addToast()`. Manages severity alerts (Critical, High, Medium, Low). |
| **Settings** | `src/pages/Settings/SettingsPage.jsx` | `Input`, `Button`, `Select`, tab buttons | `handleSave()`. Configures user profile, enterprise settings, security, and API keys. |

---

## 7. Faculty Presentation & Viva Q&A Script

### 7.1 60-Second Project Pitch
> *"Respected Faculty, my project is titled **SupplySense – AI Supply Chain Risk & Inventory Intelligence**. It is an enterprise SaaS platform built using React 19, Context API, Recharts, and custom CSS architecture for major electronics retailers like Croma or Reliance Digital."*
> 
> *"SupplySense solves critical supply chain challenges by unifying real-time inventory tracking across 500+ electronics SKUs, 100+ suppliers, and 50+ distribution hubs. It incorporates predictive demand forecasting with 95% confidence intervals, a visual 3x3 Threat Matrix for risk management, automated Purchase Order generation, and a natural language RAG Copilot for querying contracts and ERP ledgers."*

### 7.2 Top 5 Examiner Q&A

**Q1: How are stock levels and low stock alerts categorized in your system?**
> *"Our data generator classifies products based on safety thresholds: items under 200 units are categorized as CRITICAL (triggering red alert badges), items under 500 units are LOW_STOCK (triggering automated Purchase Order drafts), and items over 3,800 units are OVERSTOCK (triggering warehouse transfer recommendations)."*

**Q2: How does the RAG Knowledge Base function?**
> *"The Knowledge Base provides Retrieval-Augmented Generation (RAG). Users can ask questions like 'What is our financial exposure on TV delays?' The AI executes similarity search over indexed PDF contracts, customs manifests, and ERP ledgers, returning a structured summary with document source citations."*

**Q3: How did you implement styling without external UI frameworks like Tailwind or MUI?**
> *"We built a 100% custom modular CSS architecture using a single master stylesheet (`app.css`). It utilizes CSS Variables for theme tokens, Clamp() for fluid typography, Flexbox & CSS Grid for responsive layouts, and Backdrop Filter for glassmorphism."*

**Q4: How does the application simulate real-time cloud APIs?**
> *"Our service layer (`mockApi.js`) wraps datasets in an Axios-backed interface with 300ms simulated cloud latency promises. Any user action—such as approving a PO, filtering inventory, or marking notifications as read—updates the in-memory state live across the entire application."*

**Q5: What is the significance of the 3x3 Risk Matrix in the Risk Center?**
> *"The 3x3 Threat Matrix maps risks across Likelihood (Low, Medium, High) and Impact Severity. This allows supply chain managers to prioritize high-severity threats—such as port customs holds on high-value laptop shipments—and execute prescribed AI remediation playbooks."*
