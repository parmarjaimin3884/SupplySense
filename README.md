# SupplySense 🌐⚡
### Enterprise AI Supply Chain Risk & Inventory Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6F00?style=flat&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20DB-4169E1?style=flat&logo=postgresql&logoColor=white)](https://neon.tech)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20Search-DC2626?style=flat&logo=qdrant&logoColor=white)](https://qdrant.tech)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Overview

**SupplySense** is a next-generation, autonomous decision-support platform designed to solve modern supply chain vulnerabilities—from unseen stockouts and shipping bottlenecks to supplier delays and demand volatility.

Built for enterprise retailers and distributors, SupplySense sits as an **AI neural layer** on top of enterprise ERP systems. It uses a **7-Agent LangGraph Multi-Agent System**, vector-based RAG knowledge retrieval, real-time database telemetry, and predictive transformer models to evaluate inventory health, simulate supply threats, auto-draft purchase orders, and deliver instant executive summaries.

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────┐
                               │   Next.js 16 Frontend   │
                               │   (React 19, Tailwind)  │
                               └────────────┬────────────┘
                                            │ HTTP / REST
                                            ▼
                               ┌─────────────────────────┐
                               │     FastAPI Gateway     │
                               │  (Auth, Telemetry, API) │
                               └────────────┬────────────┘
                                            │
                        ┌───────────────────┴───────────────────┐
                        ▼                                       ▼
             ┌─────────────────────┐                 ┌─────────────────────┐
             │   PostgreSQL DB     │                 │    Redis Cache      │
             │ (Inventory, POs,    │                 │ (Sessions, Stream,  │
             │  Shipments, Users)  │                 │  Alert Buffers)     │
             └─────────────────────┘                 └─────────────────────┘
                                            │
                                            ▼
                     ┌─────────────────────────────────────────────┐
                     │       LangGraph Multi-Agent Supervisor       │
                     └──────────────────────┬──────────────────────┘
                                            │
         ┌───────────────────┬──────────────┼──────────────┬───────────────────┐
         ▼                   ▼              ▼              ▼                   ▼
  [Inventory Agent]  [Shipment Agent] [Supplier Agent] [Forecast Agent]   [RAG Node]
   Stockouts & Reorder   GPS Telematics    SLA & On-Time   Predictive Sales    Qdrant Policies
         │                   │              │              │                   │
         └───────────────────┴──────────────┼──────────────┴───────────────────┘
                                            ▼
                                  [Risk Analysis Node]
                               (3x3 Likelihood vs Impact)
                                            ▼
                                [Executive Briefing Node]
                                 (2-Minute C-Suite Brief)
                                            ▼
                                   [Merger / Response]
```

---

## ✨ Key Features & Capabilities

### 🤖 1. Autonomous Multi-Agent AI (LangGraph)
- **Supervised Orchestration**: A dynamic router evaluates user queries and delegates parallel execution across specialized operational and reasoning agents.
- **7 Specialized AI Agents**:
  1. **Inventory Agent**: Evaluates stock health, turnover rate, critical stockouts, and excess/dead stock.
  2. **Shipment Agent**: Monitors active freight, logistics bottlenecks, port congestion, and carrier delays.
  3. **Supplier Agent**: Calculates SLA compliance, historical reliability, vendor ratings, and lead times.
  4. **Forecast Agent**: Predicts 30–90 day demand horizons with confidence intervals and seasonality spikes.
  5. **Risk Agent**: Synthesizes cross-domain threats into an actionable 3x3 risk matrix (Likelihood vs. Impact).
  6. **Executive Agent**: Distills complex multi-agent analysis into concise, 2-minute decision memos for leadership.
  7. **RAG Knowledge Agent**: Queries contracts, standard operating procedures (SOPs), and supplier policies using **Qdrant** vector search.

### 📊 2. Real-Time Command Center & Dashboards
- **Executive KPIs**: Track Inventory Health Index, Delayed Inbound Shipments, Supplier Reliability, and At-Risk Revenue.
- **Interactive Risk Radar**: Visual threat matrix highlighting high-impact supply disruptions.
- **Telemetry Alarms**: Background monitor automatically sweeps ERP thresholds every 15 seconds to trigger live alerts.

### 📦 3. Stock & Inventory Management
- Real-time visibility across multi-warehouse locations.
- Automated reorder recommendations with calculated safety margins.
- Inter-warehouse transfer planner to balance overstocked and understocked depots.

### 🚢 4. Freight & In-Transit Telematics
- End-to-end status tracking for ocean, air, and ground shipments.
- Automated delay detection, route congestion analysis, and revised ETA calculations.

### 🤝 5. Supplier Intelligence & SLA Tracking
- Vendor performance grading (Preferred, Moderate, High Risk).
- Lead-time trend evaluation and contract compliance auditing.

### 📝 6. Automated Procurement & Purchase Orders
- One-click PO generation directly from inventory deficit recommendations.
- Multi-tier PO approval workflow with audit logs and status tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, **TanStack React Query v5**, **Lucide Icons**, **Zustand**, **Axios** |
| **Backend** | **FastAPI**, **Python 3.11+**, **Pydantic v2**, **SQLAlchemy 2.0** (Asyncio / Asyncpg), **Uvicorn**, **Loguru** |
| **AI & Multi-Agent** | **LangGraph**, **LangChain**, **Groq** (`llama-3.3-70b-versatile`), **OpenAI** (`gpt-4o`), **Qdrant Vector DB**, **HuggingFace Embeddings** (`all-MiniLM-L6-v2`) |
| **Databases & Cache** | **PostgreSQL** (Neon Serverless PostgreSQL), **Redis** |
| **DevOps & Infrastructure** | **Docker**, **Docker Compose**, **AWS EC2**, **Bash / Batch Automation Scripts** |

---

## 📂 Project Structure

```text
SupplySense/
├── SupplySense_Backend/          # FastAPI Backend & Multi-Agent Core
│   ├── backend/
│   │   └── app/
│   │       ├── ai/               # LangGraph Supervisor, Agents, Prompts, RAG Tools
│   │       ├── api/v1/           # REST Endpoints (Dashboard, Shipments, Inventory, AI)
│   │       ├── config/           # Pydantic Settings & Environment Loaders
│   │       ├── database/         # Async SQLAlchemy 2.0 Engine & Sessions
│   │       ├── models/           # ORM Entities (Products, Suppliers, Shipments, POs)
│   │       ├── repositories/     # Data Access Repositories
│   │       ├── schemas/          # Pydantic Request & Response DTOs
│   │       └── services/         # Alert Monitoring, ERP Sync, Analytics Logic
│   ├── Dockerfile                # Backend Container definition
│   ├── requirements.txt          # Python Dependencies
│   ├── seed_db_users.py          # Initial User & Role Seeder
│   └── main.py                   # FastAPI Application Entrypoint
│
├── SupplySense_Frontend/         # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/                  # App Router Pages (Dashboard, Inventory, Assistant, etc.)
│   │   ├── components/           # Reusable UI & Layout Components
│   │   ├── hooks/                # React Query & Custom Hooks
│   │   ├── stores/               # Zustand Global State Stores
│   │   └── types/                # TypeScript Interface Definitions
│   ├── Dockerfile                # Frontend Production Container definition
│   └── package.json              # NPM Dependencies & Scripts
│
├── docker-compose.yml            # Multi-container orchestration (Frontend + Backend)
├── run-docker-local.bat          # 1-Click Local Docker launcher for Windows
├── deploy-ec2.sh                 # 1-Click AWS EC2 deployment script (with Swap Memory)
├── deploy-to-ec2.bat             # Remote update & deploy script via SSH/SCP
└── README.md                     # Project Documentation
```

---

## 🚀 Getting Started

You can run SupplySense either with **Docker** (recommended) or by running the backend and frontend **locally**.

### Prerequisites
- **Git** installed
- **Docker & Docker Compose** (for containerized setup)
- **Python 3.11+** (for manual backend setup)
- **Node.js 20+ & npm** (for manual frontend setup)

---

### Option A: 🐳 Run with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/parmarjaimin3884/SupplySense.git
   cd SupplySense
   ```

2. **Configure Environment Variables:**
   - Copy backend example configuration:
     ```bash
     cp SupplySense_Backend/.env.example SupplySense_Backend/.env
     ```
   - Provide your database URL and API keys (`GROQ_API_KEY` or `OPENAI_API_KEY`, `DATABASE_URL`, etc.).

3. **Start the containers:**
   - On **Windows**:
     ```cmd
     run-docker-local.bat
     ```
   - Or using **Docker Compose**:
     ```bash
     docker compose up -d --build
     ```

4. **Access the application:**
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API & Health**: [http://localhost:8000/health](http://localhost:8000/health)
   - **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: 💻 Manual Local Development Setup

#### 1. Backend Setup (FastAPI)

```bash
cd SupplySense_Backend

# Create and activate virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy .env configuration
cp .env.example .env
# Edit .env with your credentials

# Seed default database accounts (optional)
python seed_db_users.py

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be active at `http://localhost:8000`.

#### 2. Frontend Setup (Next.js)

Open a new terminal window:

```bash
cd SupplySense_Frontend

# Install dependencies
npm install

# Create local environment config
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > .env.local

# Run Next.js in development mode
npm run dev
```

Frontend will be active at `http://localhost:3000`.

---

## 🔐 Default Demo Credentials

If you populated the database using `seed_db_users.py`, you can log in with:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` / `admin@supplysense.io` | `admin123` |
| **Admin** | `jai123` / `jai123@gmail.com` | `admin123` |
| **Manager** | `manager` / `manager@supplysense.io` | `manager123` |

---

## 📡 API Reference Overview

Interactive documentation is available at `/docs` (Swagger UI) and `/redoc` (ReDoc) when running the backend in development mode:

| Route Prefix | Description |
| :--- | :--- |
| `/api/v1/auth` | JWT Token creation, user authentication, and profile retrieval |
| `/api/v1/assistant` | Multi-agent LangGraph orchestrator endpoint & RAG query stream |
| `/api/v1/dashboard` | Executive telemetry, real-time KPI metrics, and system alert summary |
| `/api/v1/inventory` | SKU stock tracking, safety buffers, stockouts, and categorizations |
| `/api/v1/shipments` | In-transit freight tracking, delay classification, and carrier telematics |
| `/api/v1/suppliers` | Vendor scorecard, SLA compliance %, lead times, and risk ratings |
| `/api/v1/forecast` | Predictive transformer demand forecasts and seasonal variance models |
| `/api/v1/risks` | 3x3 Operational Risk Matrix, disruption probability, and impact scores |
| `/api/v1/purchase-orders` | Automated PO creation, approval workflows, and status tracking |
| `/api/v1/transfers` | Inter-depot stock transfer planning and warehouse balance requests |
| `/api/v1/executive` | C-Suite automated 2-minute decision briefings and memo synthesis |

---

## ☁️ Deployment on AWS EC2

SupplySense is pre-configured for cost-effective deployment on AWS EC2 (including Free Tier `t2.micro` instances):

1. Launch an Ubuntu 22.04 / 24.04 LTS EC2 instance.
2. Ensure inbound Security Group ports are open: `22` (SSH), `80` / `3000` (Frontend), and `8000` (Backend API).
3. Run the automated deployment script on the instance:
   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```
   *The script automatically allocates a 2GB swap partition to prevent out-of-memory crashes on t2.micro instances, installs Docker, detects your public IP, and builds the containers.*

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
