# CivicLens — Member 2: Backend, Database & Analytics Platform

CivicLens transforms complex government budget data into accessible, explainable insights using a deterministic financial data layer and automated anomaly detection engine built with FastAPI and Supabase PostgreSQL.

---

## 🚀 Quick Start Guide

### 1. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Install requirements
pip install -r requirements.txt
```

### 2. Running the FastAPI Backend Server
```bash
# Start development server
uvicorn app.main:app --reload --port 8000
```
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### 3. Running Pytest Test Suite
```bash
pytest tests/
```

---

## 📊 Core Endpoints Summary (Member 2 Specification)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/dashboard` | Aggregated budget metrics, YoY trends, top spenders, anomaly counts |
| `GET` | `/api/departments` | List all departments with total budget summaries |
| `GET` | `/api/schemes` | List schemes (optional filter by `department_id`) |
| `GET` | `/api/budgets` | Filterable raw budget line items (year, department, locality, category) |
| `GET` | `/api/anomalies` | List detected anomalies (filter by `severity`, `department_id`, `year`) |
| `GET` | `/api/compare` | Multi-year historical trend & YoY breakdown (`compare_years()`) |
| `POST` | `/api/upload` | Ingest budget CSV records with validation & auto-anomaly trigger |
| `POST` | `/api/analyze` | Manually trigger deterministic anomaly engine |
| `POST` | `/api/investigations` | Interface for Member 3/4 to store AI investigation results |

---

## 🛡️ Deterministic Anomaly Engine Rules

1. **YoY Spending Spike**:
   - Moderate: `+20% <= YoY < +40%` (`severity = MODERATE`)
   - High: `YoY >= +40%` (`severity = HIGH`)
2. **YoY Spending Drop**:
   - Moderate: `-40% < YoY <= -20%` (`severity = MODERATE`)
   - High: `YoY <= -40%` (`severity = HIGH`)
3. **Over-budget Expenditure**:
   - Ratio $V = \text{Actual} / \text{Budget} > 1.5$ (over 50% overbudget).
4. **New Allocation**:
   - Previous year zero spend with current positive allocation.
5. **Multi-Year Trend Deviation**:
   - $+50\%$ deviation from 3-year moving average baseline.
