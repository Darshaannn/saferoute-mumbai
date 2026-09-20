import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Shield, Search, Locate, Info, Navigation as NavIcon, Layers, Heart, PlusCircle, AlertTriangle, LightbulbOff, Users, ShieldAlert, Phone, ExternalLink, X, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MUMBAI_SAFE_HAVENS } from '../data/safeHavens';
import CommunityReportModal, { INITIAL_HAZARDS, formatRelativeTime } from '../components/CommunityReportModal';
import API_BASE_URL from '../config/api';
import { apiRequest } from '../services/apiClient';

export function getRiskTier(score) {
  if (score <= 20) return { color: '#16a34a', label: 'Very Safe / Low Risk', badge: 'Very Safe (0-20)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500' };
  if (score <= 40) return { color: '#65a30d', label: 'Safe / Moderate-Low', badge: 'Safe (21-40)', bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-500' };
  if (score <= 60) return { color: '#d97706', label: 'Moderate Caution', badge: 'Moderate (41-60)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-500' };
  if (score <= 80) return { color: '#ea580c', label: 'Heightened Vigilance', badge: 'Vigilance (61-80)', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-500' };
  return { color: '#dc2626', label: 'High Caution Zone', badge: 'High Caution (81-100)', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-500' };
}

// Center Zone Name & Risk Score Label - Sleek, compact, modern glass capsule
function createZoneLabelIcon(name, ward, score) {
  const tier = typeof score === 'number' ? getRiskTier(score) : { color: '#3b82f6' };
  return L.divIcon({
    className: 'mumbai-zone-label',
    html: `
      <div style="
        text-align: center;
        transform: translate(-50%, -50%);
        pointer-events: none;
        user-select: none;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 3px 8px;
          border-radius: 9999px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          transition: all 0.2s ease;
        ">
          <span style="
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background-color: ${tier.color};
            box-shadow: 0 0 0 1.5px rgba(255,255,255,0.9), 0 0 6px ${tier.color}80;
            display: inline-block;
            flex-shrink: 0;
          "></span>
          <span style="
            font-weight: 700;
            font-size: 10.5px;
            color: #0f172a;
            letter-spacing: -0.1px;
            line-height: 1.1;
          ">${name}</span>
          ${typeof score === 'number' ? `
            <span style="
              font-weight: 700;
              font-size: 9px;
              color: ${tier.color};
              background: ${tier.color}15;
              padding: 1px 4px;
              border-radius: 4px;
              line-height: 1;
            ">${score}</span>
          ` : ''}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

// Circular Deep Teal Shield Marker for Police Stations
const policeStationShieldIcon = L.divIcon({
  className: 'police-shield-badge',
  html: `
    <div style="
      background: linear-gradient(135deg, #123B3A, #1E6761);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(18,59,58,0.45);
      cursor: pointer;
    ">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11]
});

// Hospital Safe Haven Marker (Teal Cross)
const hospitalHavenIcon = L.divIcon({
  className: 'hospital-haven-badge',
  html: `
    <div style="
      background: linear-gradient(135deg, #1E6761, #2A8078);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(30,103,97,0.45);
      cursor: pointer;
    ">
      <span style="color: white; font-weight: 900; font-size: 13px; line-height: 1;">✚</span>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11]
});

// Pharmacy Safe Haven Marker (Sage Pill)
const pharmacyHavenIcon = L.divIcon({
  className: 'pharmacy-haven-badge',
  html: `
    <div style="
      background: linear-gradient(135deg, #A8C2B6, #8AAFA2);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(18,59,58,0.25);
      cursor: pointer;
    ">
      <span style="color: white; font-weight: 900; font-size: 11px; line-height: 1;">✦</span>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// Community Hazard Pin
const hazardPinIcon = L.divIcon({
  className: 'hazard-pin-badge',
  html: `
    <div style="
      background: linear-gradient(135deg, #ea580c, #f97316);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.4);
      cursor: pointer;
      animation: pulse 2s infinite;
    ">
      <span style="color: white; font-weight: 900; font-size: 11px;">⚠</span>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11]
});

const searchPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Custom icons
const policeStationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const safeHavenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const hazardIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const userPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

function MapController({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function MapEventsHandler({ onMapClick, onZoomChange }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
    zoomend(e) {
      if (onZoomChange) {
        onZoomChange(e.target.getZoom());
      }
    }
  });
  return null;
}

export default function SafetyMap() {
  const [zones, setZones] = useState([]);
  const [stations, setStations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [activeStation, setActiveStation] = useState(null);
  const [mapStyle, setMapStyle] = useState('osm');
  const [showStations, setShowStations] = useState(true);
  const [showHavens, setShowHavens] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [scoreFilter, setScoreFilter] = useState('ALL');
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  
  // Community Hazard reports state
  const [hazards, setHazards] = useState(() => {
    try {
      const saved = localStorage.getItem('mumbai_community_hazards');
      return saved ? JSON.parse(saved) : INITIAL_HAZARDS;
    } catch {
      return INITIAL_HAZARDS;
    }
  });
  const [showReportModal, setShowReportModal] = useState(false);

  // Search state & Debounce references
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapCenter, setMapCenter] = useState([19.1200, 72.8650]);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const searchDebounceRef = useRef(null);
  const searchAbortRef = useRef(null);

  useEffect(() => {
    Promise.all([
      apiRequest('/api/zones'),
      apiRequest('/api/police-stations')
    ])
      .then(([zonesData, stationsData]) => {
        setZones(zonesData?.features || []);
        setStations(stationsData || { type: 'FeatureCollection', features: [] });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching map datasets", err);
        setZones([]);
        setStations({ type: 'FeatureCollection', features: [] });
        setLoading(false);
      });
  }, []);

  const handleAddHazard = (newHazard) => {
    const updated = [newHazard, ...hazards];
    setHazards(updated);
    try {
      localStorage.setItem('mumbai_community_hazards', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHazard = (id) => {
    const updated = hazards.filter(h => h.id !== id);
    setHazards(updated);
    try {
      localStorage.setItem('mumbai_community_hazards', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Debounced geocoding search with stale request cancellation
  const handleSearch = (val) => {
    setSearchQuery(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      const abortController = new AbortController();
      searchAbortRef.current = abortController;

      try {
        const data = await apiRequest(`/api/geocode?q=${encodeURIComponent(val.trim())}`, {
          signal: abortController.signal
        });
        setSearchResults(data.results || []);
      } catch (e) {
        if (!e.isAborted) {
          console.error("Geocoding search error", e);
        }
      }
    }, 350);
  };

  const selectPlace = (place) => {
    setSelectedPoint({
      lat: place.lat,
      lng: place.lng,
      name: place.name
    });
    setMapCenter([place.lat, place.lng]);
    setSearchResults([]);
    setSearchQuery(place.name);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);
        setMapCenter([lat, lng]);
        setLocating(false);
      },
      (err) => {
        console.warn("GPS failed", err);
        setUserLocation(null);
        setLocating(false);
        alert("Location unavailable. You can still browse the map and access emergency resources.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  const handleMapClick = async (latlng) => {
    try {
      const data = await apiRequest(`/api/reverse-geocode?lat=${latlng.lat}&lng=${latlng.lng}`);
      setSelectedPoint({
        lat: latlng.lat,
        lng: latlng.lng,
        name: data.name || `Point (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`
      });
    } catch {
      setSelectedPoint({
        lat: latlng.lat,
        lng: latlng.lng,
        name: `Location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`
      });
    }
  };

  // Filtered zones by risk score or area
  const filteredZones = zones.filter(z => {
    const score = z.properties.score;
    if (scoreFilter === '0-20') return score <= 20;
    if (scoreFilter === '21-40') return score > 20 && score <= 40;
    if (scoreFilter === '41-60') return score > 40 && score <= 60;
    if (scoreFilter === '61-80') return score > 60 && score <= 80;
    if (scoreFilter === '81-100') return score > 80;
    if (scoreFilter === 'WESTERN') return ['R/N', 'R/C', 'R/S', 'P/N', 'P/S', 'K/W', 'H/W'].some(w => (z.properties.ward || '').includes(w));
    if (scoreFilter === 'EASTERN') return ['K/E', 'H/E', 'L', 'M/E', 'M/W', 'N', 'S', 'T'].some(w => (z.properties.ward || '').includes(w));
    if (scoreFilter === 'SOUTH') return ['A', 'B', 'C', 'D', 'E', 'F/S', 'F/N', 'G/S', 'G/N'].some(w => (z.properties.ward || '').includes(w));
    return true;
  });

  const tileLayers = {
    'osm': {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    },
    'osm-hot': {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team'
    }
  };

  if (loading) return (
    <div className="pt-24 flex flex-col justify-center items-center h-screen space-y-3">
      <div className="sr-spinner"></div>
      <p className="font-body" style={{ fontSize: '15px', color: 'var(--color-muted)' }}>Loading Mumbai safety map…</p>
    </div>
  );

  return (
    <div className="pt-16 h-screen flex flex-col relative overflow-hidden">
      
      {/* Top Floating Master Control Card with Close & Re-open toggle */}
      <div className="absolute top-20 left-4 z-[1000]">
        {isControlsOpen ? (
          <div className="w-[92vw] sm:w-[480px] md:w-[500px] backdrop-blur-md p-3.5 space-y-3 transition-all" style={{ background: 'rgba(244,240,232,0.97)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card-lg)', boxShadow: 'var(--shadow-modal)' }}>
            
            {/* Search & Action Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search places, stations, hospitals..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="sr-input w-full pl-9 pr-8 py-2" style={{ fontSize: '14px' }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Find Location GPS Button */}
              <button
                onClick={handleLocateMe}
                title="Find my location"
                className="p-2 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer" style={{ background: 'var(--color-teal-soft)', color: 'var(--color-accent)' }}
                aria-label="Find GPS Location"
              >
                <Locate className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
              </button>

              {/* Close Panel Button */}
              <button
                onClick={() => setIsControlsOpen(false)}
                className="p-2 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer" style={{ background: 'rgba(18,59,58,0.06)', color: 'var(--color-muted)' }}
                title="Hide map controls & filters"
                aria-label="Hide Map Controls"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="max-h-56 overflow-y-auto" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                {searchResults.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => selectPlace(r)}
                    className="p-2.5 cursor-pointer flex items-center justify-between transition"
                    style={{ borderBottom: i < searchResults.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-teal-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="truncate mr-2">
                      <span className="font-body font-semibold block truncate" style={{ fontSize: '13px', color: 'var(--color-ink)' }}>{r.name}</span>
                      <span className="font-body" style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{r.source}</span>
                    </div>
                    <NavIcon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Risk Filter Pills (Neat Segments) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-body font-semibold" style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Risk Filter:</span>
                {scoreFilter !== 'ALL' && (
                  <button 
                    onClick={() => setScoreFilter('ALL')} 
                    className="font-body font-semibold cursor-pointer" style={{ fontSize: '11px', color: 'var(--color-accent)', background: 'none', border: 'none' }}
                  >
                    Reset Filter
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setScoreFilter('ALL')}
                  className="font-body px-2.5 py-1 rounded-lg shrink-0 transition cursor-pointer"
                  style={{
                    fontSize: '12px',
                    background: scoreFilter === 'ALL' ? 'var(--color-primary)' : 'rgba(18,59,58,0.06)',
                    color: scoreFilter === 'ALL' ? '#fff' : 'var(--color-primary)',
                    border: 'none',
                  }}
                >
                  All ({zones.length})
                </button>
                
                {[
                  { key: '0-20', label: 'Very Safe', dot: '#16a34a' },
                  { key: '21-40', label: 'Safe', dot: '#65a30d' },
                  { key: '41-60', label: 'Moderate', dot: '#d97706' },
                  { key: '61-80', label: 'Vigilance', dot: '#ea580c' },
                  { key: '81-100', label: 'Caution', dot: '#dc2626' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setScoreFilter(f.key)}
                    className="font-body px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5 transition cursor-pointer"
                    style={{
                      fontSize: '12px',
                      background: scoreFilter === f.key ? 'var(--color-primary)' : 'rgba(18,59,58,0.06)',
                      color: scoreFilter === f.key ? '#fff' : 'var(--color-primary)',
                      border: 'none',
                    }}
                  >
                    <span className="rounded-full" style={{ width: '6px', height: '6px', background: f.dot, flexShrink: 0, display: 'inline-block' }} />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Layer Toggles & Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { key: 'zones', label: 'Zones', icon: Layers, active: showZones, toggle: () => setShowZones(!showZones), title: 'Toggle Safety Zones' },
                  { key: 'police', label: 'Police', icon: Shield, active: showStations, toggle: () => setShowStations(!showStations), title: 'Toggle Police Stations' },
                  { key: 'medical', label: `Medical (${MUMBAI_SAFE_HAVENS.length})`, icon: Heart, active: showHavens, toggle: () => setShowHavens(!showHavens), title: 'Toggle Medical Facilities' },
                  { key: 'notes', label: `Notes (${hazards.length})`, icon: AlertTriangle, active: showHazards, toggle: () => setShowHazards(!showHazards), title: 'Toggle Safety Notes' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={item.toggle}
                      className="font-body px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                      style={{
                        fontSize: '12px',
                        background: item.active ? 'var(--color-teal-soft)' : 'transparent',
                        color: item.active ? 'var(--color-primary)' : 'var(--color-muted)',
                        border: item.active ? '1px solid rgba(30,103,97,0.25)' : '1px solid transparent',
                        fontWeight: item.active ? '600' : '400',
                      }}
                      title={item.title}
                    >
                      <Icon className="w-3.5 h-3.5" /> {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Add Safety Note Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="font-body font-semibold px-2.5 py-1 flex items-center gap-1 transition shrink-0 cursor-pointer"
                style={{ fontSize: '12px', background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', border: 'none' }}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Note
              </button>
            </div>

          </div>
        ) : (
          /* Re-open Button when panel is closed */
          <button
            onClick={() => setIsControlsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            style={{ background: 'rgba(244,240,232,0.97)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card-lg)', boxShadow: 'var(--shadow-modal)', color: 'var(--color-ink)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '500' }}
            title="Open map controls & safety filters"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)', color: '#fff' }}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <span>Search &amp; Safety Filters</span>
            {scoreFilter !== 'ALL' && (
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)', display: 'inline-block' }}></span>
            )}
          </button>
        )}
      </div>

      {/* Sleek Area Safety Guide Card (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-[1000] backdrop-blur-md px-3.5 py-3 w-[310px] space-y-2.5 transition-all" style={{ background: 'rgba(244,240,232,0.97)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card-lg)', boxShadow: 'var(--shadow-modal)' }}>
        {/* Header */}
        <div className="flex items-baseline justify-between gap-2 pb-1.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="font-display" style={{ fontSize: '16px', color: 'var(--color-primary)', lineHeight: 1 }}>Area Safety Guide</span>
          <span className="font-body" style={{ fontSize: '11px', color: 'var(--color-muted)', whiteSpace: 'nowrap', fontStyle: 'italic' }}>0 Safest · 100 Caution</span>
        </div>

        {/* Gradient Bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full" style={{ background: 'linear-gradient(to right, #16a34a, #d97706, #dc2626)' }}></div>
          <div className="grid grid-cols-5 text-center">
            {[
              { range: '0–20', label: 'Safe' },
              { range: '21–40', label: 'Low' },
              { range: '41–60', label: 'Mod' },
              { range: '61–80', label: 'Vigilant' },
              { range: '81–100', label: 'Caution' },
            ].map(t => (
              <div key={t.range}>
                <span className="font-body font-semibold" style={{ fontSize: '9px', color: 'var(--color-ink)' }}>{t.range}</span>
                <span className="font-body block" style={{ fontSize: '8px', color: 'var(--color-muted)' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="font-body flex items-center gap-1.5" style={{ fontSize: '11px', color: 'var(--color-ink)' }}>
            <span className="rounded-full" style={{ width: '8px', height: '8px', background: 'var(--color-primary)', display: 'inline-block', flexShrink: 0 }}></span> Police
          </span>
          <span className="font-body flex items-center gap-1.5" style={{ fontSize: '11px', color: 'var(--color-ink)' }}>
            <span className="rounded-full" style={{ width: '8px', height: '8px', background: 'var(--color-accent)', display: 'inline-block', flexShrink: 0 }}></span> Medical
          </span>
          <span className="font-body flex items-center gap-1.5" style={{ fontSize: '11px', color: 'var(--color-ink)' }}>
            <span className="rounded-full" style={{ width: '8px', height: '8px', background: '#d97706', display: 'inline-block', flexShrink: 0 }}></span> Notes
          </span>
        </div>
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        minZoom={11}
        maxZoom={19}
        maxBounds={[
          [18.82, 72.73],
          [19.38, 73.20]
        ]}
        maxBoundsViscosity={1.0}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController center={mapCenter} />
        <MapEventsHandler onMapClick={handleMapClick} />
        
        <TileLayer
          key={mapStyle}
          attribution={tileLayers[mapStyle].attribution}
          url={tileLayers[mapStyle].url}
          maxZoom={20}
        />

        {/* 🗺️ CHOROPLETH DANGER ZONE POLYGONS */}
        {showZones && filteredZones.map((zone, idx) => {
          const props = zone.properties;
          const coords = zone.geometry.coordinates[0].map(c => [c[1], c[0]]); // Leaflet [lat, lon]
          const color = props.color || (typeof props.score === 'number' ? getRiskTier(props.score).color : '#3b82f6');
          const tier = typeof props.score === 'number' ? getRiskTier(props.score) : { label: 'Mumbai Area', color: '#3b82f6' };

          return (
            <React.Fragment key={idx}>
              <Polygon
                positions={coords}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.45,
                  color: color,
                  weight: 2,
                  dashArray: '3, 3',
                  opacity: 0.95
                }}
                eventHandlers={{
                  click: () => setActiveZone(props)
                }}
              >
                <Popup>
                  <div className="min-w-[220px] p-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-slate-900">{props.name}</span>
                      {typeof props.score === 'number' && (
                        <span 
                          style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}50` }}
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
                        >
                          Risk: {props.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2 font-medium">BMC Ward: {props.ward || 'Mumbai Metropolitan'}</p>
                    <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 border border-slate-100 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[10px]">Safety Level:</span>
                        <strong style={{ color: color }} className="font-extrabold">{tier.label}</strong>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[10px]">
                        <span className="text-slate-500">Emergency Police:</span>
                        <a href="tel:112" className="text-blue-600 font-bold hover:underline">Dial 112 / 103</a>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Polygon>

              {/* Centered Area + Ward + Score Label */}
              {props.center && (
                <Marker 
                  position={props.center} 
                  icon={createZoneLabelIcon(props.name, props.ward, props.score)}
                  interactive={false}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* 🛡️ POLICE STATION CIRCLE SHIELD BADGES */}
        {showStations && stations?.features?.map((station, index) => {
          const coords = station.geometry.coordinates;

          return (
            <Marker 
              key={`st-${index}`} 
              position={[coords[1], coords[0]]}
              icon={policeStationShieldIcon}
              eventHandlers={{
                click: () => setActiveStation(station)
              }}
            >
              <Popup>
                <div className="min-w-[210px] p-3">
                  <div className="flex items-center gap-1.5 font-display mb-2" style={{ fontSize: '16px', color: 'var(--color-primary)' }}>
                    <Shield className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    <h4>{station.properties.name}</h4>
                  </div>
                  <p className="font-body mb-2" style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Ward: <strong style={{ color: 'var(--color-ink)' }}>{station.properties.ward || 'Mumbai Police'}</strong></p>
                  <div className="p-2 space-y-1" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <div className="flex justify-between font-body" style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                      <span>Helpline:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>112 / 100 / 103</strong>
                    </div>
                    <div className="flex justify-between font-body" style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                      <span>Status:</span>
                      <strong style={{ color: 'var(--color-accent)' }}>Active 24/7</strong>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 🏥 GOVERNMENT MEDICAL FACILITIES */}
        {showHavens && MUMBAI_SAFE_HAVENS.map((facility) => {
          const isHosp = facility.type === 'hospital';
          const icon = isHosp ? hospitalHavenIcon : pharmacyHavenIcon;

          return (
            <Marker
              key={facility.id}
              position={facility.coordinates}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[220px] p-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <h4 className="text-slate-900">{facility.name}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 block w-fit mb-2">
                    {facility.category || 'Government Medical Facility'}
                  </span>
                  <p className="text-[11px] text-slate-600 mb-2">{facility.address}</p>
                  <div className="bg-slate-50 p-2 rounded-lg text-[10px] text-slate-700 border border-slate-100 space-y-1 mb-2">
                    <div><strong>Department:</strong> {facility.owner_dept || 'Public Health Dept'}</div>
                    <div><strong>Ward:</strong> BMC Ward {facility.ward || 'Mumbai'}</div>
                    <div className="text-slate-500 italic">Operating hours not verified</div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates[0]},${facility.coordinates[1]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 font-body font-semibold text-white flex items-center justify-center gap-1"
                    style={{ background: 'var(--color-accent)', borderRadius: '10px', fontSize: '12px', textDecoration: 'none' }}
                  >
                    <ExternalLink className="w-3 h-3" /> Navigate to Facility
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ⚠️ LOCAL SAFETY NOTES */}
        {showHazards && hazards.map((haz) => (
          <Marker
            key={haz.id}
            position={haz.coordinates}
            icon={hazardPinIcon}
          >
            <Popup>
              <div className="min-w-[210px] p-1">
                <div className="flex items-center justify-between text-orange-600 font-bold text-xs mb-1">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    <h4>Local Safety Note</h4>
                  </div>
                  <button 
                    onClick={() => handleDeleteHazard(haz.id)}
                    className="text-slate-400 hover:text-rose-600 text-[10px] font-normal cursor-pointer"
                    title="Delete local note"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs font-extrabold text-slate-900 mb-1">{haz.title}</p>
                <p className="text-[11px] text-slate-500 mb-2">
                  Area: <strong>{haz.area}</strong> • {formatRelativeTime(haz.createdAt || haz.reportedAt)}
                </p>
                <div className="bg-slate-50 p-2 rounded-lg text-[10px] text-slate-600 border border-slate-200 flex items-center justify-between">
                  <span>Device Storage Only</span>
                  <span className="font-medium text-slate-400">Personal Note</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User GPS Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-xs font-bold text-emerald-700">📍 Detected GPS Location</div>
            </Popup>
          </Marker>
        )}

        {/* Selected Search / Clicked Point Marker */}
        {selectedPoint && (
          <Marker position={[selectedPoint.lat, selectedPoint.lng]} icon={searchPinIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <strong className="text-xs text-rose-600 block mb-1">Selected Location</strong>
                <p className="text-xs font-semibold text-slate-900">{selectedPoint.name}</p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Coordinates:</span>
                  <span>{selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

      </MapContainer>

      {/* Community Hazard Report Modal */}
      <CommunityReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onAddHazard={handleAddHazard}
        currentCoords={
          selectedPoint 
            ? { lat: selectedPoint.lat, lng: selectedPoint.lng, name: selectedPoint.name }
            : (userLocation ? { lat: userLocation[0], lng: userLocation[1], name: 'Detected GPS Location' } : null)
        }
      />
    </div>
  );
}
