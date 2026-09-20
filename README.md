# SafeRoute - Mumbai Women's Safety Intelligence Platform

## 1. Project Name
SafeRoute

## 2. Problem Statement
Women in Mumbai face challenges when making informed decisions about their daily travel and safety. While crime data exists, it is often not easily accessible or understandable, and emergency tools are disconnected from journey planning. 

## 3. Solution
SafeRoute is a web platform designed to help women make better-informed travel decisions using historical recorded-crime data, location intelligence (nearby police stations), and integrated emergency tools.

## 4. Features
- **Safety Dashboard**: City-wide recorded crime indicators and historical trends based on the 2022-2023 dataset.
- **Smart Map**: Interactive map showing police stations across Mumbai.
- **Safe Journey Planner**: Analyze routes for nearby safety resources and overall city-wide risk context.
- **Active Journey Mode**: UI for sharing trips with trusted contacts.
- **Emergency / SOS Interface**: Quick access to contact 112 and locate nearest police stations.
- **Data Transparency**: Clear disclaimers and methodology explanations.

## 5. Architecture
- **Frontend**: React, Vite, TailwindCSS (v4), React-Leaflet, Recharts, Framer Motion.
- **Backend**: Python, Flask.
- **Data Processing**: Pandas, xmltodict.

## 6. Dataset Sources
- `a502dd53-cecd-4def-a951-48eb0e4c5100.csv`: Aggregated women-related crimes data for Mumbai (2022 and 2023).
- `fbe6a2e1-64ee-459b-ab45-be1de84f603b.kml`: Geospatial data of police stations in Mumbai.

## 7. Dataset Processing
The provided datasets are processed cleanly without modifying the source files:
- The CSV is cleaned by removing empty rows and properly casting string categories and numeric totals.
- The KML is parsed to extract the Station Name, Location, Ward, and geospatial Coordinates (Lat/Lng) into a clean GeoJSON format.
- Output is generated in `backend/data/`.

## 8. ML / Analytics Methodology
Given the constraint that the provided crime dataset is city-wide aggregated data without geospatial markers, the platform avoids fabricating "hotspots". Instead, the analytics focus on deterministic historical trends and comparisons between 2022 and 2023.

## 9. Risk Indicator Methodology
The "Recorded Crime Risk Indicator" is a heuristic metric (0-100) calculated by assessing the baseline volume of women-related crimes in the city and penalizing or rewarding based on the year-over-year trend percentage.

## 10. API Documentation
- `GET /api/health` - Server health check.
- `GET /api/crimes/summary` - Returns city-wide processed crime statistics and the Risk Indicator.
- `GET /api/police-stations` - Returns a GeoJSON of Mumbai police stations.
- `POST /api/journey/analyze` - Accepts `{start: {lat, lng}, end: {lat, lng}}` and returns nearby police stations within 5km and city-wide risk context.

## 11. Installation
Ensure Python 3.x and Node.js are installed.

```bash
# Clone the repository
# Ensure the provided CSV and KML files are in the root directory.
```

## 12. Running Backend Locally
```bash
cd backend
python -m venv venv
# Activate virtual environment (Windows: .\venv\Scripts\activate, Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt
python app.py # Runs the Flask API on port 5000
```

## 13. Running Frontend Locally
```bash
cd frontend
npm install
npm run dev # Runs Vite dev server on port 5173 with local /api proxy
```

## 14. Production Deployment

### Backend — Render (Web Service)
- **Root Directory:** `backend`
- **Environment:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`
- **Required Environment Variables:**
  - `ORS_API_KEY`: *(Optional but recommended)* Your OpenRouteService API key for genuine road network routing and geocoding.
  - `PORT`: Automatically assigned by Render.
  - `FLASK_DEBUG`: `false` (default)

### Frontend — Vercel
- **Root Directory:** `frontend`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **API Routing:**
  - All frontend requests use relative paths (`/api/...`).
  - Update `frontend/vercel.json` with your deployed Render backend URL:
    ```json
    {
      "rewrites": [
        {
          "source": "/api/(.*)",
          "destination": "https://<your-render-app-name>.onrender.com/api/$1"
        },
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }
    ```
  - Alternatively, you can set the environment variable `VITE_API_BASE_URL=https://<your-render-app-name>.onrender.com` in your Vercel Project Settings.

## 15. Environment Variables
The application is pre-configured with OpenRouteService for real road network routing and geocoding.
Create a `backend/.env` file:
```env
ORS_API_KEY=your_openrouteservice_api_key
```
When configured, SafeRoute calculates genuine turn-by-turn road paths across Mumbai and identifies police stations located along that exact road corridor.

## 16. Limitations
- **No Crime Geodata**: The crime dataset is city-wide. Hotspot mapping is disabled to prevent data fabrication.
- **Routing**: The journey planner uses a straight-line Haversine distance heuristic rather than a real street-routing engine.

## 17. Privacy Considerations
- Journey data and trusted contacts are designed to be stored locally or ephemerally.
- Browser geolocation is used only with explicit permission (mocked in the current MVP UI).

## 18. Screenshots
*(Add screenshots of Dashboard, Map, and SOS modes here)*

## 19. Future Improvements
- Integrate a real routing API (e.g., OSRM, Mapbox).
- Use Ward-level crime datasets to provide granular geographic risk indicators.
- Implement an LLM API for the conversational AI Assistant.
- Add actual SMS integration (Twilio) for the SOS feature.
