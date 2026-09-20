import urllib.request
import json

routes = [
    ('Andheri', 'Bandra', 19.1136, 72.8697, 19.0596, 72.8295),
    ('Bandra', 'Colaba', 19.0596, 72.8295, 18.9067, 72.8147),
    ('Dadar', 'Powai', 19.0178, 72.8478, 19.1176, 72.9060),
    ('Borivali', 'CSMT', 19.2307, 72.8567, 18.9400, 72.8354)
]

for name1, name2, lat1, lon1, lat2, lon2 in routes:
    url = 'http://localhost:5000/api/journey/analyze'
    payload = json.dumps({
        'origin': name1,
        'destination': name2,
        'start': {'lat': lat1, 'lng': lon1},
        'end': {'lat': lat2, 'lng': lon2},
        'mode': 'driving-car'
    }).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        print(f"=== Route: {name1} -> {name2} ===")
        print(f"Distance: {data['route']['distance_km']} km | Duration: {data['route']['duration_min']} mins | Engine: {data['route']['routing_engine']}")
        
        rc = data.get('resource_coverage', {})
        print(f"Safety Resource Coverage: {rc.get('score')}/100 ({rc.get('tier')})")
        print(f"  - Corridor Police Stations: {rc.get('nearby_police_count')} (Nearest: {rc.get('nearest_police_km')} km)")
        print(f"  - Corridor 24/7 Hospitals: {rc.get('nearby_medical_count')} (Nearest: {rc.get('nearest_medical_km')} km)")
        print(f"  - Nearest Station Name: {data.get('safety_context', {}).get('nearest_police_station')}")
        print(f"  - Nearest Hospital Name: {data.get('safety_context', {}).get('nearest_hospital')}")
        print(f"  - Explanation: {rc.get('explanation')}")
        
        routes_obj = data.get('routes', {})
        if routes_obj.get('safest'):
            s = routes_obj['safest']
            print(f"  [Safest Alternative]: {s.get('classification')} | Score: {s.get('resource_score')}/100")
        if routes_obj.get('direct'):
            d = routes_obj['direct']
            print(f"  [Direct Alternative]: {d.get('classification')} | Score: {d.get('resource_score')}/100")
        print()
    except Exception as e:
        print(f"Error for {name1} -> {name2}:", e)
