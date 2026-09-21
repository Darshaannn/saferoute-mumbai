# SafeRoute Mumbai — Women's Safety & Emergency Infrastructure Platform

SafeRoute Mumbai is an empirical public safety web platform engineered to empower women, commuters, and travelers across Greater Mumbai. Built for transparency and civic utility, SafeRoute combines official Mumbai Police crime registries, verified emergency infrastructure maps, turn-by-turn road corridor analysis, statutory legal rights guides under the **Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023)**, and rapid emergency tools.

---

## 1. Key Features

- **Empirical Crime Analytics Dashboard**:
  - Interactive comparative analysis of the official Mumbai Police Annual Statistical Registry (Calendar Years 2022 vs 2023).
  - Head-wise statistics: Outraging Modesty (Sec. 354 IPC), Kidnapping, Rape, Domestic Harassment (Sec. 498-A IPC), and POCSO enactments.
  - Zero synthetic risk scores — 100% deterministic, evidence-based metrics with CSV export.
- **Civic Safety & Infrastructure Map**:
  - Interactive OpenStreetMap (Standard & Humanitarian/HOT) visualizing 118+ verified Mumbai Police Stations, municipal hospitals, and transit hubs.
  - Real-time continuous user location tracking with pulsing beacon marker, accuracy radius visualization, and recenter control.
  - Administrative ward boundaries and distance calculations from any selected landmark or live user GPS.
- **Safe Journey Planner**:
  - Turn-by-turn road network routing via **OpenRouteService (ORS)**.
  - Multi-modal corridor evaluations (road cabs, Western/Central suburban trains, Metro lines).
  - **Emergency Infrastructure Coverage Score (0–100)**: Evaluates police proximity and hospital density along the exact corridor.
- **Active Journey Mode & Safety Timer**:
  - Real-time continuous GPS tracking via `navigator.geolocation.watchPosition`.
  - Configurable safety check-in countdown timer.
  - Emergency SOS interface with direct one-tap dialing to **112** (National Emergency), **103** (Mumbai Women Police Cell), **139** (RailMadad Railway Assistance), and **100** (Control Room).
- **Realistic Indian Voice Escape Simulator**:
  - Discreet incoming call simulator for uncomfortable situations.
  - Authentic Mom, Dad, Police (Nirbhaya Cell), and Trip Support personas with natural dialogues in Indian English and Hindi.
  - Multi-tier speech engine: Secure server-side ElevenLabs TTS proxy with in-memory caching and seamless browser Indian SpeechSynthesis (`en-IN` / `hi-IN`) fallback, plus interactive audio sample preview.
- **Mumbai Safety Guide**:
  - Rule-based safety information assistant answering queries on legal rights (Zero FIR under BNSS Sec. 173, sunset arrest safeguards under BNSS Sec. 43(5), free legal aid under Legal Services Authorities Act Sec. 12), transit protocols, and emergency numbers.

---

## 2. Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    SafeRoute Mumbai                     │
├────────────────────────────┬────────────────────────────┤
│     Frontend (Vercel)      │      Backend (Render)      │
│  React 19 + Vite 8         │   Python 3 + Flask         │
│  TailwindCSS (Vanilla CSS) │   OpenRouteService Engine  │
│  React-Leaflet + OSM Tiles │   Photon + OSM Geocoding   │
│  Recharts Analytics        │   Sliding Rate Limiter     │
│  Framer Motion             │   TTL Geocoding & TTS Cache│
└────────────────────────────┴────────────────────────────┘
```

---

## 3. Dataset & Legal Integrity

Detailed information on data provenance and mathematics is available in:
- [`DATA_SOURCES.md`](./DATA_SOURCES.md): Complete list of primary datasets, KML spatial registries, and API sources.
- [`METHODOLOGY.md`](./METHODOLOGY.md): Mathematical definition of Resource Coverage Scoring, routing methodology, and data limitations.

---

## 4. API Endpoints

| Endpoint | Method | Rate Limit | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | — | Service health check and ORS status |
| `/api/crimes/summary` | `GET` | — | City-wide 2022 vs 2023 crime against women summary |
| `/api/police-stations` | `GET` | — | GeoJSON feature collection of 118+ Mumbai police stations |
| `/api/hospitals` | `GET` | — | GeoJSON feature collection of municipal hospitals |
| `/api/maternity-homes` | `GET` | — | GeoJSON feature collection of municipal maternity clinics |
| `/api/zones` | `GET` | — | GeoJSON administrative ward boundaries |
| `/api/geocode?q=<text>` | `GET/POST`| 60/min/IP | Debounced POI geocoding with 10-min in-memory caching |
| `/api/reverse-geocode` | `GET` | 60/min/IP | Coordinate reverse lookup bounded to Mumbai MMR |
| `/api/journey/analyze` | `POST` | 30/min/IP | Real road routing and corridor resource coverage calculation |
| `/api/assistant` | `POST` | 60/min/IP | Rule-based legal rights, helpline, and transit safety guide |
| `/api/tts/synthesize` | `POST` | 30/min/IP | Secure backend TTS synthesis proxy with in-memory audio caching |
| `/api/tts/status` | `GET` | — | TTS proxy status and cache metrics |

---

## 5. Local Development Setup

### Prerequisites
- Node.js (v18+) & npm
- Python 3.10+

### Step 1: Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*Backend runs on `http://127.0.0.1:5000`.*

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 6. Production Deployment

### Backend (Render Web Service)
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Environment Variables**:
  - `ORS_API_KEY`: *(Optional)* OpenRouteService API key for road routing.
  - `ELEVENLABS_API_KEY`: *(Optional)* ElevenLabs API key for ultra-realistic voice synthesis proxy.
  - `ELEVENLABS_MODEL_ID`: *(Optional, default: `eleven_multilingual_v2`)* Model ID.
  - `ELEVENLABS_MOM_VOICE_ID`, `ELEVENLABS_DAD_VOICE_ID`, `ELEVENLABS_POLICE_VOICE_ID`, `ELEVENLABS_SUPPORT_VOICE_ID`: *(Optional)* Custom persona voice IDs.
  - `FLASK_DEBUG`: `false`
  - `PORT`: Automatically set by Render.

### Frontend (Vercel)
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**:
  ```env
  VITE_API_BASE_URL=https://saferoute-mumbai-api.onrender.com
  ```

---

## 7. Privacy & Security Principles

- **No Location Fabrication**: Live GPS coordinates remain null until browser permission is granted.
- **Client-Side Storage**: Emergency contacts and user preferences remain purely in browser `localStorage`.
- **Zero API Secrets in Client Code**: All backend API integrations and external keys remain strictly server-side.
