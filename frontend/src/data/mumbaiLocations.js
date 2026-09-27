import mumbaiZones from './mumbaiZones.json';
import policeStations from './policeStations.json';
import { MUMBAI_SAFE_HAVENS } from './safeHavens';
import { MUMBAI_TRANSIT_STATIONS } from './mumbaiTransitLines';

// Comprehensive catalog of curated Mumbai landmarks, transit hubs, and nodes
const CURATED_MUMBAI_LANDMARKS = [
  { name: "Andheri Railway Station, Mumbai", zone: "Western Suburbs", lat: 19.1197, lng: 72.8464, category: "Railway Station" },
  { name: "Bandra Railway Station, Mumbai", zone: "Western Suburbs", lat: 19.0558, lng: 72.8407, category: "Railway Station" },
  { name: "Bandra Kurla Complex (BKC), Mumbai", zone: "Central Business Hub", lat: 19.0657, lng: 72.8687, category: "Commercial Hub" },
  { name: "Bandra West / Bandstand, Mumbai", zone: "Western Suburbs", lat: 19.0596, lng: 72.8295, category: "Promenade" },
  { name: "Colaba / Gateway of India, Mumbai", zone: "South Mumbai", lat: 18.9220, lng: 72.8347, category: "Landmark" },
  { name: "CSMT Railway Terminus, Mumbai", zone: "South Mumbai", lat: 18.9401, lng: 72.8354, category: "Railway Station" },
  { name: "Churchgate Station, Mumbai", zone: "South Mumbai", lat: 18.9322, lng: 72.8264, category: "Railway Station" },
  { name: "Marine Drive Promenade, Mumbai", zone: "South Mumbai", lat: 18.9432, lng: 72.8230, category: "Promenade" },
  { name: "Dadar Railway Station, Mumbai", zone: "Central Mumbai", lat: 19.0182, lng: 72.8434, category: "Railway Station" },
  { name: "Mumbai Int'l Airport (T2), Mumbai", zone: "Airport Zone", lat: 19.0896, lng: 72.8656, category: "Airport" },
  { name: "Mumbai Domestic Airport (T1), Mumbai", zone: "Airport Zone", lat: 19.0950, lng: 72.8528, category: "Airport" },
  { name: "Powai (Hiranandani), Mumbai", zone: "Eastern Suburbs", lat: 19.1176, lng: 72.9060, category: "Neighborhood" },
  { name: "Borivali Railway Station, Mumbai", zone: "North Mumbai", lat: 19.2294, lng: 72.8576, category: "Railway Station" },
  { name: "Juhu Beach, Mumbai", zone: "Western Suburbs", lat: 19.0988, lng: 72.8264, category: "Promenade" },
  { name: "Ghatkopar Station, Mumbai", zone: "Eastern Suburbs", lat: 19.0860, lng: 72.9090, category: "Transit Interchange" },
  { name: "Thane Railway Station, Mumbai", zone: "MMR Zone", lat: 19.1860, lng: 72.9759, category: "Railway Station" },
  { name: "Vashi, Navi Mumbai", zone: "Navi Mumbai", lat: 19.0771, lng: 72.9986, category: "Node" },
  { name: "Lower Parel / High Street Phoenix, Mumbai", zone: "South Central", lat: 18.9953, lng: 72.8302, category: "Commercial Hub" },
  { name: "Kurla Station, Mumbai", zone: "Central Mumbai", lat: 19.0652, lng: 72.8792, category: "Transit Interchange" },
  { name: "Worli Sea Face, Mumbai", zone: "South Central", lat: 19.0150, lng: 72.8180, category: "Promenade" },
  { name: "Nariman Point, Mumbai", zone: "South Mumbai", lat: 18.9260, lng: 72.8230, category: "Commercial Hub" },
  { name: "Goregaon East / Film City, Mumbai", zone: "Western Suburbs", lat: 19.1645, lng: 72.8750, category: "Hub" },
  { name: "Malad West / Inorbit Mall, Mumbai", zone: "Western Suburbs", lat: 19.1866, lng: 72.8350, category: "Commercial Hub" },
  { name: "Kandivali West, Mumbai", zone: "North Mumbai", lat: 19.2045, lng: 72.8420, category: "Neighborhood" },
  { name: "Santacruz West, Mumbai", zone: "Western Suburbs", lat: 19.0818, lng: 72.8380, category: "Neighborhood" },
  { name: "Vile Parle East, Mumbai", zone: "Western Suburbs", lat: 19.0995, lng: 72.8520, category: "Neighborhood" },
  { name: "Sion Circle, Mumbai", zone: "Central Mumbai", lat: 19.0390, lng: 72.8619, category: "Transit Node" },
  { name: "Chembur Monorail Station, Mumbai", zone: "Eastern Suburbs", lat: 19.0620, lng: 72.8980, category: "Neighborhood" },
  { name: "Byculla Station, Mumbai", zone: "South Mumbai", lat: 18.9774, lng: 72.8335, category: "Railway Station" },
  { name: "Mumbai Central Station, Mumbai", zone: "South Mumbai", lat: 18.9696, lng: 72.8193, category: "Railway Station" }
];

export function getAllMumbaiLocations() {
  const list = [];
  const seen = new Set();

  const add = (name, lat, lng, zone, category) => {
    if (!name || isNaN(lat) || isNaN(lng)) return;
    const cleanName = name.trim();
    const key = cleanName.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    list.push({
      name: cleanName,
      lat: Number(lat),
      lng: Number(lng),
      zone: zone || 'Mumbai',
      category: category || 'Location'
    });
  };

  // 1. Curated Landmarks & Nodes
  CURATED_MUMBAI_LANDMARKS.forEach(l => {
    add(l.name, l.lat, l.lng, l.zone, l.category);
  });

  // 2. Mumbai Zones (Wards & Areas)
  if (mumbaiZones && Array.isArray(mumbaiZones.features)) {
    mumbaiZones.features.forEach(f => {
      const p = f.properties || {};
      const center = p.center;
      if (p.name && center && center.length >= 2) {
        add(`${p.name}, Mumbai (Ward ${p.ward || 'MMR'})`, center[0], center[1], `Ward ${p.ward || ''}`, 'Safety Zone');
      }
    });
  }

  // 3. Railway & Metro Stations
  if (MUMBAI_TRANSIT_STATIONS) {
    (MUMBAI_TRANSIT_STATIONS.western || []).forEach(st => {
      add(`${st.name} Railway Station (WR), Mumbai`, st.coords[0], st.coords[1], 'Western Line', 'Transit Hub');
    });
    (MUMBAI_TRANSIT_STATIONS.central || []).forEach(st => {
      add(`${st.name} Railway Station (CR), Mumbai`, st.coords[0], st.coords[1], 'Central Line', 'Transit Hub');
    });
    (MUMBAI_TRANSIT_STATIONS.metro_line3 || []).forEach(st => {
      add(`${st.name} Metro Station (Aqua Line 3), Mumbai`, st.coords[0], st.coords[1], 'Metro Line 3', 'Metro Station');
    });
  }

  // 4. Police Stations
  if (policeStations && Array.isArray(policeStations.features)) {
    policeStations.features.forEach(st => {
      const p = st.properties || {};
      const geom = st.geometry || {};
      if (p.name && geom.coordinates && geom.coordinates.length >= 2) {
        add(`${p.name}, Mumbai`, geom.coordinates[1], geom.coordinates[0], `Ward ${p.ward || 'Mumbai Police'}`, 'Police Station');
      }
    });
  }

  // 5. Medical Facilities / Safe Havens
  if (Array.isArray(MUMBAI_SAFE_HAVENS)) {
    MUMBAI_SAFE_HAVENS.forEach(h => {
      if (h.name && h.coordinates && h.coordinates.length >= 2) {
        add(`${h.name}, Mumbai`, h.coordinates[0], h.coordinates[1], h.category || 'Hospital', 'Medical Safe Haven');
      }
    });
  }

  return list;
}

export const ALL_MUMBAI_LOCATIONS = getAllMumbaiLocations();

export function filterMumbaiLocations(query, limit = 10) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/).filter(Boolean);

  const exactStarts = [];
  const termMatches = [];

  for (const loc of ALL_MUMBAI_LOCATIONS) {
    const nameLower = loc.name.toLowerCase();
    const zoneLower = loc.zone.toLowerCase();
    const fullText = `${nameLower} ${zoneLower}`;

    // Exact prefix match gets highest priority
    if (nameLower.startsWith(q)) {
      exactStarts.push(loc);
    } else if (terms.every(t => fullText.includes(t))) {
      termMatches.push(loc);
    }

    if (exactStarts.length + termMatches.length >= limit * 2) {
      break;
    }
  }

  return [...exactStarts, ...termMatches].slice(0, limit);
}
