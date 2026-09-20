import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HOSP_GEOJSON = os.path.join(BASE_DIR, "backend", "data", "mumbai_hospitals.geojson")
MAT_GEOJSON = os.path.join(BASE_DIR, "backend", "data", "mumbai_maternity_homes.geojson")
FRONTEND_JSON = os.path.join(BASE_DIR, "frontend", "src", "data", "mumbaiMedicalFacilities.json")

with open(HOSP_GEOJSON, 'r', encoding='utf-8') as f:
    hosp_data = json.load(f)

with open(MAT_GEOJSON, 'r', encoding='utf-8') as f:
    mat_data = json.load(f)

with open(FRONTEND_JSON, 'r', encoding='utf-8') as f:
    front_data = json.load(f)

hosp_count = len(hosp_data.get('features', []))
mat_count = len(mat_data.get('features', []))
front_count = len(front_data)

print(f"Hospitals GeoJSON count: {hosp_count} (Expected: 31)")
print(f"Maternity Homes GeoJSON count: {mat_count} (Expected: 27)")
print(f"Frontend JSON count: {front_count} (Expected: 58)")

assert hosp_count == 31, f"Expected 31 hospitals, got {hosp_count}"
assert mat_count == 27, f"Expected 27 maternity homes, got {mat_count}"
assert front_count == 58, f"Expected 58 facilities, got {front_count}"

# Sample 10 random facilities
print("\n--- Inspecting 10 Sample Facilities ---")
samples = [
    hosp_data['features'][0],
    hosp_data['features'][5],
    hosp_data['features'][10],
    hosp_data['features'][15],
    hosp_data['features'][20],
    hosp_data['features'][30],
    mat_data['features'][0],
    mat_data['features'][5],
    mat_data['features'][15],
    mat_data['features'][26],
]

for idx, s in enumerate(samples):
    p = s['properties']
    geom = s['geometry']
    print(f"\nFacility #{idx+1}: {p['name']}")
    print(f"  Type: {p['type']}")
    print(f"  Ward: {p['ward']}")
    print(f"  Address: {p['address']}")
    print(f"  Owner Dept: {p['owner_dept']}")
    print(f"  Coordinates (lon, lat): {geom['coordinates']}")
    print(f"  Operating Hours: {p.get('operating_hours')}")
    assert 'open24x7' not in p, "Fabricated open24x7 should not exist in properties"
    assert 'services' not in p, "Fabricated services list should not exist in properties"
    assert p.get('operating_hours') == 'Operating hours not verified'

print("\nAll assertions passed successfully!")
