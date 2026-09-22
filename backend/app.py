from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import os
import io
import asyncio
import math
import time
import hashlib
import requests
from collections import defaultdict
from functools import wraps
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

try:
    import edge_tts
except ImportError:
    edge_tts = None

try:
    from gtts import gTTS
except ImportError:
    gTTS = None

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
ORS_API_KEY = os.getenv('ORS_API_KEY', '')

# --- In-Memory TTL Geocoding Cache (Short TTL: 10 mins, no user GPS stored) ---
GEOCODE_CACHE = {}
GEOCODE_CACHE_TTL_SECS = 600  # 10 minutes

# --- In-Memory TTL TTS Audio Cache (24 hours, keyed by sha256 of voice+text) ---
TTS_AUDIO_CACHE = {}
TTS_AUDIO_CACHE_TTL_SECS = 86400  # 24 hours


def get_cached_geocode(key):
    now = time.time()
    if key in GEOCODE_CACHE:
        data, exp = GEOCODE_CACHE[key]
        if exp > now:
            return data
        else:
            del GEOCODE_CACHE[key]
    return None

def set_cached_geocode(key, data):
    now = time.time()
    # Housekeeping: clean expired items if cache grows
    if len(GEOCODE_CACHE) > 500:
        expired = [k for k, (_, exp) in GEOCODE_CACHE.items() if exp <= now]
        for k in expired:
            del GEOCODE_CACHE[k]
    GEOCODE_CACHE[key] = (data, now + GEOCODE_CACHE_TTL_SECS)

# --- Lightweight IP-based Sliding Window Rate Limiter ---
RATE_LIMIT_STORE = defaultdict(list)

def rate_limit(max_requests=60, window_secs=60):
    """
    Lightweight, dependency-free in-memory rate limiter per client IP.
    Returns HTTP 429 with clean JSON if limit exceeded.
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Resolve client IP (supporting X-Forwarded-For if behind reverse proxy like Render)
            forwarded = request.headers.get('X-Forwarded-For')
            ip = forwarded.split(',')[0].strip() if forwarded else request.remote_addr or '127.0.0.1'
            endpoint_key = f"{f.__name__}:{ip}"
            
            now = time.time()
            timestamps = RATE_LIMIT_STORE[endpoint_key]
            
            # Prune timestamps older than the sliding window
            RATE_LIMIT_STORE[endpoint_key] = [t for t in timestamps if t > now - window_secs]
            
            if len(RATE_LIMIT_STORE[endpoint_key]) >= max_requests:
                return jsonify({
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Please wait a moment before sending another request."
                }), 429
                
            RATE_LIMIT_STORE[endpoint_key].append(now)
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Comprehensive Mumbai Landmarks Fallback Map
MUMBAI_LANDMARKS = {
    "andheri": {"name": "Andheri West, Mumbai", "lat": 19.1136, "lng": 72.8697},
    "andheri station": {"name": "Andheri Railway Station", "lat": 19.1197, "lng": 72.8464},
    "andheri railway station": {"name": "Andheri Railway Station, Mumbai", "lat": 19.1197, "lng": 72.8464},
    "andheri east": {"name": "Andheri East, Mumbai", "lat": 19.1158, "lng": 72.8722},
    "andheri west": {"name": "Andheri West, Mumbai", "lat": 19.1136, "lng": 72.8697},
    "bandra": {"name": "Bandra West, Mumbai", "lat": 19.0596, "lng": 72.8295},
    "bandra west": {"name": "Bandra West / Bandstand, Mumbai", "lat": 19.0596, "lng": 72.8295},
    "bandra bandstand": {"name": "Bandra Bandstand, Mumbai", "lat": 19.0520, "lng": 72.8190},
    "bandra terminus": {"name": "Bandra Terminus", "lat": 19.0628, "lng": 72.8407},
    "bandra station": {"name": "Bandra Railway Station", "lat": 19.0544, "lng": 72.8403},
    "bkc": {"name": "Bandra Kurla Complex (BKC), Mumbai", "lat": 19.0657, "lng": 72.8687},
    "bandra kurla complex": {"name": "Bandra Kurla Complex (BKC), Mumbai", "lat": 19.0657, "lng": 72.8687},
    "dadar": {"name": "Dadar West, Mumbai", "lat": 19.0178, "lng": 72.8478},
    "dadar station": {"name": "Dadar Railway Station", "lat": 19.0182, "lng": 72.8434},
    "dadar railway station": {"name": "Dadar Railway Station, Mumbai", "lat": 19.0182, "lng": 72.8434},
    "colaba": {"name": "Colaba, Mumbai", "lat": 18.9067, "lng": 72.8147},
    "colaba / gateway of india": {"name": "Colaba / Gateway of India, Mumbai", "lat": 18.9220, "lng": 72.8347},
    "colaba gateway": {"name": "Colaba / Gateway of India, Mumbai", "lat": 18.9220, "lng": 72.8347},
    "gateway of india": {"name": "Gateway of India, Colaba", "lat": 18.9220, "lng": 72.8347},
    "gateway of india, colaba": {"name": "Gateway of India, Colaba, Mumbai", "lat": 18.9220, "lng": 72.8347},
    "csmt": {"name": "Chhatrapati Shivaji Maharaj Terminus (CSMT)", "lat": 18.9401, "lng": 72.8354},
    "csmt station": {"name": "Chhatrapati Shivaji Maharaj Terminus (CSMT)", "lat": 18.9401, "lng": 72.8354},
    "csmt railway terminus": {"name": "CSMT Railway Terminus, Mumbai", "lat": 18.9401, "lng": 72.8354},
    "churchgate": {"name": "Churchgate Railway Station, Mumbai", "lat": 18.9322, "lng": 72.8264},
    "churchgate station": {"name": "Churchgate Railway Station, Mumbai", "lat": 18.9322, "lng": 72.8264},
    "kurla": {"name": "Kurla West, Mumbai", "lat": 19.0726, "lng": 72.8845},
    "kurla station": {"name": "Kurla Railway Station", "lat": 19.0653, "lng": 72.8793},
    "lokmanya tilak terminus": {"name": "Lokmanya Tilak Terminus (LTT), Kurla", "lat": 19.0688, "lng": 72.8911},
    "ghatkopar": {"name": "Ghatkopar East, Mumbai", "lat": 19.0860, "lng": 72.9090},
    "ghatkopar east": {"name": "Ghatkopar East, Mumbai", "lat": 19.0860, "lng": 72.9090},
    "ghatkopar station": {"name": "Ghatkopar Railway & Metro Station", "lat": 19.0865, "lng": 72.9080},
    "powai": {"name": "Powai (Hiranandani), Mumbai", "lat": 19.1176, "lng": 72.9060},
    "powai hiranandani": {"name": "Powai (Hiranandani), Mumbai", "lat": 19.1176, "lng": 72.9060},
    "iit bombay": {"name": "IIT Bombay, Powai", "lat": 19.1334, "lng": 72.9133},
    "borivali": {"name": "Borivali West, Mumbai", "lat": 19.2307, "lng": 72.8567},
    "borivali west": {"name": "Borivali West, Mumbai", "lat": 19.2307, "lng": 72.8567},
    "borivali station": {"name": "Borivali Railway Station", "lat": 19.2294, "lng": 72.8576},
    "malad": {"name": "Malad West, Mumbai", "lat": 19.1874, "lng": 72.8484},
    "malad west": {"name": "Malad West, Mumbai", "lat": 19.1874, "lng": 72.8484},
    "kandivali": {"name": "Kandivali West, Mumbai", "lat": 19.2062, "lng": 72.8398},
    "kandivali west": {"name": "Kandivali West, Mumbai", "lat": 19.2062, "lng": 72.8398},
    "goregaon": {"name": "Goregaon West, Mumbai", "lat": 19.1663, "lng": 72.8478},
    "goregaon west": {"name": "Goregaon West, Mumbai", "lat": 19.1663, "lng": 72.8478},
    "juhu": {"name": "Juhu Beach, Mumbai", "lat": 19.0988, "lng": 72.8264},
    "juhu beach": {"name": "Juhu Beach, Mumbai", "lat": 19.0988, "lng": 72.8264},
    "chembur": {"name": "Chembur, Mumbai", "lat": 19.0522, "lng": 72.9005},
    "worli": {"name": "Worli Sea Face, Mumbai", "lat": 19.0166, "lng": 72.8185},
    "worli sea face": {"name": "Worli Sea Face, Mumbai", "lat": 19.0166, "lng": 72.8185},
    "lower parel": {"name": "Lower Parel / High Street Phoenix, Mumbai", "lat": 18.9953, "lng": 72.8302},
    "lower parel / high street phoenix": {"name": "Lower Parel / High Street Phoenix, Mumbai", "lat": 18.9953, "lng": 72.8302},
    "marine drive": {"name": "Marine Drive Promenade, Mumbai", "lat": 18.9432, "lng": 72.8230},
    "marine drive promenade": {"name": "Marine Drive Promenade, Mumbai", "lat": 18.9432, "lng": 72.8230},
    "nariman point": {"name": "Nariman Point, Mumbai", "lat": 18.9256, "lng": 72.8242},
    "sion": {"name": "Sion Circle, Mumbai", "lat": 19.0390, "lng": 72.8619},
    "thane": {"name": "Thane Railway Station, Mumbai MMR", "lat": 19.1860, "lng": 72.9759},
    "thane station": {"name": "Thane Railway Station, Mumbai MMR", "lat": 19.1860, "lng": 72.9759},
    "vashi": {"name": "Vashi, Navi Mumbai", "lat": 19.0771, "lng": 72.9986},
    "mumbai airport": {"name": "Chhatrapati Shivaji Maharaj Int'l Airport (BOM T2)", "lat": 19.0896, "lng": 72.8656},
    "mumbai int'l airport (t2)": {"name": "Mumbai Int'l Airport (T2)", "lat": 19.0896, "lng": 72.8656},
    "domestic airport": {"name": "Mumbai Domestic Airport (T1)", "lat": 19.0950, "lng": 72.8528},
}

def load_json(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def distance_to_segment(p_lat, p_lon, a_lat, a_lon, b_lat, b_lon):
    d_ab = haversine(a_lat, a_lon, b_lat, b_lon)
    if d_ab == 0:
        return haversine(p_lat, p_lon, a_lat, a_lon)
    d_ap = haversine(a_lat, a_lon, p_lat, p_lon)
    d_bp = haversine(b_lat, b_lon, p_lat, p_lon)
    if (d_ap**2 > d_ab**2 + d_bp**2) or (d_bp**2 > d_ab**2 + d_ap**2):
        return min(d_ap, d_bp)
    s = (d_ab + d_ap + d_bp) / 2.0
    area = math.sqrt(max(0, s * (s - d_ab) * (s - d_ap) * (s - d_bp)))
    return (2 * area) / d_ab if d_ab > 0 else d_ap

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "ors_enabled": bool(ORS_API_KEY)})

@app.route('/api/crimes/summary', methods=['GET'])
def crimes_summary():
    data = load_json('crime_stats.json')
    if data:
        return jsonify(data)
    return jsonify({"error": "Crime stats data not found"}), 404

@app.route('/api/police-stations', methods=['GET'])
def police_stations():
    data = load_json('police_stations.geojson')
    if data:
        return jsonify(data)
    return jsonify({"error": "Police stations data not found"}), 404

@app.route('/api/hospitals', methods=['GET'])
def mumbai_hospitals():
    data = load_json('mumbai_hospitals.geojson')
    if data:
        return jsonify(data)
    return jsonify({"error": "Hospitals data not found"}), 404

@app.route('/api/maternity-homes', methods=['GET'])
def mumbai_maternity_homes():
    data = load_json('mumbai_maternity_homes.geojson')
    if data:
        return jsonify(data)
    return jsonify({"error": "Maternity homes data not found"}), 404

@app.route('/api/zones', methods=['GET'])
def mumbai_zones():
    data = load_json('mumbai_zones.geojson')
    if data:
        return jsonify(data)
    return jsonify({"error": "Mumbai zones data not found"}), 404

@app.route('/api/reverse-geocode', methods=['GET'])
@rate_limit(max_requests=60, window_secs=60)
def reverse_geocode():
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    if not lat or not lng:
        return jsonify({"name": "Selected Mumbai Location"})
    
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {"lat": lat, "lon": lng, "format": "json"}
        headers = {"User-Agent": "SafeRouteMumbaiApp/1.0"}
        resp = requests.get(url, params=params, headers=headers, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            display_name = data.get('display_name', '')
            parts = [p.strip() for p in display_name.split(',') if p.strip()]
            short_name = ", ".join(parts[:3]) if len(parts) >= 3 else display_name
            return jsonify({"name": short_name or f"Point ({lat[:6]}, {lng[:6]})"})
    except Exception as e:
        print(f"Reverse geocode error: {e}")
        
    return jsonify({"name": f"Location ({float(lat):.4f}, {float(lng):.4f})"})

@app.route('/api/geocode', methods=['GET', 'POST'])
@rate_limit(max_requests=60, window_secs=60)
def geocode():
    query = request.args.get('q', '').strip()
    if not query and request.is_json:
        query = request.json.get('query', '').strip()
    
    if not query:
        return jsonify({"results": []})
    
    q_clean = query.lower().strip()

    # Check in-memory short TTL cache (key is normalized query text)
    cached_results = get_cached_geocode(q_clean)
    if cached_results is not None:
        return jsonify({"results": cached_results, "cached": True})

    results = []
    seen_coords = set()

    # 1. Match local high-priority landmarks first
    for k, v in MUMBAI_LANDMARKS.items():
        if k in q_clean or q_clean in k:
            key = (round(v["lat"], 3), round(v["lng"], 3))
            if key not in seen_coords:
                seen_coords.add(key)
                results.append({
                    "name": v["name"],
                    "lat": v["lat"],
                    "lng": v["lng"],
                    "source": "Mumbai Landmark"
                })

    # 2. Fast POI Search with Photon (finds specific Mumbai shops, hospitals, stations, malls, buildings)
    try:
        search_query = query if ("mumbai" in q_clean or "maharashtra" in q_clean) else f"{query} Mumbai"
        url = "https://photon.komoot.io/api/"
        params = {
            "q": search_query,
            "lat": 19.0760,
            "lon": 72.8777,
            "limit": 10
        }
        headers = {"User-Agent": "SafeRouteMumbaiApp/1.0"}
        resp = requests.get(url, params=params, headers=headers, timeout=3.5)
        if resp.status_code == 200:
            features = resp.json().get('features', [])
            for f in features:
                coords = f.get('geometry', {}).get('coordinates', [])
                props = f.get('properties', {})
                if len(coords) >= 2:
                    lon, lat = coords[0], coords[1]
                    # Strictly filter to Mumbai MMR (Lat: 18.85 to 19.35, Lon: 72.75 to 73.15)
                    if 18.80 <= lat <= 19.38 and 72.73 <= lon <= 73.20:
                        coord_key = (round(lat, 3), round(lon, 3))
                        if coord_key not in seen_coords:
                            seen_coords.add(coord_key)
                            name_parts = [
                                props.get('name', ''),
                                props.get('street', ''),
                                props.get('district', '') or props.get('city', 'Mumbai')
                            ]
                            clean_label = ", ".join([p for p in name_parts if p]) or props.get('name', query.title())
                            results.append({
                                "name": clean_label,
                                "lat": lat,
                                "lng": lon,
                                "source": props.get('osm_value', 'Place').title()
                            })
    except Exception as e:
        print(f"Photon Geocoding error: {e}")

    # 3. OpenRouteService Geocoding (strictly bounded)
    if len(results) < 5 and ORS_API_KEY:
        try:
            url = "https://api.openrouteservice.org/geocode/search"
            headers = {"Authorization": ORS_API_KEY}
            params = {
                "text": query if "mumbai" in q_clean else f"{query}, Mumbai",
                "boundary.country": "IND",
                "boundary.rect.min_lon": 72.73,
                "boundary.rect.min_lat": 18.80,
                "boundary.rect.max_lon": 73.20,
                "boundary.rect.max_lat": 19.38,
                "focus.point.lat": 19.0760,
                "focus.point.lon": 72.8777,
                "size": 5
            }
            resp = requests.get(url, headers=headers, params=params, timeout=4)
            if resp.status_code == 200:
                features = resp.json().get('features', [])
                for f in features:
                    coords = f.get('geometry', {}).get('coordinates', [])
                    props = f.get('properties', {})
                    if len(coords) >= 2:
                        lon, lat = coords[0], coords[1]
                        if 18.80 <= lat <= 19.38 and 72.73 <= lon <= 73.20:
                            coord_key = (round(lat, 3), round(lon, 3))
                            if coord_key not in seen_coords:
                                seen_coords.add(coord_key)
                                results.append({
                                    "name": props.get('label') or props.get('name') or query.title(),
                                    "lat": lat,
                                    "lng": lon,
                                    "source": "OpenRouteService"
                                })
        except Exception as e:
            print(f"ORS Geocoding error: {e}")

    # 4. OpenStreetMap Nominatim Search fallback (strictly bounded to Mumbai)
    if len(results) < 3:
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                "q": f"{query}, Mumbai",
                "format": "json",
                "limit": 5,
                "viewbox": "72.73,19.38,73.20,18.80",
                "bounded": 1
            }
            headers = {"User-Agent": "SafeRouteMumbaiApp/1.0"}
            resp = requests.get(url, params=params, headers=headers, timeout=4)
            if resp.status_code == 200:
                for item in resp.json():
                    lat, lon = float(item['lat']), float(item['lon'])
                    if 18.80 <= lat <= 19.38 and 72.73 <= lon <= 73.20:
                        coord_key = (round(lat, 3), round(lon, 3))
                        if coord_key not in seen_coords:
                            seen_coords.add(coord_key)
                            disp = item.get('display_name', query.title())
                            parts = [p.strip() for p in disp.split(',') if p.strip()]
                            short = ", ".join(parts[:3]) if len(parts) >= 3 else disp
                            results.append({
                                "name": short,
                                "lat": lat,
                                "lng": lon,
                                "source": "OpenStreetMap"
                            })
        except Exception as e:
            print(f"Nominatim Geocoding error: {e}")

    final_results = results[:8]
    if final_results:
        set_cached_geocode(q_clean, final_results)

    return jsonify({"results": final_results})

@app.route('/api/journey/analyze', methods=['POST'])
@rate_limit(max_requests=30, window_secs=60)
def analyze_journey():
    req_data = request.json or {}
    start = req_data.get('start')
    end = req_data.get('end')
    origin_name = req_data.get('origin', '').strip()
    destination_name = req_data.get('destination', '').strip()
    travel_mode = req_data.get('mode', 'driving-car')
    
    def validate_coord(coord_obj):
        if not isinstance(coord_obj, dict):
            return None
        try:
            lat = float(coord_obj.get('lat'))
            lng = float(coord_obj.get('lng'))
            # Check for NaN / Inf
            if lat != lat or lng != lng:
                return None
            # Validate within Mumbai Metropolitan Region (MMR)
            if 18.80 <= lat <= 19.38 and 72.73 <= lng <= 73.20:
                return {"lat": lat, "lng": lng}
            return None
        except (ValueError, TypeError):
            return None

    def find_coords(name):
        if not name:
            return None
        n_clean = name.strip().lower()
        
        # Check cache
        cached = get_cached_geocode(f"coord:{n_clean}")
        if cached:
            return cached
            
        # 1. Direct or substring match in MUMBAI_LANDMARKS
        for k, v in MUMBAI_LANDMARKS.items():
            if k == n_clean or k in n_clean or n_clean in k:
                res = {"lat": v["lat"], "lng": v["lng"]}
                set_cached_geocode(f"coord:{n_clean}", res)
                return res
                
        # 2. Token / keyword matching across landmarks
        # Remove common filler words
        clean_tokens = set([t for t in n_clean.replace(',', ' ').replace('/', ' ').split() if t not in ('mumbai', 'station', 'the', 'near', 'in', 'at', 'and', 'railway', 'terminal', 'terminus')])
        if clean_tokens:
            for k, v in MUMBAI_LANDMARKS.items():
                k_tokens = set([t for t in k.replace(',', ' ').replace('/', ' ').split() if t not in ('mumbai', 'station', 'the', 'near', 'in', 'at', 'and', 'railway', 'terminal', 'terminus')])
                if clean_tokens & k_tokens:
                    res = {"lat": v["lat"], "lng": v["lng"]}
                    set_cached_geocode(f"coord:{n_clean}", res)
                    return res
        
        # 3. Try Photon Komoot geocoder (fast timeout 2.5s)
        try:
            search_q = f"{name} Mumbai" if "mumbai" not in n_clean else name
            r = requests.get(
                "https://photon.komoot.io/api/",
                params={"q": search_q, "lat": 19.0760, "lon": 72.8777, "limit": 1},
                headers={"User-Agent": "SafeRouteMumbaiApp/1.0"},
                timeout=2.5
            )
            if r.status_code == 200:
                feats = r.json().get('features', [])
                if feats:
                    c = feats[0]['geometry']['coordinates']
                    lat, lon = c[1], c[0]
                    if 18.80 <= lat <= 19.38 and 72.73 <= lon <= 73.20:
                        res = {"lat": lat, "lng": lon}
                        set_cached_geocode(f"coord:{n_clean}", res)
                        return res
        except Exception:
            pass
            
        # 4. Try Nominatim geocoder (fast timeout 2.5s)
        try:
            nom_url = "https://nominatim.openstreetmap.org/search"
            nom_params = {
                "q": f"{name}, Mumbai",
                "format": "json",
                "limit": 1,
                "viewbox": "72.73,19.38,73.20,18.80",
                "bounded": 1
            }
            nom_headers = {"User-Agent": "SafeRouteMumbaiApp/1.0"}
            nom_res = requests.get(nom_url, params=nom_params, headers=nom_headers, timeout=2.5)
            if nom_res.status_code == 200:
                nom_items = nom_res.json()
                if nom_items:
                    lat, lon = float(nom_items[0]['lat']), float(nom_items[0]['lon'])
                    if 18.80 <= lat <= 19.38 and 72.73 <= lon <= 73.20:
                        res = {"lat": lat, "lng": lon}
                        set_cached_geocode(f"coord:{n_clean}", res)
                        return res
        except Exception:
            pass

        return None

    valid_start = validate_coord(start)
    if not valid_start:
        if origin_name:
            valid_start = find_coords(origin_name)
        if not valid_start:
            return jsonify({
                "error": "origin_not_found",
                "message": f"We could not confidently identify the starting location '{origin_name or 'Origin'}' in Mumbai. Please select a suggested Mumbai location."
            }), 422

    valid_end = validate_coord(end)
    if not valid_end:
        if destination_name:
            valid_end = find_coords(destination_name)
        if not valid_end:
            return jsonify({
                "error": "destination_not_found",
                "message": f"We could not confidently identify the destination '{destination_name or 'Destination'}' in Mumbai. Please select a suggested Mumbai destination."
            }), 422

    start_lat, start_lng = valid_start['lat'], valid_start['lng']
    end_lat, end_lng = valid_end['lat'], valid_end['lng']
    
    crime_stats = load_json('crime_stats.json') or {}
    stations_geojson = load_json('police_stations.geojson') or {"features": []}
    
    city_risk = crime_stats.get('city_wide_risk_indicator', 55)
    
    zones_geojson = load_json('mumbai_zones.geojson') or {"features": []}
    
    def evaluate_route_resources(coords_list):
        if not coords_list:
            return {
                "coverage_score": 50,
                "coverage_tier": "Moderate Support",
                "nearby_police_count": 0,
                "nearest_police_km": 99.0,
                "nearby_medical_count": 0,
                "nearest_medical_km": 99.0,
                "zones_traversed": ["Mumbai Central"],
                "explanation": "Measures proximity to mapped emergency infrastructure. It does not predict personal safety."
            }

        # 1. Identify administrative neighborhoods / areas traversed
        traversed = []
        step = max(1, len(coords_list) // 20)
        sampled = coords_list[::step]
        for pt in sampled:
            pt_lon, pt_lat = pt[0], pt[1]
            closest_zone = None
            closest_d = float('inf')
            for z in zones_geojson.get('features', []):
                z_center = z.get('properties', {}).get('center', [19.0760, 72.8777])
                d = haversine(pt_lat, pt_lon, z_center[0], z_center[1])
                if d < closest_d:
                    closest_d = d
                    closest_zone = z.get('properties', {})
            if closest_zone:
                traversed.append(closest_zone.get('name', 'Mumbai Area'))

        unique_zones = list(dict.fromkeys(traversed))[:5]

        # 2. Measurable Police Proximity & Corridor Count
        min_police_dist = float('inf')
        police_in_corridor = 0
        for feat in stations_geojson.get('features', []):
            coords = feat.get('geometry', {}).get('coordinates', [])
            if len(coords) < 2:
                continue
            s_lon, s_lat = coords[0], coords[1]
            d = float('inf')
            if len(coords_list) > 1:
                step_size = max(1, len(coords_list) // 30)
                sampled_pts = coords_list[::step_size]
                for i in range(len(sampled_pts) - 1):
                    p1_lon, p1_lat = sampled_pts[i][0], sampled_pts[i][1]
                    p2_lon, p2_lat = sampled_pts[i+1][0], sampled_pts[i+1][1]
                    seg_d = distance_to_segment(s_lat, s_lon, p1_lat, p1_lon, p2_lat, p2_lon)
                    if seg_d < d:
                        d = seg_d
            else:
                d = haversine(start_lat, start_lng, s_lat, s_lon)
            if d < min_police_dist:
                min_police_dist = d
            if d <= 3.5:
                police_in_corridor += 1

        # 3. Measurable Medical Proximity & Corridor Count
        hospitals_geojson = load_json('mumbai_hospitals.geojson') or {"features": []}
        min_medical_dist = float('inf')
        medical_in_corridor = 0
        for feat in hospitals_geojson.get('features', []):
            coords = feat.get('geometry', {}).get('coordinates', [])
            if len(coords) < 2:
                continue
            h_lon, h_lat = coords[0], coords[1]
            d = float('inf')
            if len(coords_list) > 1:
                step_size = max(1, len(coords_list) // 30)
                sampled_pts = coords_list[::step_size]
                for i in range(len(sampled_pts) - 1):
                    p1_lon, p1_lat = sampled_pts[i][0], sampled_pts[i][1]
                    p2_lon, p2_lat = sampled_pts[i+1][0], sampled_pts[i+1][1]
                    seg_d = distance_to_segment(h_lat, h_lon, p1_lat, p1_lon, p2_lat, p2_lon)
                    if seg_d < d:
                        d = seg_d
            else:
                d = haversine(start_lat, start_lng, h_lat, h_lon)
            if d < min_medical_dist:
                min_medical_dist = d
            if d <= 4.0:
                medical_in_corridor += 1

        # 4. Transparent Deterministic Resource Coverage Calculation (0 to 100)
        if min_police_dist <= 1.0:
            police_prox_pts = 40
        elif min_police_dist <= 2.0:
            police_prox_pts = 30
        elif min_police_dist <= 3.5:
            police_prox_pts = 20
        elif min_police_dist <= 5.0:
            police_prox_pts = 10
        else:
            police_prox_pts = 5

        if police_in_corridor >= 5:
            police_count_pts = 25
        elif police_in_corridor >= 3:
            police_count_pts = 20
        elif police_in_corridor >= 1:
            police_count_pts = 12
        else:
            police_count_pts = 0

        if min_medical_dist <= 1.5:
            med_prox_pts = 20
        elif min_medical_dist <= 3.0:
            med_prox_pts = 15
        elif min_medical_dist <= 4.5:
            med_prox_pts = 10
        else:
            med_prox_pts = 5

        if medical_in_corridor >= 3:
            med_count_pts = 15
        elif medical_in_corridor >= 1:
            med_count_pts = 10
        else:
            med_count_pts = 0

        total_coverage_score = police_prox_pts + police_count_pts + med_prox_pts + med_count_pts
        total_coverage_score = min(100, max(15, total_coverage_score))

        if total_coverage_score >= 80:
            tier_label = "High Emergency Coverage"
        elif total_coverage_score >= 55:
            tier_label = "Moderate Emergency Coverage"
        else:
            tier_label = "Standard Emergency Coverage"

        return {
            "score": total_coverage_score,
            "tier": tier_label,
            "nearby_police_count": police_in_corridor,
            "nearest_police_km": round(min_police_dist, 2) if min_police_dist != float('inf') else None,
            "nearby_medical_count": medical_in_corridor,
            "nearest_medical_km": round(min_medical_dist, 2) if min_medical_dist != float('inf') else None,
            "zones_traversed": unique_zones,
            "explanation": "Measures proximity to mapped emergency infrastructure (police stations and municipal medical facilities). It does not predict personal safety or crime probability."
        }

    routes_found = []
    
    # 1. Primary: Fetch genuine road route from OpenRouteService
    if ORS_API_KEY:
        try:
            profile = "foot-walking" if "walk" in travel_mode else "driving-car"
            url = f"https://api.openrouteservice.org/v2/directions/{profile}/geojson"
            headers = {
                "Authorization": ORS_API_KEY,
                "Content-Type": "application/json"
            }
            body = {
                "coordinates": [[start_lng, start_lat], [end_lng, end_lat]],
                "alternative_routes": {"target_count": 2}
            }
            ors_resp = requests.post(url, headers=headers, json=body, timeout=4)
            if ors_resp.status_code == 200:
                ors_json = ors_resp.json()
                features = ors_json.get('features', [])
                for idx, route_feat in enumerate(features[:2]):
                    r_geom = route_feat.get('geometry', {})
                    r_props = route_feat.get('properties', {})
                    r_segs = r_props.get('segments', [])
                    if r_segs:
                        seg = r_segs[0]
                        d_km = round(seg.get('distance', 0) / 1000.0, 2)
                        d_min = round(seg.get('duration', 0) / 60.0, 1)
                        r_coords = r_geom.get('coordinates', [])
                        res_eval = evaluate_route_resources(r_coords)
                        routes_found.append({
                            "route_id": f"route_{idx+1}",
                            "geometry": r_geom,
                            "distance_km": d_km,
                            "duration_min": d_min,
                            "resource_coverage": res_eval,
                            "resource_score": res_eval["score"],
                            "zones_traversed": res_eval["zones_traversed"],
                            "engine": "OpenRouteService Road Engine"
                        })
        except Exception as e:
            print(f"ORS Directions error: {e}")

    # 2. Resilient Fallback: Fetch genuine road route from OSRM (OpenStreetMap Routing Engine)
    if not routes_found:
        try:
            osrm_mode = "walking" if "walk" in travel_mode else "driving"
            osrm_url = f"https://router.project-osrm.org/route/v1/{osrm_mode}/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson&alternatives=true"
            osrm_resp = requests.get(osrm_url, headers={"User-Agent": "SafeRouteMumbaiApp/1.0"}, timeout=3.5)
            if osrm_resp.status_code == 200:
                osrm_json = osrm_resp.json()
                osrm_routes = osrm_json.get('routes', [])
                for idx, route_item in enumerate(osrm_routes[:2]):
                    r_geom = route_item.get('geometry', {})
                    d_km = round(route_item.get('distance', 0) / 1000.0, 2)
                    d_min = round(route_item.get('duration', 0) / 60.0, 1)
                    r_coords = r_geom.get('coordinates', [])
                    res_eval = evaluate_route_resources(r_coords)
                    routes_found.append({
                        "route_id": f"route_{idx+1}",
                        "geometry": r_geom,
                        "distance_km": d_km,
                        "duration_min": d_min,
                        "resource_coverage": res_eval,
                        "resource_score": res_eval["score"],
                        "zones_traversed": res_eval["zones_traversed"],
                        "engine": "OSRM OpenStreetMap Engine"
                    })
        except Exception as e:
            print(f"OSRM Directions fallback error: {e}")
            
    # If no genuine road routes returned from any routing service
    if not routes_found:
        return jsonify({
            "error": "Routing service is temporarily unavailable. Please try again."
        }), 503

    # Classify genuine routes by resource coverage and travel efficiency
    if len(routes_found) >= 2:
        r1, r2 = routes_found[0], routes_found[1]
        if r1["resource_score"] >= r2["resource_score"]:
            safest_r, direct_r = r1, r2
        else:
            safest_r, direct_r = r2, r1

        safest_r["badge"] = "🛡️ Best Supported Corridor (Recommended)"
        safest_r["type"] = "safest"
        direct_r["badge"] = "⚡ Direct Shortest Route"
        direct_r["type"] = "direct"
    else:
        # Exactly 1 genuine route found
        safest_r = routes_found[0]
        safest_r["badge"] = "🛡️ Verified Road Corridor"
        safest_r["type"] = "safest"
        direct_r = None

    primary_route = safest_r
    route_geometry = primary_route["geometry"]
    distance_km = primary_route["distance_km"]
    duration_min = primary_route["duration_min"]
    route_coords = route_geometry.get('coordinates', [])
    steps = []
    
    # Calculate nearest police stations along the corridor for detailed display
    nearby_stations = []
    features_list = stations_geojson.get('features', [])
    
    for feat in features_list:
        coords = feat.get('geometry', {}).get('coordinates', [])
        if len(coords) < 2:
            continue
        s_lon, s_lat = coords[0], coords[1]
        
        min_dist = float('inf')
        if len(route_coords) > 1:
            step_size = max(1, len(route_coords) // 30)
            sampled = route_coords[::step_size]
            for i in range(len(sampled) - 1):
                p1_lon, p1_lat = sampled[i][0], sampled[i][1]
                p2_lon, p2_lat = sampled[i+1][0], sampled[i+1][1]
                d = distance_to_segment(s_lat, s_lon, p1_lat, p1_lon, p2_lat, p2_lon)
                if d < min_dist:
                    min_dist = d
        else:
            min_dist = min(haversine(start_lat, start_lng, s_lat, s_lon),
                           haversine(end_lat, end_lng, s_lat, s_lon))
                           
        if min_dist <= 3.5:
            p_props = dict(feat.get('properties', {}))
            p_props['distance_km'] = round(min_dist, 2)
            p_props['coordinates'] = [s_lat, s_lon]
            nearby_stations.append(p_props)
            
    nearby_stations = sorted(nearby_stations, key=lambda x: x['distance_km'])[:6]

    # Calculate nearest hospitals and maternity homes along the corridor for detailed display
    hospitals_geojson = load_json('mumbai_hospitals.geojson') or {"features": []}
    nearby_hospitals = []
    for feat in hospitals_geojson.get('features', []):
        coords = feat.get('geometry', {}).get('coordinates', [])
        if len(coords) < 2:
            continue
        h_lon, h_lat = coords[0], coords[1]
        min_dist = float('inf')
        if len(route_coords) > 1:
            step_size = max(1, len(route_coords) // 30)
            sampled = route_coords[::step_size]
            for i in range(len(sampled) - 1):
                p1_lon, p1_lat = sampled[i][0], sampled[i][1]
                p2_lon, p2_lat = sampled[i+1][0], sampled[i+1][1]
                d = distance_to_segment(h_lat, h_lon, p1_lat, p1_lon, p2_lat, p2_lon)
                if d < min_dist:
                    min_dist = d
        else:
            min_dist = min(haversine(start_lat, start_lng, h_lat, h_lon),
                           haversine(end_lat, end_lng, h_lat, h_lon))
        if min_dist <= 4.0:
            h_props = dict(feat.get('properties', {}))
            h_props['distance_km'] = round(min_dist, 2)
            h_props['coordinates'] = [h_lat, h_lon]
            nearby_hospitals.append(h_props)
            
    nearby_hospitals = sorted(nearby_hospitals, key=lambda x: x['distance_km'])[:4]
    
    response = {
        "status": "success",
        "route": {
            "origin": {"lat": start_lat, "lng": start_lng, "name": origin_name or "Origin"},
            "destination": {"lat": end_lat, "lng": end_lng, "name": destination_name or "Destination"},
            "distance_km": distance_km,
            "duration_min": duration_min,
            "geometry": route_geometry,
            "steps": steps,
            "routing_engine": primary_route.get("engine", "OpenStreetMap Road Engine")
        },
        "routes": {
            "safest": safest_r,
            "direct": direct_r
        },
        "resource_coverage": primary_route["resource_coverage"],
        "safety_context": {
            "city_wide_risk_indicator": city_risk,
            "indicator_label": "City-Wide Statistical Activity Indicator",
            "nearby_police_stations_count": len(nearby_stations),
            "nearest_police_station": nearby_stations[0]['name'] if nearby_stations else "Mumbai Central Control Room",
            "nearby_police_stations": nearby_stations,
            "nearby_hospitals_count": len(nearby_hospitals),
            "nearest_hospital": nearby_hospitals[0]['name'] if nearby_hospitals else "K.E.M. Hospital Trauma Centre",
            "nearby_hospitals": nearby_hospitals
        },
        "emergency_contacts": [
            {"name": "National Emergency Helpline", "number": "112", "type": "Police / Fire / Ambulance"},
            {"name": "Mumbai Women Helpline", "number": "103", "type": "Women Safety Cell"},
            {"name": "Mumbai Police Control Room", "number": "100", "type": "Direct Police Line"},
            {"name": "Railway Security & Assistance (RailMadad)", "number": "139", "type": "Suburban Trains & Stations"}
        ],
        "disclaimer": "Safety Resource Coverage indicates proximity to verified emergency infrastructure (police stations and hospitals). Historical crime data cannot predict personal safety."
    }
    
    return jsonify(response)

@app.route('/api/assistant', methods=['POST'])
@rate_limit(max_requests=30, window_secs=60)
def safety_assistant():
    """
    SafeRoute Mumbai Safety Guide - Rule-based assistant.
    SCOPE: Mumbai women's safety, emergency contacts, BNSS legal rights,
    official crime statistics, route/transit guidance, incident reporting.
    OUT OF SCOPE: medical advice, psychological counselling, legal representation,
    predictions about specific individuals or future incidents.
    """
    req_data = request.json or {}
    message = req_data.get('message', '').strip()

    if not message:
        return jsonify({
            "reply": (
                "Namaste. I am the **SafeRoute Mumbai Safety Guide**.\n\n"
                "I can help you with:\n"
                "- **Emergency contacts** (112, 103, 139)\n"
                "- **Your legal rights** (Zero FIR, night arrest protection)\n"
                "- **Mumbai crime statistics** (official 2022-2023 data)\n"
                "- **Safe travel tips** for Mumbai's roads, trains, and metro\n"
                "- **What to do** if you feel unsafe right now\n\n"
                "*Ask me anything in these areas.*"
            )
        })

    m = message.lower().strip()
    crime_stats = load_json('crime_stats.json') or {}
    total_2023 = crime_stats.get('total_cases_2023', '5,913')
    total_2022 = crime_stats.get('total_cases_2022', '6,156')
    trend = crime_stats.get('trend_percentage', -3.95)

    reply = ""

    # INTENT 0: Active danger / being followed / unsafe right now (HIGHEST PRIORITY)
    if any(w in m for w in [
        "followed", "following me", "someone following", "feel unsafe",
        "scared right now", "danger right now", "help me now", "unsafe right now",
        "in danger", "stalking", "stalker", "being watched", "suspicious person",
        "threaten", "threatening me", "i'm scared", "i am scared"
    ]):
        reply = (
            "**If you are in immediate danger, call 112 now.**\n\n"
            "While you wait or move:\n\n"
            "**1. Move toward a public, lit space immediately.**\n"
            "Shops, petrol pumps, railway stations, bank ATMs, and hospitals are good choices. "
            "Do not go somewhere isolated.\n\n"
            "**2. Change your direction unpredictably.**\n"
            "If someone is following on foot, turn around and walk the opposite direction.\n\n"
            "**3. Speak loudly if needed.**\n"
            "Saying: *'I can see you following me. I am calling the police.'* often deters "
            "the person and alerts bystanders.\n\n"
            "**4. Share your live location** with a trusted contact via WhatsApp right now.\n\n"
            "**Emergency numbers:**\n"
            "- **112** - National Emergency (works with zero balance, any network)\n"
            "- **103** - Mumbai Police Women Safety Cell\n"
            "- **100** - Mumbai Police Control Room\n\n"
            "---\n"
            "*This guide provides practical steps. Always call emergency services in a crisis.*"
        )

    # INTENT 1: Legal Rights
    elif any(w in m for w in [
        "right", "rights", "law", "fir", "zero fir", "efir", "e-fir",
        "arrest", "night arrest", "legal aid", "statement", "section",
        "bnss", "crpc", "legal", "pocso", "police refuse", "complaint",
        "file complaint", "register fir", "fir refused", "dlsa", "magistrate"
    ]):
        reply = (
            "**Statutory Rights for Women - BNSS 2023 (India):**\n\n"
            "**1. Zero FIR (Sec. 173(1) BNSS)**\n"
            "Any police station in India must register an FIR for cognizable offences against "
            "women regardless of jurisdiction, then forward it to the correct station. "
            "If a station refuses:\n"
            "- Write to the Superintendent of Police / DCP\n"
            "- File directly before a Judicial Magistrate (Sec. 175 BNSS)\n"
            "- Call **103** (Mumbai Police Women Safety Cell)\n\n"
            "**2. Night Arrest Protection (Sec. 43(5) BNSS)**\n"
            "No woman may be arrested between sunset and sunrise except with prior written "
            "permission from a Judicial Magistrate, carried out by a female officer.\n\n"
            "**3. Examination at Residence (Sec. 179(1) BNSS)**\n"
            "No woman can be compelled to attend a police station for witness examination. "
            "Survivor statements in sexual offence cases must be recorded by a woman officer.\n\n"
            "**4. Free Legal Aid**\n"
            "Every woman is entitled to free legal aid through the District Legal Services "
            "Authority (DLSA). Mumbai DLSA: +91-22-2207-7227. Income is not a barrier.\n\n"
            "**5. POCSO Act 2012**\n"
            "Offences against minors must be reported - reporting is mandatory for anyone "
            "with knowledge of an offence.\n\n"
            "---\n"
            "*General legal information only - not legal advice. Source: BNSS 2023, Legal "
            "Services Authorities Act 1987. For personal matters, contact DLSA Mumbai.*"
        )

    # INTENT 2: Emergency Helplines
    elif any(w in m for w in [
        "helpline", "emergency", "sos", "contact", "phone number", "police number",
        "what number", "which number", "dial", "call", "112", "103", "139",
        "100", "railmadad", "railway helpline", "hospital number", "ambulance",
        "fire", "childline", "1098"
    ]):
        reply = (
            "**Verified Emergency Contacts - Mumbai:**\n\n"
            "| Number | Service |\n"
            "|--------|---------|\n"
            "| **112** | National Emergency - Police, Fire, Ambulance (unified) |\n"
            "| **103** | Mumbai Police Women Safety Cell (dedicated rapid response) |\n"
            "| **100** | Mumbai Police Control Room |\n"
            "| **139** | Indian Railways RailMadad - Security & Medical (24/7) |\n"
            "| **101** | Fire Brigade |\n"
            "| **108** | State Emergency Medical Services |\n"
            "| **1098** | Childline India (children in distress) |\n\n"
            "**Important:** 112 works with zero SIM balance on any network.\n\n"
            "**103** is specifically trained for rapid response to women in distress - "
            "prefer this over the general 100 line for gender-based safety incidents.\n\n"
            "SafeRoute has **118 police stations** and **58 municipal medical facilities** "
            "mapped - view the nearest to your location on the **Map** page."
        )

    # INTENT 3: Train / Metro / Public Transport Safety
    elif any(w in m for w in [
        "train", "local train", "railway", "station", "metro", "metro 3",
        "aqua line", "ladies coach", "ladies compartment", "public transport",
        "bus", "auto", "rickshaw", "cab", "ola", "uber", "rpf", "grp"
    ]):
        reply = (
            "**Mumbai Public Transport - Safety Information:**\n\n"
            "**Suburban Railways (Local Trains):**\n"
            "- Dedicated **Ladies Coaches** are at the engine end, centre, and rear of all 12/15-car trains\n"
            "- After **9:00 PM**, RPF and GRP personnel are assigned onboard and at major stations\n"
            "- The **first class ladies coach** is always available for women\n"
            "- Emergency: **RailMadad 139** - 24/7, security and medical emergencies on trains\n\n"
            "**Metro Rail (Mumbai Metro 3 - Aqua Line):**\n"
            "- Dedicated **ladies coach** in every train (first coach from Cuffe Parade end)\n"
            "- CCTV surveillance across all 27 stations and inside coaches\n"
            "- Security personnel present at all stations\n\n"
            "**Cabs & Auto-Rickshaws:**\n"
            "- Share your live trip details (plate, driver name) with a contact before departing\n"
            "- Prefer app-based cabs over unmarked vehicles at night\n"
            "- SafeRoute **Safe Journey** page shows police station proximity along any road route\n\n"
            "**General Night Travel:**\n"
            "- Stick to Western or Eastern Express Highway corridors for longer journeys\n"
            "- Avoid isolated stretches - use the **Map** to find nearest police stations en route"
        )

    # INTENT 4: Route / Area / Neighbourhood Safety
    elif any(w in m for w in [
        "safe", "safety", "route", "travel", "journey", "night", "late night",
        "andheri", "bandra", "dadar", "kurla", "borivali", "thane", "colaba",
        "bkc", "lower parel", "malad", "goregaon", "vikhroli", "dharavi",
        "from", "going to", "walk", "walking", "dangerous", "danger", "area", "ward"
    ]):
        reply = (
            "**Route & Area Safety - SafeRoute Mumbai:**\n\n"
            "SafeRoute does not assign personal safety ratings to neighbourhoods - crime "
            "statistics vary by incident type and cannot predict individual experience. "
            "Instead, we provide **infrastructure proximity data** for informed decisions.\n\n"
            "**For your specific route, use the Safe Journey page:**\n"
            "Enter your origin and destination to see:\n"
            "- Nearest police stations along the corridor\n"
            "- Municipal hospitals within 1-2 km of your route\n"
            "- Safety Infrastructure Coverage score (0-100) based on emergency resource proximity\n\n"
            "**General Guidelines:**\n"
            "- **Arterial roads** (Western Express Highway, Eastern Express Highway, "
            "Marine Drive, Coastal Road) have continuous police patrol and highway lighting\n"
            "- **After 10 PM**, prefer primary roads over smaller connecting lanes\n"
            "- **Share your live location** with a trusted contact before and during travel\n"
            "- Emergency contacts: **112** (all emergencies), **103** (women's helpline)\n\n"
            "**Check the Safety Map** to explore police and hospital locations across all 24 wards."
        )

    # INTENT 5: Crime Statistics
    elif any(w in m for w in [
        "stats", "statistics", "trend", "data", "crime", "rate", "2023", "2022",
        "dataset", "cases", "how many", "incidents", "recorded", "reported",
        "assault", "rape", "kidnap", "domestic", "outraging", "modesty"
    ]):
        reply = (
            "**Official Mumbai Crime Against Women - 2022 vs 2023:**\n\n"
            "*Source: Mumbai Police Annual Statistical Registry*\n\n"
            f"| Year | Registered | Detected | Detection Rate |\n"
            f"|------|------------|----------|----------------|\n"
            f"| **2022** | {total_2022} | 4,995 | 81.1% |\n"
            f"| **2023** | {total_2023} | 5,570 | **94.2%** |\n\n"
            f"**Year-on-year: {abs(trend)}% decrease in registered cases.**\n\n"
            "**2023 Category Breakdown:**\n"
            "- Outraging Modesty (Sec. 354 IPC): **2,163** cases - 95% detected\n"
            "- Kidnapping & Abduction: **1,167** cases - 94% detected\n"
            "- Rape & POCSO offences: **973** cases - 96% detected\n"
            "- Domestic Harassment (Sec. 498-A): **746** cases - 94% detected\n\n"
            "**Important context:**\n"
            "- Statistics reflect *registered* cases only - under-reporting is documented for gender-based offences\n"
            "- Detection rate improvement (81% to 94%) indicates stronger institutional response\n"
            "- Ward-level crime data is not in the public registry; our ward scores use infrastructure proximity\n\n"
            "*Data sourced from public records. It does not predict individual risk.*"
        )

    # INTENT 6: SafeRoute methodology
    elif any(w in m for w in [
        "score", "how does", "methodology", "formula", "algorithm", "calculate",
        "how is", "how it works", "how saferout", "what is saferoute",
        "infrastructure", "proximity", "coverage", "ward score"
    ]):
        reply = (
            "**How SafeRoute Mumbai Works:**\n\n"
            "**1. No fabricated safety scores**\n"
            "SafeRoute does not claim to predict whether a neighbourhood is 'safe'. "
            "We measure verifiable emergency infrastructure proximity.\n\n"
            "**2. Safety Infrastructure Coverage Score (0-100)**\n"
            "- **Police proximity (40 pts):** Distance to nearest police station per 500m route sample\n"
            "- **Medical proximity (25 pts):** Distance to nearest municipal hospital or maternity home\n"
            "- **Route type (20 pts):** Arterial vs secondary road (highway patrols, lighting)\n"
            "- **Resource density (15 pts):** Number of resources within 2 km radius\n\n"
            "**3. Data sources (all public):**\n"
            "- 118 police stations - Mumbai Police open data\n"
            "- 31 municipal hospitals + 27 maternity homes - BMC records\n"
            "- Ward boundaries - Mumbai Metropolitan Region GIS\n"
            "- Crime figures - Mumbai Police Annual Statistical Registry\n\n"
            "**4. What the app does not do:**\n"
            "- Does not use AI to predict incidents\n"
            "- Does not store or transmit your GPS location beyond your device\n"
            "- Does not guarantee personal safety"
        )

    # INTENT 7: After an incident / reporting
    elif any(w in m for w in [
        "what to do", "what should i do", "after incident", "how to report",
        "want to report", "harassment", "harassed", "molested", "molestation",
        "assaulted", "survivor", "victim", "file case", "ncw", "mahila", "shelter"
    ]):
        reply = (
            "**Reporting an Incident or Seeking Help - Mumbai:**\n\n"
            "**Immediate steps:**\n"
            "1. **Get to a safe location first.** If in immediate danger, call **112** now.\n"
            "2. **Preserve evidence** where possible - do not wash, do not delete messages or photos.\n"
            "3. **Any police station must accept a Zero FIR** (BNSS Sec. 173(1)) - they cannot legally refuse.\n\n"
            "**Filing a complaint:**\n"
            "- Request a woman officer to record your statement - this is your right (Sec. 176/183 BNSS)\n"
            "- Obtain a free copy of your FIR\n"
            "- Contact DLSA Mumbai (+91-22-2207-7227) for free legal aid\n\n"
            "**Support resources in Mumbai:**\n"
            "- **Snehi:** +91-22-2772-6771 (emotional support helpline)\n"
            "- **iCall (TISS):** 9152987821 (counselling referrals, Mon-Sat 8AM-10PM)\n"
            "- **NCW Helpline:** 7827-170-170 (National Commission for Women)\n"
            "- **Maharashtra State Women's Commission:** +91-22-2202-0682\n\n"
            "---\n"
            "*SafeRoute can help locate the nearest police station on the Map page. "
            "BMC hospitals provide free care. iCall and Snehi provide emotional support.*"
        )

    # INTENT 8: Practical safety tips
    elif any(w in m for w in [
        "tip", "tips", "advice", "how to stay safe", "precaution", "precautions",
        "night out", "alone at night", "travelling alone", "self-defence",
        "self defence", "what should i carry", "safety app"
    ]):
        reply = (
            "**Practical Safety Tips - Mumbai:**\n\n"
            "**Before you travel:**\n"
            "- Use SafeRoute's **Safe Journey** page to check police station and hospital proximity\n"
            "- Share your planned route and expected arrival time with a trusted contact\n"
            "- Enable live location sharing on WhatsApp or Google Maps\n\n"
            "**En route:**\n"
            "- Stay on well-lit, busy roads - especially after 10 PM\n"
            "- On local trains, use the **ladies coach** (engine end, centre, rear)\n"
            "- Ride in the front row of autos at night (visible to other road users)\n"
            "- Prefer app-based cabs - share trip details with a contact\n\n"
            "**If something goes wrong:**\n"
            "- **112** works with zero balance on any network\n"
            "- **103** is Mumbai's dedicated women's safety cell\n"
            "- Make noise, move toward light and people, enter any open shop or building\n\n"
            "**Useful apps:**\n"
            "- **112 India App** (Government of India) - emergency SOS with auto location share\n"
            "- **WhatsApp Live Location** - simple and widely used\n\n"
            "---\n"
            "*Self-defence courses are offered by Mumbai Police at local stations.*"
        )

    # INTENT 9: Sensitive / Out-of-scope - graceful decline
    elif any(w in m for w in [
        "suicid", "self-harm", "self harm", "kill myself", "end my life",
        "want to die", "depression", "mental health", "therapy", "therapist",
        "anxiety", "trauma", "ptsd", "diagnosis", "medical advice", "treatment"
    ]):
        reply = (
            "I want to acknowledge that this sounds very difficult, and I am genuinely sorry.\n\n"
            "I am a safety information guide for Mumbai routes and legal rights - I am not "
            "equipped to provide the support you need right now, and I do not want to give "
            "you inadequate help on something this important.\n\n"
            "**Please reach out to someone who can actually help:**\n\n"
            "- **iCall (TISS Mumbai):** 9152987821 - free, confidential counselling (Mon-Sat, 8AM-10PM)\n"
            "- **Snehi:** +91-22-2772-6771 - emotional support helpline\n"
            "- **Vandrevala Foundation:** 1860-2662-345 - 24/7 mental health helpline\n\n"
            "If you are in immediate physical danger, call **112**.\n\n"
            "*You deserve real support from a trained person - not a chatbot.*"
        )

    # INTENT 10: Greetings / what can you do
    elif any(w in m for w in [
        "hello", "hi", "hey", "namaste", "thanks", "thank you",
        "who are you", "what can you do", "help"
    ]):
        reply = (
            "Namaste. I am the **SafeRoute Mumbai Safety Guide**.\n\n"
            "I am a rule-based guide - everything I provide is drawn from verified public data.\n\n"
            "**Ask me about:**\n"
            "- **Immediate danger:** What to do if you feel unsafe right now\n"
            "- **Emergency numbers:** 112, 103, 139 and when to use each\n"
            "- **Legal rights:** Zero FIR, night arrest protection, free legal aid\n"
            "- **Crime data:** Official 2022-2023 Mumbai statistics\n"
            "- **Safe travel:** Train safety, route guidance, night travel tips\n"
            "- **Reporting:** How to file a complaint after an incident\n\n"
            "*Use the quick suggestion buttons below to get started.*"
        )

    # INTENT 11: Fallback
    else:
        reply = (
            "I wasn't able to match your question to my safety database.\n\n"
            "**I can help with these topics:**\n\n"
            "- *'I feel like I'm being followed - what do I do?'*\n"
            "- *'What is my right to file a Zero FIR?'*\n"
            "- *'What are the official 2023 Mumbai crime statistics?'*\n"
            "- *'Is it safe to travel from Bandra to Dadar late at night?'*\n"
            "- *'What emergency numbers should I know?'*\n"
            "- *'How do I report harassment to the police?'*\n"
            "- *'What safety tips are there for Mumbai local trains?'*\n\n"
            "**Out of scope:** I cannot provide medical advice, psychological counselling, "
            "legal representation, or opinions on specific individuals or court cases.\n\n"
            "*If this is an emergency, call **112** now.*"
        )

    return jsonify({
        "reply": reply,
        "city_wide_risk_indicator": crime_stats.get('city_wide_risk_indicator', 50.0)
    })

@app.route('/api/tts/status', methods=['GET'])
def tts_status():
    """
    Returns TTS provider configuration status and cache metrics without exposing API keys.
    """
    api_key_set = bool(os.getenv('ELEVENLABS_API_KEY', ''))
    return jsonify({
        "provider_configured": api_key_set,
        "model_id": os.getenv('ELEVENLABS_MODEL_ID', 'eleven_multilingual_v2'),
        "cached_entries": len(TTS_AUDIO_CACHE)
    })

@app.route('/api/tts/synthesize', methods=['POST'])
@rate_limit(max_requests=60, window_secs=60)
def tts_synthesize():
    """
    Synthesizes realistic Indian voice audio via backend TTS proxy (ElevenLabs or Edge-TTS/gTTS neural fallback).
    Secures API credentials strictly server-side, with in-memory TTL caching.
    """
    req_data = request.json or {}
    text = str(req_data.get('text') or '').strip()
    persona = str(req_data.get('persona') or 'mom').strip().lower()
    voice_id = str(req_data.get('voice_id') or '').strip()
    language = str(req_data.get('language') or 'en-IN').strip()
    engine = str(req_data.get('engine') or '').strip().lower()

    if not text:
        return jsonify({"error": "text is required", "use_client_tts": True}), 400

    if len(text) > 300:
        return jsonify({"error": "text exceeds maximum length of 300 characters", "use_client_tts": True}), 400

    api_key = os.getenv('ELEVENLABS_API_KEY', '')

    cache_key = hashlib.sha256(f"{persona}:{language}:{voice_id}:{engine}:{text}".encode('utf-8')).hexdigest()
    now = time.time()

    # Check cache
    if cache_key in TTS_AUDIO_CACHE:
        audio_bytes, exp = TTS_AUDIO_CACHE[cache_key]
        if exp > now:
            return Response(audio_bytes, mimetype="audio/mpeg")
        else:
            del TTS_AUDIO_CACHE[cache_key]

    # 1. ElevenLabs API if key is present
    if api_key:
        persona_voice_map = {
            'mom': os.getenv('ELEVENLABS_MOM_VOICE_ID', ''),
            'dad': os.getenv('ELEVENLABS_DAD_VOICE_ID', ''),
            'inspector': os.getenv('ELEVENLABS_POLICE_VOICE_ID', ''),
            'support': os.getenv('ELEVENLABS_SUPPORT_VOICE_ID', '')
        }
        target_voice_id = voice_id or persona_voice_map.get(persona) or os.getenv('ELEVENLABS_DEFAULT_VOICE_ID', '')
        if target_voice_id:
            try:
                model_id = os.getenv('ELEVENLABS_MODEL_ID', 'eleven_multilingual_v2')
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{target_voice_id}"
                headers = {
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg"
                }
                payload = {
                    "text": text,
                    "model_id": model_id,
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.85}
                }
                resp = requests.post(url, json=payload, headers=headers, timeout=8)
                if resp.status_code == 200:
                    audio_data = resp.content
                    TTS_AUDIO_CACHE[cache_key] = (audio_data, now + TTS_AUDIO_CACHE_TTL_SECS)
                    return Response(audio_data, mimetype="audio/mpeg")
                else:
                    return jsonify({
                        "status": "fallback",
                        "message": f"TTS provider returned status {resp.status_code}",
                        "use_client_tts": True
                    }), 200
            except Exception as e:
                return jsonify({
                    "status": "fallback",
                    "message": "TTS provider connection timed out or failed",
                    "use_client_tts": True
                }), 200

    # 2. Edge Neural Indian TTS / gTTS if engine is 'neural' or 'edge' or if neural fallback requested
    if engine in ('neural', 'edge', 'auto') and (edge_tts is not None or gTTS is not None):
        is_hindi = 'hi' in language.lower() or any(0x0900 <= ord(c) <= 0x097F for c in text)
        
        # Try Edge-TTS first (crystal-clear neural voices)
        if edge_tts is not None:
            try:
                if is_hindi:
                    voice_name = 'hi-IN-MadhurNeural' if persona in ('dad', 'inspector') else 'hi-IN-SwaraNeural'
                else:
                    voice_name = 'en-IN-PrabhatNeural' if persona in ('dad', 'inspector') else 'en-IN-NeerjaNeural'

                async def _synth():
                    comm = edge_tts.Communicate(text, voice_name)
                    buf = bytearray()
                    async for chunk in comm.stream():
                        if chunk["type"] == "audio":
                            buf.extend(chunk["data"])
                    return bytes(buf)

                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    audio_data = loop.run_until_complete(_synth())
                finally:
                    loop.close()

                if audio_data and len(audio_data) > 100:
                    TTS_AUDIO_CACHE[cache_key] = (audio_data, now + TTS_AUDIO_CACHE_TTL_SECS)
                    return Response(audio_data, mimetype="audio/mpeg")
            except Exception as e:
                print(f"Edge TTS synthesis error: {e}")

        # Try gTTS next
        if gTTS is not None:
            try:
                tts_lang = 'hi' if is_hindi else 'en'
                tts_obj = gTTS(text=text, lang=tts_lang, tld='co.in')
                fp = io.BytesIO()
                tts_obj.write_to_fp(fp)
                fp.seek(0)
                audio_data = fp.read()
                if audio_data and len(audio_data) > 100:
                    TTS_AUDIO_CACHE[cache_key] = (audio_data, now + TTS_AUDIO_CACHE_TTL_SECS)
                    return Response(audio_data, mimetype="audio/mpeg")
            except Exception as e:
                print(f"gTTS synthesis error: {e}")

    # 3. Default fallback response for client-side speech synthesis
    return jsonify({
        "status": "fallback",
        "message": "External TTS key not configured; use client speech synthesis",
        "use_client_tts": True
    }), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.getenv('FLASK_DEBUG', 'false').lower() in ('true', '1', 't')
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )

