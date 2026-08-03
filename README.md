# SupplySense — Enterprise AI Supply Chain Decision Support System

SupplySense is a production-ready, multi-agent AI supply chain decision support platform. It integrates real-time database tools, vector-based enterprise knowledge search, specialized operational agents, reasoning agents, and a LangGraph Supervisor orchestrator to evaluate inventory health, shipment delays, supplier risks, and demand forecasts.

---

## 🏛️ Architecture & System Topology

```
                                    [ USER QUERY ]
                                          │
                                          ▼
                                 [ Router Node ]
                            (Intent & Agent Selection)
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  │ (Parallel Execution Layer: Data & RAG) │
                  ▼                       ▼                       ▼
           [Inventory Node]       [Shipment Node]          [RAG Node] ...
                  │                       │                       │
                  └───────────────────────┼───────────────────────┘
                                          │
                                          ▼
                               (Sequential Synthesis)
                                  [Risk Node]
                                          │
                                          ▼
                               [Executive Node]
                                          │
                                          ▼
                                   [Merger Node]
                            (Synthesis & Deduplication)
                                          │
                                          ▼
                                [SupervisorResponse]
```

### AI Agent Inventory (7 total)
1. **Inventory Agent** (`backend.app.ai.agents.inventory`): Evaluates low stock, dead stock, and inventory turnover.
2. **Shipment Agent** (`backend.app.ai.agents.shipment`): Tracks active shipments, carrier delays, and logistics bottlenecks.
3. **Supplier Agent** (`backend.app.ai.agents.supplier`): Analyzes supplier reliability, lead times, and vendor ratings.
4. **Forecast Agent** (`backend.app.ai.agents.forecast`): Predicts future product demand, seasonal spikes, and sales velocity.
5. **Risk Agent** (`backend.app.ai.agents.risk`): Synthesizes cross-domain operational risks and priority actions.
6. **Executive Agent** (`backend.app.ai.agents.executive`): Formats multi-agent findings into a 2-minute C-suite business summary.
7. **RAG Knowledge Agent** (`backend.app.ai.agents.rag`): Searches company policies, SOPs, and contracts using Qdrant.

---

## 🛠️ Virtual Environment Setup

### 1. Windows PowerShell
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Windows Command Prompt (CMD)
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

### 3. Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. macOS
```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 📦 Dependency Installation

After activating your virtual environment, install the required packages:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 🚀 Running the FastAPI Server

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your `GROQ_API_KEY`, `DATABASE_URL`, and `QDRANT_URL`.
3. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
4. Access Interactive API Docs:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

---

## 📁 Project Folder Structure

```
SupplySense/
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
├── pyproject.toml
├── main.py
├── alembic.ini
├── models.py
├── backend/
│   └── app/
│       ├── api/               # API Controllers & Endpoints
│       ├── config/            # Pydantic Settings & Environment Config
│       │   └── settings.py
│       ├── database/          # SQLAlchemy 2.0 Async Engine & Sessions
│       │   └── database.py
│       ├── models/            # SQLAlchemy Database Models
│       ├── repositories/      # Database Data Access Repositories
│       ├── schemas/           # Pydantic DTOs & Validation Schemas
│       ├── services/          # Core Business Logic Services
│       ├── utils/             # Loguru Logger & Utility Functions
│       │   └── logger.py
│       └── ai/                # AI Agents & Multi-Agent Architecture
│           ├── core/          # Factory Placeholders (LLM, Embeddings, VectorStore)
│           │   ├── llm_factory.py
│           │   ├── embeddings.py
│           │   └── qdrant.py
│           ├── tools/         # Database Tool Layer Functions
│           ├── agents/        # Specialized AI Agents
│           │   ├── inventory/
│           │   ├── shipment/
│           │   ├── supplier/
│           │   ├── forecast/
│           │   ├── risk/
│           │   ├── executive/
│           │   └── rag/
│           ├── supervisor/    # LangGraph StateGraph Supervisor Engine
│           ├── prompts/       # Shared AI System Prompts
│           ├── state/         # Agent State Management
│           └── memory/        # Conversation Memory Drivers
├── tests/                     # Pytest Unit & Integration Suite
├── logs/                      # Application Log Files
├── scripts/                   # Migration & Maintenance Scripts
└── docs/                      # Technical Documentation
```

---

## 🛣️ Future Roadmap

- [ ] **LangGraph Checkpointing**: Add Redis or PostgreSQL checkpointer to persist multi-turn graph state.
- [ ] **Qdrant Document Ingestion Pipeline**: Build automated CLI script for chunking and embedding company SOP PDF documents into Qdrant.
- [ ] **WebSocket Streaming**: Stream real-time node execution steps to frontend dashboards.
- [ ] **Role-Based Access Control (RBAC)**: Secure executive summary and procurement escalation actions.
