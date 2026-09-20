# SafeRoute Mumbai — Technical Methodology & Ethics

This document explains the mathematical algorithms, spatial corridor metrics, data limitations, and privacy design patterns implemented in SafeRoute Mumbai.

---

## 1. Route Calculation & Multi-Modal Corridors

### A. Road Network Analysis
When origin and destination coordinates are provided:
1. **Real Road Routing**: The backend queries the **OpenRouteService (ORS)** API to retrieve actual road network geometry, true driving distance ($km$), and estimated travel duration ($minutes$) across Mumbai arterial corridors (e.g. Western Express Highway, Eastern Express Highway, SV Road, Link Road, Coastal Road).
2. **Deterministic Geometric Integrity**: SafeRoute **never** shifts coordinates or generates synthetic "fake alternate" paths. If ORS returns a single path, that route is verified and returned as the primary corridor.
3. **Corridor Point Sampling**: The road polyline is sampled every 500 meters or up to 30 continuous checkpoints.

### B. Multi-Modal Transit Corridors
Alongside road cab corridors, SafeRoute evaluates structured public transit options across Greater Mumbai:
- **Suburban Railway Network**: Evaluates Western Line (Churchgate $\leftrightarrow$ Dahanu Road), Central Line (CSMT $\leftrightarrow$ Kalyan), and Harbour Line corridors.
- **Mumbai Metro Network**: Evaluates active lines (Metro 1 Versova-Ghatkopar, Metro 2A/7, and Metro 3 Aqua Line).

---

## 2. Emergency Resource Coverage Score (0–100)

Rather than predicting subjective "crime risk", SafeRoute evaluates **Emergency Infrastructure Coverage** — measuring direct physical accessibility to official emergency and medical support along the corridor:

$$\text{Total Coverage Score} = \text{Police Proximity Score} + \text{Police Density Score} + \text{Medical Proximity Score} + \text{Medical Density Score}$$

### Component Breakdown:
1. **Police Proximity (Max 40 points)**:
   - Nearest station $\le 1.0\text{ km}$: **40 pts**
   - Nearest station $\le 2.0\text{ km}$: **30 pts**
   - Nearest station $\le 3.5\text{ km}$: **20 pts**
   - Nearest station $\le 5.0\text{ km}$: **10 pts**
   - Nearest station $> 5.0\text{ km}$: **5 pts**
2. **Corridor Police Density (Max 20 points)**:
   - Evaluates the number of active police stations within $3.5\text{ km}$ buffer along the route ($\min(\text{count} \times 4, 20)$).
3. **Medical Proximity (Max 25 points)**:
   - Nearest hospital / maternity home $\le 1.5\text{ km}$: **25 pts**
   - Nearest hospital $\le 3.0\text{ km}$: **18 pts**
   - Nearest hospital $\le 4.5\text{ km}$: **10 pts**
   - Nearest hospital $> 4.5\text{ km}$: **5 pts**
4. **Corridor Medical Density (Max 15 points)**:
   - Evaluates the count of municipal healthcare centers within $4.0\text{ km}$ buffer ($\min(\text{count} \times 3, 15)$).

---

## 3. Why Neighborhood Crime Prediction is Intentionally Avoided

1. **Absence of Micro-Geographic Data**: The available police dataset provides **city-wide annual aggregates** across Greater Mumbai (5,913 cases in 2023). It does not contain ward-level, street-level, or GPS crime coordinates.
2. **Risk of Algorithmic Redlining**: Assigning synthetic numerical danger scores (e.g. "Bandra 92% Safe", "Kurla 40% High Risk") without empirical per-ward crime denominators produces deceptive risk perceptions and biases against specific communities.
3. **Commitment to Scientific Honesty**:
   - SafeRoute displays factual city-wide crime data in the **Analytics Dashboard**.
   - SafeRoute displays verified physical infrastructure in the **Safety Map** and **Journey Planner**.
   - SafeRoute provides statutory legal information via the **Mumbai Safety Guide**.

---

## 4. Privacy & Location Integrity

- **No GPS Fabrication**: User GPS coordinates remain `null` until the user explicitly grants browser geolocation permission. No default center coordinates are used to fabricate user position.
- **Continuous Live GPS**: In active journey mode, real continuous tracking uses `navigator.geolocation.watchPosition` rather than a one-off snapshot.
- **Client-Side Storage**: Trusted emergency contacts and local prototype hazard notes are persisted strictly in browser `localStorage`. No personal phone numbers or user tracking logs are transmitted or stored on backend servers.
- **Transient Geocoding Cache**: Backend geocoding cache stores only normalized public place name strings (e.g., `"dadar station"`) for 10 minutes. User GPS coordinate queries are never cached or logged.

---

## 5. Known MVP Scope & Prototype Boundaries

1. **SMS & Emergency Dispatch**: The SOS mode provides verified 1-tap `tel:` and WhatsApp direct share intents. Automatic automated telephony / SMS dispatch is not bundled to avoid accidental false triggers.
2. **Community Hazards**: Hazard reports are managed in browser local storage as a design prototype. A distributed moderation backend would be required for live crowd-sourced production deployment.
3. **Deterministic Safety Guide**: The assistant uses keyword and pattern matching to deliver verified statutory BNSS provisions and verified emergency numbers, avoiding LLM hallucination risks for sensitive legal information.
