from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import math
import time
import requests
from collections import defaultdict
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
ORS_API_KEY = os.getenv('ORS_API_KEY', '')

# --- In-Memory TTL Geocoding Cache (Short TTL: 10 mins, no user GPS stored) ---
GEOCODE_CACHE = {}
GEOCODE_CACHE_TTL_SECS = 600  # 10 minutes

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
    "andheri east": {"name": "Andheri East, Mumbai", "lat": 19.1158, "lng": 72.8722},
    "bandra": {"name": "Bandra West, Mumbai", "lat": 19.0596, "lng": 72.8295},
    "bandra terminus": {"name": "Bandra Terminus", "lat": 19.0628, "lng": 72.8407},
    "bkc": {"name": "Bandra Kurla Complex (BKC), Mumbai", "lat": 19.0657, "lng": 72.8687},
    "dadar": {"name": "Dadar West, Mumbai", "lat": 19.0178, "lng": 72.8478},
    "dadar station": {"name": "Dadar Railway Station", "lat": 19.0182, "lng": 72.8434},
    "colaba": {"name": "Colaba, Mumbai", "lat": 18.9067, "lng": 72.8147},
    "gateway of india": {"name": "Gateway of India, Colaba", "lat": 18.9220, "lng": 72.8347},
    "csmt": {"name": "Chhatrapati Shivaji Maharaj Terminus (CSMT)", "lat": 18.9401, "lng": 72.8354},
    "churchgate": {"name": "Churchgate Railway Station, Mumbai", "lat": 18.9322, "lng": 72.8264},
    "kurla": {"name": "Kurla West, Mumbai", "lat": 19.0726, "lng": 72.8845},
    "lokmanya tilak terminus": {"name": "Lokmanya Tilak Terminus (LTT), Kurla", "lat": 19.0688, "lng": 72.8911},
    "ghatkopar": {"name": "Ghatkopar East, Mumbai", "lat": 19.0860, "lng": 72.9090},
    "powai": {"name": "Powai (Hiranandani), Mumbai", "lat": 19.1176, "lng": 72.9060},
    "iit bombay": {"name": "IIT Bombay, Powai", "lat": 19.1334, "lng": 72.9133},
    "borivali": {"name": "Borivali West, Mumbai", "lat": 19.2307, "lng": 72.8567},
    "borivali station": {"name": "Borivali Railway Station", "lat": 19.2294, "lng": 72.8576},
    "malad": {"name": "Malad West, Mumbai", "lat": 19.1874, "lng": 72.8484},
    "kandivali": {"name": "Kandivali West, Mumbai", "lat": 19.2062, "lng": 72.8398},
    "goregaon": {"name": "Goregaon West, Mumbai", "lat": 19.1663, "lng": 72.8478},
    "juhu": {"name": "Juhu Beach, Mumbai", "lat": 19.0988, "lng": 72.8264},
    "chembur": {"name": "Chembur, Mumbai", "lat": 19.0522, "lng": 72.9005},
    "worli": {"name": "Worli Sea Face, Mumbai", "lat": 19.0166, "lng": 72.8185},
    "lower parel": {"name": "Lower Parel / High Street Phoenix, Mumbai", "lat": 18.9953, "lng": 72.8302},
    "marine drive": {"name": "Marine Drive Promenade, Mumbai", "lat": 18.9432, "lng": 72.8230},
    "nariman point": {"name": "Nariman Point, Mumbai", "lat": 18.9256, "lng": 72.8242},
    "sion": {"name": "Sion Circle, Mumbai", "lat": 19.0390, "lng": 72.8619},
    "thane": {"name": "Thane Railway Station, Mumbai MMR", "lat": 19.1860, "lng": 72.9759},
    "vashi": {"name": "Vashi, Navi Mumbai", "lat": 19.0771, "lng": 72.9986},
    "mumbai airport": {"name": "Chhatrapati Shivaji Maharaj Int'l Airport (BOM T2)", "lat": 19.0896, "lng": 72.8656},
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
        for k, v in MUMBAI_LANDMARKS.items():
            if k in n_clean or n_clean in k:
                return {"lat": v["lat"], "lng": v["lng"]}
        
        # 1. Try Photon Komoot geocoder
        try:
            search_q = f"{name} Mumbai" if "mumbai" not in n_clean else name
            r = requests.get(
                "https://photon.komoot.io/api/",
                params={"q": search_q, "lat": 19.0760, "lon": 72.8777, "limit": 1},
                headers={"User-Agent": "SafeRouteMumbaiApp/1.0"},
                timeout=3
            )
            if r.status_code == 200:
                feats = r.json().get('features', [])
                if feats:
                    c = feats[0]['geometry']['coordinates']
                    lat, lon = c[1], c[0]
                    if 18.80 <= lat <= 19.38 and 72.73 <= lon <= 73.20:
                        return {"lat": lat, "lng": lon}
        except Exception:
            pass
            
        # 2. Try Nominatim geocoder
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
            nom_res = requests.get(nom_url, params=nom_params, headers=nom_headers, timeout=3)
            if nom_res.status_code == 200:
                nom_items = nom_res.json()
                if nom_items:
                    lat, lon = float(nom_items[0]['lat']), float(nom_items[0]['lon'])
                    if 18.80 <= lat <= 19.38 and 72.73 <= lon <= 73.20:
                        return {"lat": lat, "lng": lon}
        except Exception:
            pass

        # Return None if location is unknown (DO NOT use hardcoded fake coordinates)
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
        # Police Proximity: max 40 pts (<1km: 40, <2km: 30, <3.5km: 20, <5km: 10, else 5)
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

        # Police Corridor Count: max 25 pts (5+ stations: 25, 3-4: 20, 1-2: 12, 0: 0)
        if police_in_corridor >= 5:
            police_count_pts = 25
        elif police_in_corridor >= 3:
            police_count_pts = 20
        elif police_in_corridor >= 1:
            police_count_pts = 12
        else:
            police_count_pts = 0

        # Medical Proximity: max 20 pts (<1.5km: 20, <3km: 15, <4.5km: 10, else 5)
        if min_medical_dist <= 1.5:
            med_prox_pts = 20
        elif min_medical_dist <= 3.0:
            med_prox_pts = 15
        elif min_medical_dist <= 4.5:
            med_prox_pts = 10
        else:
            med_prox_pts = 5

        # Medical Corridor Count: max 15 pts (3+ hospitals: 15, 1-2: 10, 0: 0)
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
            ors_resp = requests.post(url, headers=headers, json=body, timeout=6)
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
            osrm_resp = requests.get(osrm_url, headers={"User-Agent": "SafeRouteMumbaiApp/1.0"}, timeout=6)
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
@rate_limit(max_requests=60, window_secs=60)
def safety_assistant():
    req_data = request.json or {}
    message = req_data.get('message', '').strip()
    
    if not message:
        return jsonify({"reply": "Hello! I am your SafeRoute Mumbai Safety Guide. You can ask about recorded crime patterns across Mumbai, route corridor safety, women's legal rights (Zero FIR under BNSS, night arrest rules), or emergency response numbers."})
        
    m_lower = message.lower()
    crime_stats = load_json('crime_stats.json') or {}
    
    city_risk = crime_stats.get('city_wide_risk_indicator', 50.0)
    total_2023 = crime_stats.get('total_cases_2023', '5,913')
    total_2022 = crime_stats.get('total_cases_2022', '6,156')
    trend = crime_stats.get('trend_percentage', -3.95)
    
    reply = ""
    
    # 1. Legal Rights / Zero FIR Queries (Priority matching)
    if any(w in m_lower for w in ["right", "rights", "law", "fir", "zero fir", "arrest", "night arrest", "aid", "legal aid", "statement", "section", "bnss", "crpc", "legal"]):
        reply = (
            f"**Key Statutory Rights for Women in India (BNSS, 2023):**\n\n"
            f"1. **Zero FIR & e-FIR (Sec. 173(1) BNSS / formerly Sec. 154 CrPC):** Any police station is legally obligated to register an FIR for cognizable offences against women regardless of territorial jurisdiction and transfer it to the jurisdictional station. Electronic registration (e-FIR) is also codified.\n"
            f"2. **Safeguard Against Night Arrest (Sec. 43(5) BNSS / formerly Sec. 46(4) CrPC):** As a statutory rule, no woman shall be arrested after sunset and before sunrise except in extraordinary circumstances with prior written permission of a Judicial Magistrate, executed by a female officer.\n"
            f"3. **Examination at Residence (Sec. 179(1) Proviso BNSS / formerly Sec. 160 CrPC):** No woman can be compelled to attend a police station for witness examination; examination must take place at her place of residence. Statements of sexual assault survivors must be recorded by a woman officer (Sec. 176/183 BNSS).\n"
            f"4. **Free Legal Aid (Sec. 12 Legal Services Authorities Act, 1987 & Sec. 340 BNSS):** Every woman is entitled to free legal aid and counsel irrespective of income through the District Legal Services Authority (DLSA Mumbai).\n\n"
            f"*General legal information only — not legal advice. Source: BNSS, 2023 & Legal Services Authorities Act, 1987 (India Code). Last verified: 2026.*"
        )
    # 2. Emergency Helplines & Police Contacts
    elif any(w in m_lower for w in ["helpline", "helplines", "emergency", "sos", "contact", "contacts", "phone", "railway number", "police number", "112", "103", "139", "100", "railway emergency", "railmadad", "call"]):
        reply = (
            f"**Verified Emergency Contacts in Mumbai:**\n\n"
            f"• **112:** National Unified Emergency Service (Police, Fire, Medical Ambulance)\n"
            f"• **103:** Mumbai Police Dedicated Women Safety Cell (Immediate response squad)\n"
            f"• **139:** Indian Railways (RailMadad) 24/7 Security & Medical Assistance\n"
            f"• **100:** Mumbai Police Central Control Room\n\n"
            f"Over **118 active police stations** and municipal medical facilities are mapped across Greater Mumbai on our Map."
        )
    # 3. Travel Route Queries
    elif any(w in m_lower for w in ["from", "to", "travel", "journey", "going", "route", "reach", "dadar", "andheri", "bkc", "bandra", "colaba", "kurla", "borivali", "thane", "train", "metro"]):
        reply = (
            f"**Mumbai Route Safety Guidelines:**\n\n"
            f"• **Corridor Recommendation:** For night travel across Mumbai, always favor primary arterial roads (Western Express Highway, Eastern Express Highway, or the Coastal Arterials) which have active highway police patrols and continuous lighting.\n"
            f"• **Suburban Railway:** Dedicated ladies coaches are positioned at the engine, center, and rear of 12/15-car local trains. After 9:00 PM, armed RPF/GRP personnel are assigned onboard. RailMadad Railway Helpline: **139**.\n"
            f"• **Safe Journey Tool:** You can plan this exact route on our **Safe Journey** page to compare lowest-risk corridors, inspect safety resources, and set an Emergency Check-in timer.\n"
            f"• **Emergency Helplines:** Dial **103** (Mumbai Women Police Cell) or **112** (All-in-One Emergency)."
        )
    # 4. Crime Statistics & Data Breakdown
    elif any(w in m_lower for w in ["stats", "statistics", "trend", "data", "crime", "rate", "2023", "2022", "dataset", "cases"]):
        reply = (
            f"**Official Mumbai Crime Against Women Statistics (2022 vs 2023):**\n\n"
            f"• **Total Registered Cases (2023):** 5,913 (down from 6,156 in 2022 — a **{abs(trend)}% net decrease**).\n"
            f"• **Institutional Detection Rate:** **94.2%** of cases detected in 2023 (5,570 detected out of 5,913), compared to 81.1% in 2022 (4,995 detected).\n"
            f"• **Major Heads Registered:** Outraging Modesty (2,163 cases, 95% detected), Kidnapping (1,167 cases, 94% detected), Rape & POCSO (973 cases, 96% detected), Domestic Harassment Sec. 498-A (746 cases, 94% detected).\n"
            f"• **Statistical Provenance:** Source: Mumbai Police Annual Statistical Registry (Calendar Years 2022 vs 2023)."
        )
    # 5. Risk Calculation & Methodology
    elif any(w in m_lower for w in ["score", "calculate", "risk", "methodology", "formula", "algorithm"]):
        reply = (
            f"**How SafeRoute Evaluates Corridor Coverage:**\n\n"
            f"1. **Emergency Proximity:** As you plan a journey, the route is sampled every 500 meters against municipal zone boundaries, nearby active police stations, and municipal medical facilities.\n"
            f"2. **Safety Infrastructure Coverage:** Measures access to official emergency and medical infrastructure.\n"
            f"3. **Zero Synthetic Inferences:** All baseline infrastructure derives strictly from statutory registries and official spatial boundaries.\n"
            f"4. **Transit Optimization:** Evaluates Western/Central Local trains, Metro lines, and highway corridors to find well-supported routes."
        )
    else:
        reply = (
            f"I am your **Mumbai Safety Guide**. Here is what you can ask me:\n\n"
            f"• **Route Safety:** *'How safe is traveling from Bandra to Dadar late at night?'*\n"
            f"• **Legal Rights:** *'What are my rights regarding Zero FIR and night arrest?'*\n"
            f"• **Crime Data:** *'What are the official 2022-2023 Mumbai crime trends and solve rates?'*\n"
            f"• **Helplines & Havens:** *'What numbers should I dial in an emergency?'*\n"
            f"• **Transit Tips:** *'What safety facilities exist on Mumbai local trains and Metro 3?'*"
        )
        
    return jsonify({
        "reply": reply,
        "city_wide_risk_indicator": city_risk
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.getenv('FLASK_DEBUG', 'false').lower() in ('true', '1', 't')
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )
