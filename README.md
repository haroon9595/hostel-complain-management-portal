# 🏢 Hostel Complaint Management Portal

An enterprise-grade, real-time Hostel Complaint & Maintenance Management System connecting **Next.js 14+ (App Router)** frontend, **FastAPI** backend, **Supabase PostgreSQL** database, and **n8n** webhook automation.

---

## 🌟 Key Features

- **📊 Live Analytics Dashboard**: Dynamic weekly trends, categories breakdown, hostel density heatmap, and staff workload balancer with real-time Supabase metrics.
- **⚡ Interactive Ticket Drawer**: Real-time ticket inspection, instant status mutations (Pending $\rightarrow$ In Progress $\rightarrow$ Resolved), staff reassignment, internal timestamped private notes, and chronological audit trails.
- **📑 Full Complaints Portal**: Multi-filter data table (search by student name, roll number, or description; filter by hostel, category, status, priority) with inline status updates.
- **👥 Staff & RT Management**: Directory of Resident Tutors (RTs) and maintenance staff with live workload counters and direct WhatsApp / Slack contact actions.
- **🏛️ Hostels & Rooms Directory**: Multi-hostel management with room allocation tracking, active ticket counts, and nested room directory.
- **🔔 n8n Automation Webhook**: Asynchronous background webhook notifications dispatched automatically on complaint status updates.

---

## 🏗️ Architecture

```
hostel_complain_system/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py           # REST APIs, Analytics & Webhook Engine
│   │   ├── database.py       # SQLAlchemy Database Connection Engine
│   │   ├── schemas.py        # Pydantic V2 Schemas
│   │   └── models/           # SQLAlchemy Database Models
│   ├── .env.example          # Backend Environment Template
│   └── requirements.txt      # Python Dependencies
│
└── frontend/                 # Next.js 14 App Router Frontend
    ├── src/
    │   ├── app/              # App Router Pages (/, /complaints, /staff, /hostels)
    │   ├── components/       # UI Components, Charts, Tables & Drawers
    │   ├── context/          # Sidebar & Global State Context
    │   └── lib/              # API Client & TypeScript Interfaces
    ├── .env.example          # Frontend Environment Template
    └── package.json          # Node Dependencies & Scripts
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set your DATABASE_URL and optional N8N_STATUS_WEBHOOK_URL

# Start the FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start Next.js dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Instructions

### Deploying Frontend to Vercel

1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Configure Environment Variables in Vercel Project Settings:
   - `NEXT_PUBLIC_API_URL`: Your deployed FastAPI backend URL (e.g. `https://your-backend.railway.app` or `https://your-backend.onrender.com`).
5. Click **Deploy**.

---

### Deploying Backend (Railway / Render / Docker)

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string (e.g. Supabase)
  - `N8N_STATUS_WEBHOOK_URL`: (Optional) Webhook URL for status updates

---

## 🔒 Security & Privacy

- All sensitive connection strings and environment keys are loaded strictly from environment variables (`.env`).
- `.env`, `.env.local`, credentials, bytecode caches, and node_modules are excluded via `.gitignore`.
