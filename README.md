# 🌐 BRICS InfraAI — Digital Public Infrastructure Intelligence Platform

[![Hackathon](https://img.shields.io/badge/BRICS%20Infrastructure%20AI-Hackathon%202026-blue?style=for-the-badge)](https://brics-infra-ai.dev)
[![Track](https://img.shields.io/badge/Track-Smart%20Cities%20%26%20Digital%20Governance-green?style=for-the-badge)]()
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%201.5%20Pro-orange?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%2020-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?style=for-the-badge&logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

---

## 🏛️ Problem Statement

Across BRICS+ nations, government infrastructure budgets often fail to reach the citizens who need them most. Issues include:

- **Budget black holes**: Districts receive crores in allocations yet utilization stays below 50%, while citizens file thousands of complaints.
- **Language barriers**: Citizens can only report in local languages; officials only read English summaries.
- **Siloed data**: Budget data, demographic data, infrastructure indices, and citizen complaints live in separate government portals with no cross-linking.
- **Slow triage**: Without AI, a district collector takes days to identify that a road-budget mismatch is driving complaint surges.

**BRICS InfraAI** solves this by creating a unified AI intelligence layer that **ingests citizen reports in any language, cross-references government budget and infrastructure data, and surfaces actionable hotspots to decision-makers in real time.**

---

## 💡 Solution Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                    BRICS InfraAI — System Architecture              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  CITIZEN INPUT LAYER                                                 ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    ║
║  │ Telegram │  │WhatsApp  │  │ Web Form │  │  Voice (IVRS)    │    ║
║  │   Bot    │  │  Bot     │  │  (PWA)   │  │  IVR → STT       │    ║
║  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘    ║
║       └─────────────┴─────────────┴─────────────────┘              ║
║                              │                                       ║
║                    ┌─────────▼─────────┐                            ║
║                    │  Ingestion Layer   │                            ║
║                    │  (Node.js + GCP)   │                            ║
║                    └─────────┬─────────┘                            ║
║                              │                                       ║
║            ╔═════════════════▼═══════════════════╗                  ║
║            ║       GEMINI AI CORE ENGINE          ║                  ║
║            ║  ┌─────────────────────────────┐    ║                  ║
║            ║  │  1. Language Detection &     │    ║                  ║
║            ║  │     Multilingual Translation │    ║                  ║
║            ║  │  (hi/ta/bn/te/ru/pt → EN)   │    ║                  ║
║            ║  └──────────────┬──────────────┘    ║                  ║
║            ║  ┌──────────────▼──────────────┐    ║                  ║
║            ║  │  2. Report Classification   │    ║                  ║
║            ║  │   Category / Urgency 1-5 /  │    ║                  ║
║            ║  │   Sentiment / Population     │    ║                  ║
║            ║  └──────────────┬──────────────┘    ║                  ║
║            ║  ┌──────────────▼──────────────┐    ║                  ║
║            ║  │  3. Cross-Reference Analysis │    ║                  ║
║            ║  │   Reports ↔ Budget Data  ↔  │    ║                  ║
║            ║  │   Infra Index ↔ Demographic  │    ║                  ║
║            ║  └──────────────┬──────────────┘    ║                  ║
║            ║  ┌──────────────▼──────────────┐    ║                  ║
║            ║  │  4. Hotspot Detection        │    ║                  ║
║            ║  │   Critical Budget Mismatch   │    ║                  ║
║            ║  │   Complaint Spike Detection  │    ║                  ║
║            ║  └──────────────┬──────────────┘    ║                  ║
║            ╚══════════════════╪═══════════════════╝                  ║
║                              │                                       ║
║            ┌─────────────────┼─────────────────┐                    ║
║            ▼                 ▼                 ▼                    ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐          ║
║  │  DASHBOARD   │  │  ALERTS API  │  │  SUMMARY PDF     │          ║
║  │  (React +    │  │  (REST/WH)   │  │  Auto-Generated  │          ║
║  │  Map Viz)    │  │  for Govt.   │  │  District Report │          ║
║  └──────────────┘  └──────────────┘  └──────────────────┘          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **AI Core** | Google Gemini 1.5 Pro | Multilingual NLP, classification, cross-referencing |
| **Speech-to-Text** | Google Cloud STT (multi-language) | Voice report ingestion |
| **Translation** | Gemini built-in multilingual | 7+ language support |
| **Backend** | Node.js 20 + Express | REST API, report processing pipeline |
| **Frontend** | React 19 + Vite | Interactive dashboard |
| **Map Visualization** | Leaflet.js / Google Maps API | District hotspot map |
| **Charts** | Recharts | Budget vs. complaint analytics |
| **Database** | Firestore (GCP) / JSON (demo mode) | Report + budget storage |
| **Auth** | Firebase Auth | Govt. dashboard login |
| **Containerization** | Docker + Docker Compose | Easy deployment |
| **CI/CD** | GitHub Actions | Automated testing |
| **Hosting** | GCP Cloud Run | Scalable backend |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional, for containerized run)

### Option A: Demo Mode (No API Keys Needed)

This mode uses pre-loaded mock data — perfect for evaluation and local development.

```bash
# 1. Clone the repository
git clone https://github.com/your-team/brics-infra-ai.git
cd brics-infra-ai

# 2. Install backend dependencies
cd backend
npm install

# 3. Start backend in demo mode
DEMO_MODE=true npm start
# Backend runs at http://localhost:3001

# 4. In a new terminal, install and start frontend
cd ../frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

### Option B: Full Mode (With Real APIs)

```bash
# 1. Clone and configure environment
git clone https://github.com/your-team/brics-infra-ai.git
cd brics-infra-ai
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# 2. Start with Docker Compose
docker-compose up --build

# Or start manually:
cd backend && npm install && npm start &
cd ../frontend && npm install && npm run dev
```

### Option C: Docker Only (Backend)

```bash
docker-compose up --build
# Backend: http://localhost:3001
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root. Copy from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes (full mode) | Google AI Studio API key | `AIza...` |
| `GOOGLE_CLOUD_PROJECT` | Optional | GCP project ID for Firestore/STT | `my-brics-project` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | Path to GCP service account JSON | `./gcp-key.json` |
| `TELEGRAM_BOT_TOKEN` | Optional | For Telegram ingestion bot | `123456:ABC...` |
| `PORT` | Optional | Backend server port | `3001` |
| `DEMO_MODE` | Optional | Set `true` to use mock data | `true` |
| `NODE_ENV` | Optional | `development` or `production` | `development` |
| `DATA_DIR` | Optional | Path to mock JSON data files | `./data` |

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key to your `.env` file

> **Free Tier**: Gemini 1.5 Pro offers a generous free tier (60 requests/minute) — more than sufficient for hackathon demos.

---

## 📡 API Documentation

Base URL: `http://localhost:3001/api`

### Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reports` | List all processed reports |
| `GET` | `/reports/:id` | Get single report by ID |
| `POST` | `/reports/analyze` | Submit new report for AI analysis |
| `GET` | `/reports/district/:districtId` | Reports filtered by district |
| `GET` | `/reports/category/:category` | Reports by category (Roads/Water/Power/Healthcare/Education) |

#### POST `/reports/analyze` — Request Body

```json
{
  "text": "सड़क पर बहुत बड़ा गड्ढा है",
  "inputType": "text",
  "userId": "telegram_user_402",
  "pincode": "411001"
}
```

#### POST `/reports/analyze` — Response

```json
{
  "report_id": "req_051",
  "timestamp": "2026-09-28T21:41:00Z",
  "source_language_detected": "hi-IN",
  "translated_english_text": "There is a very large pothole on the road",
  "district": "Pune Central",
  "gemini_analysis": {
    "category": "Roads",
    "urgency": 4,
    "key_issue": "large pothole road damage",
    "sentiment": "Frustrated",
    "affected_population_estimate": "High",
    "infrastructure_type": "Physical"
  },
  "status": "processed"
}
```

### Hotspots

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/hotspots` | All active hotspots |
| `GET` | `/hotspots/critical` | Only Critical Budget Mismatch hotspots |
| `GET` | `/hotspots/:districtId` | Hotspot detail for a district |

#### GET `/hotspots/critical` — Response

```json
{
  "critical_hotspots": [
    {
      "district": "Lucknow West",
      "alert_type": "CRITICAL_BUDGET_MISMATCH",
      "road_complaints_90d": 3412,
      "road_budget_allocated_lakhs": 310,
      "road_budget_utilized_percent": 99,
      "composite_infrastructure_index": 41,
      "citizen_satisfaction_score": 17,
      "recommendation": "Immediate emergency budget release required. Road budget exhausted with 28 pending projects."
    }
  ]
}
```

### Budget & Demographics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/budgets` | All district budgets |
| `GET` | `/budgets/:districtId` | Budget for a specific district |
| `GET` | `/demographics` | State-level demographic data |
| `GET` | `/infrastructure` | Infrastructure indices for all districts |
| `GET` | `/summary` | AI-generated cross-referenced summary |

---

## 📸 Screenshots

> _Dashboard and visualization screenshots coming soon. Run locally to see the live dashboard._

| Screen | Description |
|---|---|
| 🗺️ Hotspot Map | Color-coded district map — red = Critical Mismatch, yellow = Warning, green = OK |
| 📊 Budget Analysis | Bar chart comparing allocated vs. utilized budgets per category |
| 📝 Report Feed | Live feed of incoming citizen reports with AI analysis tags |
| 🔍 District Drill-down | Detailed view: budget, complaints, infra index, AI recommendations |
| 📈 Trend Analysis | 6-month complaint trend vs. budget utilization overlay |

---

## 🏆 Hackathon Track Information

**Event**: BRICS Infrastructure AI Hackathon 2026
**Track**: Smart Cities & Digital Governance — AI for Public Infrastructure
**Problem Domain**: Government Budget Transparency + Multilingual Citizen Engagement

### Key Innovation Points

1. **Multilingual AI Pipeline**: Single Gemini call handles language detection, translation, classification, and urgency scoring — all in real-time.
2. **Critical Budget Mismatch Detection**: Novel algorithm cross-references complaint density, budget utilization, and infrastructure indices to surface districts where funds are not reaching citizens.
3. **BRICS Applicability**: Supports Russian (`ru-RU`) and Portuguese (`pt-BR`) out of the box, making it directly deployable in Brazil and Russia BRICS member states.
4. **Zero-infrastructure Demo Mode**: Entire platform runs from JSON files — no database required for evaluation.

---

## 🏗️ Project Structure

```
brics-infra-ai/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── services/
│   │   │   ├── geminiService.js    # Gemini AI integration
│   │   │   ├── reportService.js    # Report processing pipeline
│   │   │   ├── hotspotService.js   # Hotspot detection algorithm
│   │   │   └── dataService.js      # JSON data loading
│   │   ├── middleware/         # Auth, logging, error handling
│   │   └── index.js            # Express app entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # React 19 + Vite dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── HotspotMap/     # Leaflet district map
│   │   │   ├── ReportFeed/     # Live report stream
│   │   │   ├── BudgetChart/    # Budget analytics
│   │   │   └── DistrictCard/   # District detail panel
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
├── data/                       # Mock government datasets
│   ├── district_budgets.json   # Budget allocations (10 districts)
│   ├── demographic_data.json   # State demographics (10 states)
│   ├── infrastructure_indices.json  # Quality indices (10 districts)
│   └── sample_reports.json     # 50 processed citizen reports
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 👥 Team

| Name | Role | Contact |
|---|---|---|
| _Team Member 1_ | AI/ML & Gemini Integration | - |
| _Team Member 2_ | Backend (Node.js API) | - |
| _Team Member 3_ | Frontend (React Dashboard) | - |
| _Team Member 4_ | Data & Government API Research | - |

---

## 📜 Data Sources & Attribution

| Dataset | Source | License |
|---|---|---|
| District budget data | Ministry of Road Transport & Highways (data.gov.in) | NLOD |
| Demographic data | Census of India 2021 | Government Open Data |
| Infrastructure indices | NITI Aayog Composite Infrastructure Index | Government Open Data |
| Citizen reports | Synthetic (for demo, based on real complaint patterns) | N/A |

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

*Built with ❤️ for the BRICS Infrastructure AI Hackathon 2026 — bridging the gap between government budgets and citizen needs.*
