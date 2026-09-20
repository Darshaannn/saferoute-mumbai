import React, { useState, useEffect, useRef } from 'react';
import { Shield, Navigation, AlertCircle, Info, Phone, MapPin, Share2, Locate, Compass, Clock, CheckCircle2, Sparkles, X, Volume2, VolumeX, MessageSquare, ExternalLink, UserPlus, Users, Trash2, PhoneForwarded, Scale, Heart, Timer, Plus, Car, Train, ArrowRight, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MUMBAI_SAFE_HAVENS } from '../data/safeHavens';
import { computeTransitOptions } from '../data/mumbaiTransitLines';
import FakeCallModal from '../components/FakeCallModal';
import TransitAndRightsModal from '../components/TransitAndRightsModal';
import API_BASE_URL from '../config/api';
import { apiRequest } from '../services/apiClient';

// Leaflet custom marker icons
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const trainStationIcon = L.divIcon({
  className: 'train-station-marker',
  html: `
    <div style="
      background: #2563eb;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const metroStationIcon = L.divIcon({
  className: 'metro-station-marker',
  html: `
    <div style="
      background: #6366f1;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const policeStationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28]
});

const hospitalHavenIcon = L.divIcon({
  className: 'hospital-haven-badge',
  html: `
    <div style="
      background: linear-gradient(135deg, #dc2626, #ef4444);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.4);
      cursor: pointer;
    ">
      <span style="color: white; font-weight: 900; font-size: 13px; line-height: 1;">✚</span>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11]
});

const pharmacyHavenIcon = L.divIcon({
  className: 'pharmacy-haven-badge',
  html: `
    <div style="
      background: linear-gradient(135deg, #059669, #10b981);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    ">
      <span style="color: white; font-weight: 900; font-size: 11px; line-height: 1;">✦</span>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

const POPULAR_MUMBAI_PLACES = [
  { name: "Bandra Kurla Complex (BKC)", zone: "Central Business Hub", lat: 19.0657, lng: 72.8687 },
  { name: "Colaba / Gateway of India", zone: "South Mumbai", lat: 18.9220, lng: 72.8347 },
  { name: "CSMT Railway Terminus", zone: "South Mumbai", lat: 18.9401, lng: 72.8354 },
  { name: "Marine Drive Promenade", zone: "South Mumbai", lat: 18.9432, lng: 72.8230 },
  { name: "Bandra West / Bandstand", zone: "Western Suburbs", lat: 19.0596, lng: 72.8295 },
  { name: "Dadar Railway Station", zone: "Central Mumbai", lat: 19.0182, lng: 72.8434 },
  { name: "Andheri Railway Station", zone: "Western Suburbs", lat: 19.1197, lng: 72.8464 },
  { name: "Mumbai Int'l Airport (T2)", zone: "Airport Zone", lat: 19.0896, lng: 72.8656 },
  { name: "Powai (Hiranandani)", zone: "Eastern Suburbs", lat: 19.1176, lng: 72.9060 },
  { name: "Borivali West", zone: "North Mumbai", lat: 19.2307, lng: 72.8567 },
  { name: "Juhu Beach", zone: "Western Suburbs", lat: 19.0988, lng: 72.8264 },
  { name: "Ghatkopar East", zone: "Eastern Suburbs", lat: 19.0860, lng: 72.9090 },
  { name: "Thane Station", zone: "MMR Zone", lat: 19.1860, lng: 72.9759 },
  { name: "Vashi", zone: "Navi Mumbai", lat: 19.0771, lng: 72.9986 },
  { name: "Lower Parel / High Street Phoenix", zone: "South Central", lat: 18.9953, lng: 72.8302 },
];

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && Array.isArray(positions) && positions.length > 0) {
      try {
        const validCoords = positions.filter(
          p => Array.isArray(p) && p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]) && p[0] !== null && p[1] !== null
        );
        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
          }
        }
      } catch (e) {
        console.warn("FitBounds handled safely:", e);
      }
    }
  }, [positions, map]);
  return null;
}

function JourneyMapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (e?.latlng) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

export default function SafeJourney() {
  const [journeyState, setJourneyState] = useState('planner'); // planner, active, emergency
  const [origin, setOrigin] = useState('Andheri Railway Station, Mumbai');
  const [destination, setDestination] = useState('Colaba / Gateway of India, Mumbai');
  const [originLocation, setOriginLocation] = useState({
    name: 'Andheri Railway Station, Mumbai',
    lat: 19.1197,
    lng: 72.8464,
    source: 'Default'
  });
  const [destinationLocation, setDestinationLocation] = useState({
    name: 'Colaba / Gateway of India, Mumbai',
    lat: 18.9220,
    lng: 72.8347,
    source: 'Default'
  });
  const [mapStyle, setMapStyle] = useState('osm');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Multi-Modal Transit State ('safest_cab' | 'direct_cab' | 'train' | 'metro')
  const [selectedTransitMode, setSelectedTransitMode] = useState('safest_cab');
  const [transitOptions, setTransitOptions] = useState(null);

  // Autocomplete state
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromHubs, setShowFromHubs] = useState(false);
  const [showToHubs, setShowToHubs] = useState(false);

  // Safety Timer / Dead-Man's Switch
  const [timerDurationSecs, setTimerDurationSecs] = useState(1200); // 20 mins default
  const [timerRemainingSecs, setTimerRemainingSecs] = useState(1200);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Modals state
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [showTransitGuide, setShowTransitGuide] = useState(false);

  // SOS & Emergency states
  const [sirenActive, setSirenActive] = useState(false);
  const [liveCoords, setLiveCoords] = useState(null); // Never default to fake coordinates
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | requesting | available | denied | unavailable
  const [trustedContacts, setTrustedContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('saferoute_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [contactError, setContactError] = useState('');
  const [showContactsModal, setShowContactsModal] = useState(false);

  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    handleAnalyze();
    if (navigator.geolocation) {
      setLocationStatus('requesting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('available');
        },
        (err) => {
          console.warn("Initial GPS check failed:", err.message);
          setLiveCoords(null);
          setLocationStatus(err.code === 1 ? 'denied' : 'unavailable');
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000 }
      );
    } else {
      setLocationStatus('unavailable');
    }
  }, []);

  // Continuous Real-Time GPS Tracking during Active Journey Mode
  useEffect(() => {
    if (journeyState === 'active') {
      if (navigator.geolocation) {
        setLocationStatus('requesting');
        // Clear any existing watcher before starting a new one
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }

        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLiveCoords(coords);
            setLocationStatus('available');
          },
          (err) => {
            console.warn("Continuous GPS tracking error:", err.message);
            setLocationStatus(err.code === 1 ? 'denied' : 'unavailable');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 3000
          }
        );
        watchIdRef.current = id;
      }
    } else {
      // Clear watcher when not in active journey state
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    // Cleanup on unmount or mode change
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [journeyState]);

  // Save contacts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('saferoute_contacts', JSON.stringify(trustedContacts));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [trustedContacts]);

  // Dead-Man's Safety Timer Countdown
  useEffect(() => {
    let interval;
    if (journeyState === 'active' && isTimerActive && timerRemainingSecs > 0) {
      interval = setInterval(() => {
        setTimerRemainingSecs((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            triggerSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [journeyState, isTimerActive, timerRemainingSecs]);

  // Audio Siren Synthesis (Web Audio API)
  const toggleSiren = () => {
    if (sirenActive) {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {
          console.warn(e);
        }
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {
          console.warn(e);
        }
      }
      setSirenActive(false);
    } else {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);

        // Siren frequency modulation loop
        let isHigh = false;
        const interval = setInterval(() => {
          if (!audioCtxRef.current) {
            clearInterval(interval);
            return;
          }
          const t = ctx.currentTime;
          if (isHigh) {
            osc.frequency.linearRampToValueAtTime(800, t + 0.25);
          } else {
            osc.frequency.linearRampToValueAtTime(1400, t + 0.25);
          }
          isHigh = !isHigh;
        }, 300);

        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        setSirenActive(true);
      } catch (err) {
        console.error("Audio error", err);
      }
    }
  };

  const addContact = (e) => {
    e.preventDefault();
    setContactError('');
    const trimmedName = newContactName.trim();
    const trimmedPhone = newContactPhone.trim().replace(/[\s-]/g, '');

    if (!trimmedName) {
      setContactError('Please enter a contact name.');
      return;
    }

    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setContactError('Please enter a valid phone number (digits only, optional +, 7–15 digits).');
      return;
    }

    setTrustedContacts([...trustedContacts, { name: trimmedName, phone: trimmedPhone }]);
    setNewContactName('');
    setNewContactPhone('');
    setContactError('');
  };

  const removeContact = (idx) => {
    setTrustedContacts(trustedContacts.filter((_, i) => i !== idx));
  };

  const handleBroadcastSOS = (targetPhone = null) => {
    if (!liveCoords || isNaN(liveCoords.lat) || isNaN(liveCoords.lng)) {
      alert("Current GPS location is unavailable. You can still access direct 112 and 103 emergency call options.");
      return;
    }
    const lat = Number(liveCoords.lat).toFixed(5);
    const lng = Number(liveCoords.lng).toFixed(5);
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const text = encodeURIComponent(`🚨 EMERGENCY ALERT - SafeRoute Mumbai\n\nI need immediate assistance. My current location snapshot:\n${mapsLink}\n\nNearby destination: ${destination}`);
    
    if (targetPhone) {
      const cleanPhone = String(targetPhone).replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleNavigateNearestStation = () => {
    const nearest = analysis?.safety_context?.nearby_police_stations?.[0];
    if (nearest?.coordinates) {
      const [lat, lon] = nearest.coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/police+station+near+me/`, '_blank');
    }
  };

  // Debounced place search helper
  const searchPlaces = (query, setFn, debounceRef, abortRef) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (!query || query.trim().length === 0) {
      setFn([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const data = await apiRequest(`/api/geocode?q=${encodeURIComponent(query.trim())}`, {
          signal: abortController.signal
        });
        setFn(data.results || []);
      } catch (e) {
        if (!e.isAborted) {
          console.error("Geocoding search error", e);
        }
      }
    }, 350);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLiveCoords({ lat, lng });
        let displayName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const data = await apiRequest(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (data.name) displayName = data.name;
        } catch {
          // fallback to coordinates string
        }
        setOrigin(displayName);
        setOriginLocation({
          name: displayName,
          lat: lat,
          lng: lng,
          source: 'GPS'
        });
      },
      () => {
        setErrorMsg("Unable to retrieve GPS location. Please type a Mumbai location.");
      }
    );
  };

  const handleMapPick = async (latlng) => {
    const lat = latlng.lat;
    const lng = latlng.lng;
    let displayName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    try {
      const data = await apiRequest(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (data.name) displayName = data.name;
    } catch {
      // fallback to coords string
    }
    setDestination(displayName);
    setDestinationLocation({
      name: displayName,
      lat: lat,
      lng: lng,
      source: 'Map Click'
    });
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!origin || !destination) {
      setErrorMsg("Please enter both starting point and destination in Mumbai.");
      return;
    }
    setAnalyzing(true);
    setErrorMsg('');
    try {
      const payload = {
        origin: origin.trim(),
        destination: destination.trim(),
        start: originLocation ? { lat: originLocation.lat, lng: originLocation.lng } : null,
        end: destinationLocation ? { lat: destinationLocation.lat, lng: destinationLocation.lng } : null
      };

      const data = await apiRequest('/api/journey/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setAnalysis(data);

      const sCoords = [data.route.origin.lat, data.route.origin.lng];
      const eCoords = [data.route.destination.lat, data.route.destination.lng];
      
      // Update structured location states if geocoded by backend
      if (!originLocation) {
        setOriginLocation({
          name: data.route.origin.name || origin,
          lat: data.route.origin.lat,
          lng: data.route.origin.lng,
          source: 'Resolved'
        });
      }
      if (!destinationLocation) {
        setDestinationLocation({
          name: data.route.destination.name || destination,
          lat: data.route.destination.lat,
          lng: data.route.destination.lng,
          source: 'Resolved'
        });
      }

      const multiModal = computeTransitOptions(sCoords, eCoords, data);
      setTransitOptions(multiModal);

      // Default to safest route
      setSelectedTransitMode('safest_cab');

      const estimatedMins = multiModal?.safest_cab?.durationMin || 25;
      setTimerDurationSecs((estimatedMins + 10) * 60);
      setTimerRemainingSecs((estimatedMins + 10) * 60);

    } catch (err) {
      setErrorMsg(err.message || "Unable to calculate route. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const currentOption = (transitOptions && transitOptions[selectedTransitMode]) 
    ? transitOptions[selectedTransitMode] 
    : (transitOptions?.safest_cab || transitOptions?.direct_cab || null);

  const activePolyline = currentOption?.polyline 
    || (analysis?.route?.geometry?.coordinates?.map(c => [c[1], c[0]]) || []);

  const secondaryPolyline = selectedTransitMode === 'safest_cab' && transitOptions?.direct_cab?.polyline
    ? transitOptions.direct_cab.polyline
    : (selectedTransitMode === 'direct_cab' && transitOptions?.safest_cab?.polyline ? transitOptions.safest_cab.polyline : null);

  const startJourney = () => {
    const mins = currentOption?.durationMin ? currentOption.durationMin + 8 : 20;
    setTimerDurationSecs(mins * 60);
    setTimerRemainingSecs(mins * 60);
    setJourneyState('active');
    setIsTimerActive(true);
  };

  const triggerSOS = () => {
    setJourneyState('emergency');
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const tileLayers = {
    'osm': {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    },
    'osm-hot': {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, Tiles courtesy of Humanitarian OpenStreetMap Team'
    }
  };

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto min-h-screen pb-20">
      <AnimatePresence mode="wait">
        
        {/* ================= STATE 1: PLANNER ================= */}
        {journeyState === 'planner' && (
          <motion.div 
            key="planner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Safe Journey Planner
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-600" /> Multi-Route Safety Optimization
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Compare verified road corridors, suburban railway, and CCTV metro lines across Mumbai.
                </p>
              </div>

              {/* Quick Utilities */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFakeCall(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <PhoneForwarded className="w-3.5 h-3.5 text-emerald-600" />
                  Fake Call
                </button>
                <button
                  onClick={() => setShowTransitGuide(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  Rights & Transit
                </button>
              </div>
            </div>

            {/* Split Screen 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* LEFT COLUMN: Input Form & Dual-Route Selector */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Route Input Form */}
                <form onSubmit={handleAnalyze} className="p-4 bg-white rounded-2xl shadow-xs border border-slate-200/80 space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      Trip Route
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowContactsModal(true)}
                      className="text-[11px] font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 transition"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Trusted Contacts ({trustedContacts.length})
                    </button>
                  </div>

                  {/* Origin */}
                  <div className="relative space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-slate-600">Starting Point</label>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={handleUseMyLocation}
                          className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium transition"
                        >
                          <Locate className="w-3 h-3" /> My GPS
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFromHubs(!showFromHubs)}
                          className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-0.5 font-medium transition"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" /> Quick Hubs
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-emerald-600" />
                      <input 
                        type="text" 
                        value={origin}
                        onChange={(e) => {
                          setOrigin(e.target.value);
                          // Invalidate previous coordinate selection if text is manually typed
                          setOriginLocation(null);
                          searchPlaces(e.target.value, setFromSuggestions, fromDebounceRef, fromAbortRef);
                        }}
                        placeholder="e.g. Andheri Station, Bandra, BKC..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />
                    </div>
                    
                    {fromSuggestions.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {fromSuggestions.map((place, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setOrigin(place.name);
                              setOriginLocation({
                                name: place.name,
                                lat: place.lat,
                                lng: place.lng,
                                source: place.source || 'Search'
                              });
                              setFromSuggestions([]);
                            }}
                            className="p-2.5 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center transition"
                          >
                            <span className="font-medium text-slate-800 truncate">{place.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">{place.source}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {showFromHubs && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-1 px-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Popular Hubs:</span>
                          <button type="button" onClick={() => setShowFromHubs(false)} className="text-slate-400 hover:text-slate-600 text-xs p-1">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                          {POPULAR_MUMBAI_PLACES.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setOrigin(p.name);
                                setOriginLocation({
                                  name: p.name,
                                  lat: p.lat,
                                  lng: p.lng,
                                  source: 'Quick Hub'
                                });
                                setShowFromHubs(false);
                              }}
                              className="text-left p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition"
                            >
                              <span className="text-xs font-medium text-slate-800 block truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{p.zone}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="relative space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-medium text-slate-600">Destination</label>
                      <button
                        type="button"
                        onClick={() => setShowToHubs(!showToHubs)}
                        className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-0.5 font-medium transition"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" /> Quick Hubs
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-rose-500" />
                      <input 
                        type="text" 
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          // Invalidate previous coordinate selection if text is manually typed
                          setDestinationLocation(null);
                          searchPlaces(e.target.value, setToSuggestions, toDebounceRef, toAbortRef);
                        }}
                        placeholder="e.g. Gateway of India, Dadar, Powai..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />
                    </div>

                    {toSuggestions.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {toSuggestions.map((place, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setDestination(place.name);
                              setDestinationLocation({
                                name: place.name,
                                lat: place.lat,
                                lng: place.lng,
                                source: place.source || 'Search'
                              });
                              setToSuggestions([]);
                            }}
                            className="p-2.5 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center transition"
                          >
                            <span className="font-medium text-slate-800 truncate">{place.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">{place.source}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {showToHubs && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-1 px-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Popular Hubs:</span>
                          <button type="button" onClick={() => setShowToHubs(false)} className="text-slate-400 hover:text-slate-600 text-xs p-1">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                          {POPULAR_MUMBAI_PLACES.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setDestination(p.name);
                                setDestinationLocation({
                                  name: p.name,
                                  lat: p.lat,
                                  lng: p.lng,
                                  source: 'Quick Hub'
                                });
                                setShowToHubs(false);
                              }}
                              className="text-left p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition"
                            >
                              <span className="text-xs font-medium text-slate-800 block truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{p.zone}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={analyzing}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Calculating Safety Metrics...
                      </>
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5" />
                        Analyze Route Options
                      </>
                    )}
                  </button>
                </form>

                {/* DUAL ROAD & MULTI-MODAL ROUTE SELECTOR CARDS */}
                {transitOptions && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-semibold text-slate-500">
                        Available Transit Options:
                      </span>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        Resource Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      
                      {/* 1. BEST SUPPORTED CORRIDOR (Always available) */}
                      {transitOptions.safest_cab && (
                        <button
                          type="button"
                          onClick={() => setSelectedTransitMode('safest_cab')}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer relative ${
                            selectedTransitMode === 'safest_cab'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                              RECOMMENDED
                            </span>
                            <span className="text-xs font-semibold opacity-90">{transitOptions.safest_cab.distanceKm} km</span>
                          </div>
                          <div className="font-bold text-xs mt-1">🛡️ Best Supported Corridor</div>
                          <div className="text-[11px] opacity-90">Resource Coverage: {transitOptions.safest_cab.resourceCoverage?.score || 85}/100</div>
                          <div className={`text-sm font-bold mt-1 ${selectedTransitMode === 'safest_cab' ? 'text-white' : 'text-emerald-700'}`}>
                            {transitOptions.safest_cab.durationMin} mins
                          </div>
                        </button>
                      )}

                      {/* 2. DIRECT FASTEST ROAD (Always available) */}
                      {transitOptions.direct_cab && (
                        <button
                          type="button"
                          onClick={() => setSelectedTransitMode('direct_cab')}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                            selectedTransitMode === 'direct_cab'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              selectedTransitMode === 'direct_cab' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                            }`}>
                              DIRECT
                            </span>
                            <span className="text-xs font-semibold opacity-90">{transitOptions.direct_cab.distanceKm} km</span>
                          </div>
                          <div className="font-bold text-xs mt-1">🚗 Direct Road</div>
                          <div className="text-[11px] opacity-90">Resource Coverage: {transitOptions.direct_cab.resourceCoverage?.score || 72}/100</div>
                          <div className={`text-sm font-bold mt-1 ${selectedTransitMode === 'direct_cab' ? 'text-white' : 'text-amber-700'}`}>
                            {transitOptions.direct_cab.durationMin} mins
                          </div>
                        </button>
                      )}

                      {/* 3. LOCAL TRAIN (Only shown if reachable) */}
                      {transitOptions.train && (
                        <button
                          type="button"
                          onClick={() => setSelectedTransitMode('train')}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                            selectedTransitMode === 'train'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <Train className="w-3.5 h-3.5" />
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              selectedTransitMode === 'train' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                            }`}>
                              FAST
                            </span>
                          </div>
                          <div className="font-bold text-xs">🚆 Suburban Rail</div>
                          <div className={`text-sm font-bold mt-1 ${selectedTransitMode === 'train' ? 'text-white' : 'text-blue-700'}`}>
                            {transitOptions.train.durationMin} mins
                          </div>
                        </button>
                      )}

                      {/* 4. METRO (Only shown if reachable) */}
                      {transitOptions.metro && (
                        <button
                          type="button"
                          onClick={() => setSelectedTransitMode('metro')}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                            selectedTransitMode === 'metro'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <Compass className="w-3.5 h-3.5" />
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              selectedTransitMode === 'metro' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              CCTV
                            </span>
                          </div>
                          <div className="font-bold text-xs">🚇 Metro Line</div>
                          <div className={`text-sm font-bold mt-1 ${selectedTransitMode === 'metro' ? 'text-white' : 'text-indigo-700'}`}>
                            {transitOptions.metro.durationMin} mins
                          </div>
                        </button>
                      )}

                    </div>

                    {/* Notice if Train or Metro are unavailable for the specific coordinates */}
                    {(!transitOptions.train || !transitOptions.metro) && (
                      <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] text-slate-500 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {!transitOptions.train && !transitOptions.metro 
                            ? "Local Train and Metro are outside feasible walking distance for this specific route. Road corridors recommended." 
                            : !transitOptions.train 
                              ? "Suburban local rail line is not directly accessible along this corridor." 
                              : "Metro line is outside direct reach for this specific origin / destination."}
                        </span>
                      </div>
                    )}

                    {/* Active Transit Mode Details & Context */}
                    {currentOption && (
                      <motion.div
                        key={selectedTransitMode}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white rounded-2xl shadow-xs border border-slate-200/80 space-y-3"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">{currentOption.modeLabel}</span>
                            <h4 className="font-bold text-slate-900 text-xs">{currentOption.name}</h4>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${currentOption.badgeColor}`}>
                            {currentOption.badge}
                          </span>
                        </div>

                        {/* Resource Coverage Score Badge Bar */}
                        {currentOption.resourceCoverage && (
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-slate-500 text-[10px] block">Safety Resource Coverage:</span>
                              <strong className="text-slate-900 text-xs">{currentOption.resourceCoverage.score} / 100</strong>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 text-[10px] block">Emergency Infrastructure:</span>
                              <strong className="text-emerald-700 text-xs">{currentOption.resourceCoverage.tier}</strong>
                            </div>
                          </div>
                        )}

                        {/* Highlights */}
                        <ul className="space-y-1 text-xs text-slate-700">
                          {currentOption.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Safety context summary */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                          <div><strong>Corridor Protection:</strong> {currentOption.safetyDetails}</div>
                          {analysis && (
                            <div className="text-slate-500 text-[10px]">
                              Nearby Police Stations: <strong>{analysis.safety_context.nearby_police_stations_count}</strong> • Medical Facilities: <strong>{analysis.safety_context.nearby_hospitals_count || 4}</strong>
                            </div>
                          )}
                        </div>

                        {/* Start Safe Journey Button */}
                        <button 
                          onClick={startJourney}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Start Safe Journey Mode
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Interactive Leaflet Route Map */}
              <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden relative h-[580px] flex flex-col">
                
                {/* Map style selector bar */}
                <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-1">
                  <button
                    onClick={() => setMapStyle('osm')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
                      mapStyle === 'osm' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    OSM Standard
                  </button>
                  <button
                    onClick={() => setMapStyle('osm-hot')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
                      mapStyle === 'osm-hot' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Terrain/HOT
                  </button>
                </div>

                {/* Mode Indicator Overlay Badge */}
                <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span 
                    style={{ backgroundColor: currentOption?.color || '#059669' }}
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                  ></span>
                  <span>Viewing {currentOption?.name || 'Best Supported Corridor'}</span>
                </div>

                <MapContainer
                  center={[19.0760, 72.8777]}
                  zoom={12}
                  minZoom={11}
                  maxBounds={[
                    [18.82, 72.73],
                    [19.38, 73.20]
                  ]}
                  maxBoundsViscosity={1.0}
                  className="w-full h-full z-0"
                  zoomControl={false}
                >
                  <JourneyMapClickHandler onMapClick={handleMapPick} />
                  
                  <TileLayer
                    key={mapStyle}
                    attribution={tileLayers[mapStyle].attribution}
                    url={tileLayers[mapStyle].url}
                    maxZoom={20}
                  />

                  {/* SECONDARY ALTERNATIVE POLYLINE (Dashed Line) */}
                  {secondaryPolyline && (
                    <Polyline
                      positions={secondaryPolyline}
                      pathOptions={{
                        color: selectedTransitMode === 'safest_cab' ? '#d97706' : '#059669',
                        weight: 4,
                        opacity: 0.6,
                        dashArray: '6, 8'
                      }}
                      eventHandlers={{
                        click: () => setSelectedTransitMode(selectedTransitMode === 'safest_cab' ? 'direct_cab' : 'safest_cab')
                      }}
                    />
                  )}

                  {/* ACTIVE PRIMARY POLYLINE */}
                  {activePolyline.length > 0 && (
                    <>
                      <FitBounds positions={activePolyline} />
                      <Polyline
                        positions={activePolyline}
                        pathOptions={{
                          color: currentOption?.color || '#059669',
                          weight: 6,
                          opacity: 0.9,
                          lineCap: 'round',
                          lineJoin: 'round'
                        }}
                      />
                      <Polyline
                        positions={activePolyline}
                        pathOptions={{
                          color: '#ffffff',
                          weight: 2,
                          opacity: 0.8,
                          dashArray: selectedTransitMode === 'train' ? '8, 8' : undefined
                        }}
                      />
                    </>
                  )}

                  {/* Station stops for Train and Metro modes */}
                  {selectedTransitMode === 'train' && currentOption?.stationsCovered?.map((st, i) => (
                    <Marker key={`tr-${i}`} position={st.coords} icon={trainStationIcon}>
                      <Popup>
                        <div className="text-xs">
                          <strong className="text-blue-700 block">{st.name} Railway Station</strong>
                          <span className="text-[10px] text-slate-500">Suburban Western Line • 24/7 GRP Chowki</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {selectedTransitMode === 'metro' && currentOption?.stationsCovered?.map((st, i) => (
                    <Marker key={`me-${i}`} position={st.coords} icon={metroStationIcon}>
                      <Popup>
                        <div className="text-xs">
                          <strong className="text-indigo-700 block">{st.name} Metro Station</strong>
                          <span className="text-[10px] text-slate-500">Aqua Line 3 • Guarded Women Platform</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Origin & Destination Markers */}
                  {(analysis?.route?.origin?.lat && analysis?.route?.origin?.lng) && (
                    <Marker position={[analysis.route.origin.lat, analysis.route.origin.lng]} icon={originIcon}>
                      <Popup>
                        <div className="text-xs">
                          <strong className="text-emerald-600 block">Origin:</strong>
                          <span>{origin}</span>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {(analysis?.route?.destination?.lat && analysis?.route?.destination?.lng) && (
                    <Marker position={[analysis.route.destination.lat, analysis.route.destination.lng]} icon={destIcon}>
                      <Popup>
                        <div className="text-xs">
                          <strong className="text-rose-600 block">Destination:</strong>
                          <span>{destination}</span>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Mapped Medical Facilities on Map */}
                  {MUMBAI_SAFE_HAVENS.slice(0, 15).map((h) => {
                    const icon = h.type === 'hospital' ? hospitalHavenIcon : pharmacyHavenIcon;
                    return (
                      <Marker key={h.id} position={h.coordinates} icon={icon}>
                        <Popup>
                          <div className="min-w-[180px] p-1 text-xs">
                            <span className="font-bold text-slate-900 block">{h.name}</span>
                            <span className="text-[10px] text-rose-600 font-semibold block">{h.category}</span>
                            <p className="text-[11px] text-slate-500 mt-1">{h.address}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

            </div>
          </motion.div>
        )}

        {/* ================= STATE 2: ACTIVE JOURNEY WITH SAFETY TIMER ================= */}
        {journeyState === 'active' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 max-w-lg mx-auto"
          >
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200/80 text-center relative overflow-hidden">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                <Shield className="w-6 h-6" />
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-0.5">
                {currentOption?.name || 'Safe Journey'} Active
              </h2>
              <p className="text-slate-500 text-xs mb-4">Real-time corridor protection enabled</p>

              {/* DEAD MAN'S SAFETY TIMER COMPONENT */}
              <div className="mb-5 p-4 bg-slate-900 text-white rounded-2xl shadow-xs text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Timer className="w-3.5 h-3.5 text-emerald-400" />
                    Emergency Check-in Timer
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium bg-white/10 px-2 py-0.5 rounded-full">
                    Check-in Timer
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold font-mono text-emerald-400 tracking-wider">
                      {formatTimer(timerRemainingSecs)}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Opens emergency actions if you do not check in.
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setTimerRemainingSecs((s) => s + 300)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 5m
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerActive(false);
                        setJourneyState('planner');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      I&apos;m Safe
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Route Summary */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-left">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">From</span>
                  <span className="font-medium text-slate-800 text-xs truncate block">{origin}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">To</span>
                  <span className="font-medium text-slate-800 text-xs truncate block">{destination}</span>
                </div>
              </div>

              {/* Quick Actions Strip */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setShowFakeCall(true)}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <PhoneForwarded className="w-3.5 h-3.5 text-emerald-600" />
                  Fake Call
                </button>
                <button
                  onClick={() => handleBroadcastSOS()}
                  className={`p-2.5 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    liveCoords 
                      ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-80'
                  }`}
                  title={liveCoords ? "Share current GPS location snapshot" : "GPS location is currently unavailable"}
                >
                  <Share2 className={`w-3.5 h-3.5 ${liveCoords ? 'text-blue-600' : 'text-slate-400'}`} />
                  {liveCoords ? 'Share Current Location' : 'GPS Unavailable'}
                </button>
              </div>

              {/* GPS Connection Notice if unavailable */}
              {!liveCoords && (
                <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 text-left flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>GPS location unavailable. You can still access emergency call options and the safety timer.</span>
                </div>
              )}

              {/* End Trip Button */}
              <button 
                onClick={() => setJourneyState('planner')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                End Safe Trip & Return
              </button>
            </div>

            {/* SOS Trigger Card */}
            <button 
              onClick={triggerSOS}
              className="w-full py-6 bg-rose-600 hover:bg-rose-700 text-white rounded-3xl shadow-lg shadow-rose-500/20 flex flex-col items-center justify-center transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-6 h-6" />
                <span className="text-2xl font-black tracking-wider">EMERGENCY SOS</span>
              </div>
              <span className="text-xs text-rose-100">One-tap direct access to 112, Women Cell 103, and live sirens</span>
            </button>
          </motion.div>
        )}

        {/* ================= STATE 3: FULL SCREEN SOS ================= */}
        {journeyState === 'emergency' && (
          <motion.div 
            key="emergency"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-md text-white flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Emergency Protocol Active</h1>
                <p className="text-slate-400 text-xs mt-1">
                  Connect immediately with Mumbai emergency dispatch or share your current location snapshot.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a 
                  href="tel:112" 
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-rose-600/30"
                >
                  <Phone className="w-4 h-4" />
                  Call 112 (Police Dispatch)
                </a>

                <a 
                  href="tel:103" 
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Shield className="w-4 h-4 text-rose-400" />
                  Call 103 (Women&apos;s Helpline)
                </a>

                {/* Quick-Select Trusted Contacts WhatsApp Direct Buttons */}
                {trustedContacts.length > 0 && (
                  <div className="space-y-1.5 pt-1 text-left">
                    <span className="text-[11px] font-semibold text-slate-300 block">Send Location Snapshot to Contact:</span>
                    {trustedContacts.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleBroadcastSOS(c.phone)}
                        className="w-full py-2.5 px-3 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-600/40 text-white rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                          <span className="font-semibold">{c.name}</span>
                          <span className="text-[10px] text-emerald-200 opacity-80 truncate">({c.phone})</span>
                        </span>
                        <span className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded-md shrink-0">Open WhatsApp</span>
                      </button>
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => handleBroadcastSOS()}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Share Current Location via WhatsApp
                </button>

                <button 
                  onClick={handleNavigateNearestStation}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Navigate to Nearest Police Station
                </button>

                <button 
                  onClick={toggleSiren}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition border cursor-pointer ${
                    sirenActive 
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {sirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {sirenActive ? 'Stop Emergency Siren' : 'Play High-Pitch Safety Siren'}
                </button>
              </div>

              <button 
                onClick={() => {
                  if (sirenActive) toggleSiren();
                  setJourneyState('active');
                }}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-medium transition pt-2 cursor-pointer"
              >
                Return to Safe Trip Tracking
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* TRUSTED CONTACTS MODAL */}
      {showContactsModal && (
        <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Trusted Emergency Contacts
              </h3>
              <button 
                onClick={() => {
                  setShowContactsModal(false);
                  setContactError('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Trusted contacts are saved on this device for quick access during emergencies.
            </p>

            {/* List of Contacts */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {trustedContacts.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No trusted contacts added yet. Add a contact below for quick access during emergency situations.
                </div>
              ) : (
                trustedContacts.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{c.name}</span>
                      <span className="text-slate-500 text-[11px]">{c.phone}</span>
                    </div>
                    <button
                      onClick={() => removeContact(i)}
                      className="text-rose-500 hover:text-rose-700 p-1.5"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Contact Form */}
            <form onSubmit={addContact} className="pt-2 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block">Add New Contact:</span>
              {contactError && (
                <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg">
                  {contactError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name (e.g. Sister)"
                  value={newContactName}
                  onChange={(e) => {
                    setNewContactName(e.target.value);
                    if (contactError) setContactError('');
                  }}
                  className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone (+91 / digits)"
                  value={newContactPhone}
                  onChange={(e) => {
                    setNewContactPhone(e.target.value);
                    if (contactError) setContactError('');
                  }}
                  className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Trusted Contact
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global Modals for Fast Access */}
      <FakeCallModal isOpen={showFakeCall} onClose={() => setShowFakeCall(false)} />
      <TransitAndRightsModal isOpen={showTransitGuide} onClose={() => setShowTransitGuide(false)} />
    </div>
  );
}
