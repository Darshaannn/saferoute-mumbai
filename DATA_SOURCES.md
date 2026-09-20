# SafeRoute Mumbai — Data Sources & Integrity Specifications

This document defines all primary statutory data sources, geospatial registries, external API dependencies, and empirical boundaries governing SafeRoute Mumbai.

---

## 1. Primary Datasets

### A. Annual Crime Against Women Statistical Registry
- **File**: `a502dd53-cecd-4def-a951-48eb0e4c5100.csv`
- **Source Authority**: Mumbai Police Crime Records Branch / Bureau of Police Research & Development (BPR&D)
- **Temporal Coverage**: Calendar Years 2022 and 2023
- **Jurisdiction**: Greater Mumbai Police Commissionerate (Zones 1 through 12)
- **Key Metrics**:
  - Registered Cases (2022 vs 2023)
  - Detected Cases (2022 vs 2023)
  - Detection Percentage (%)
- **What this source SUPPORTS**:
  - Macro city-wide statistical comparison (e.g., 5,913 cases in 2023 vs 6,156 cases in 2022).
  - Head-wise institutional detection rates (94.2% detected overall in 2023).
  - Analysis of major statutory categories: Outraging Modesty (Sec. 354 IPC), Kidnapping, Rape, Domestic Harassment (Sec. 498-A IPC), and POCSO enactments.
- **What this source CANNOT support**:
  - **No ward-level or neighborhood-level geographic markers**: The dataset contains only aggregated city-wide counts.
  - **No micro-location danger predictions**: Ward-level crime counts or per-street danger scores cannot be mathematically derived from this dataset.
  - **Overlapping categories**: Certain rows (e.g., Rape u/s 376 IPC Minor vs Rape with POCSO) overlap statutory provisions and cannot be added together without double-counting.

---

### B. Greater Mumbai Police Stations Spatial Registry
- **File**: `fbe6a2e1-64ee-459b-ab45-be1de84f603b.kml` $\rightarrow$ `backend/data/police_stations.geojson`
- **Source Authority**: Municipal Corporation of Greater Mumbai (MCGM / BMC) & Mumbai Police GIS Database
- **Entities**: 118+ verified Mumbai Police Stations
- **Properties Extracted**: Station Name, Administrative Ward, Civic Address / Location, Exact Geographic Coordinates `[Longitude, Latitude]`
- **What this source SUPPORTS**:
  - Exact Euclidean and corridor-segment proximity calculations from any travel route.
  - Verified emergency dispatch landmarks across Mumbai.
- **What this source CANNOT support**:
  - Police staffing levels, active vehicle patrol frequency, or realtime dispatch response times.

---

### C. Mumbai Municipal Hospitals Spatial Registry
- **File**: `23d3867f-3604-4b8b-b3b0-7c9770777f18.kml` $\rightarrow$ `backend/data/mumbai_hospitals.geojson`
- **Source Authority**: Open Data Mumbai / Municipal Corporation of Greater Mumbai (MCGM)
- **Entities**: Municipal general and major referral hospitals (e.g., K.E.M. Hospital, Sion Hospital, Cooper Hospital, Nair Hospital, Shatabdi).
- **Properties Extracted**: Hospital Name, Administrative Ward, Address, Coordinates `[Longitude, Latitude]`.
- **Integrity Notice**: Facilities are represented solely with verified metadata from civic registries. Unsupported 24x7 emergency claims are strictly excluded unless verified.

---

### D. Mumbai Municipal Maternity Homes Spatial Registry
- **File**: `3866f702-d906-412c-91fe-25c03c7dcd87.kml` $\rightarrow$ `backend/data/mumbai_maternity_homes.geojson`
- **Source Authority**: MCGM Public Health Department GIS Registry
- **Entities**: Civic maternity clinics and specialized women healthcare outposts.
- **Properties Extracted**: Facility Name, Administrative Ward, Civic Address, Geographic Coordinates `[Longitude, Latitude]`.

---

## 2. External Routing & Geocoding Services

| Service | Protocol / Endpoint | Purpose | Fallback Mechanism |
| :--- | :--- | :--- | :--- |
| **OpenRouteService (ORS)** | `POST /v2/directions/driving-car` | Real street network path computation and genuine driving corridor geometry | Local multimodal transit fallback (Western/Central Rail corridors, Metro Lines) |
| **Komoot Photon API** | `GET https://photon.komoot.io/api/` | High-speed OpenStreetMap POI and landmark geocoding (stations, hospitals, malls) | Curated Mumbai landmark coordinate lookup table |
| **OpenStreetMap Nominatim** | `GET https://nominatim.openstreetmap.org/` | Bounded MMR reverse geocoding and address resolution | Deterministic latitude/longitude label generator |
| **OpenStreetMap Tile Server** | Standard & Humanitarian (HOT) slippy map tiles | Cartographic base map tiles with full attribution | Client-side Leaflet tile caching |

---

## 3. Statutory Legal References

1. **Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023**:
   - **Section 173(1)**: Mandatory registration of Zero FIR and e-FIR regardless of territorial jurisdiction.
   - **Section 43(5)**: Prohibition of arresting women after sunset and before sunrise except with prior written Judicial Magistrate permission.
   - **Section 179(1) Proviso**: Exemption of women witnesses from being required to attend police stations; statements recorded at place of residence.
   - **Section 340**: Right to free legal aid for indigent persons at state expense.
2. **Legal Services Authorities Act, 1987**:
   - **Section 12(c)**: Statutory entitlement of **all women** to free legal aid and counsel irrespective of financial income.
