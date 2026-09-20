import os
import json
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HOSPITALS_KML = os.path.join(BASE_DIR, "23d3867f-3604-4b8b-b3b0-7c9770777f18.kml")
MATERNITY_KML = os.path.join(BASE_DIR, "3866f702-d906-412c-91fe-25c03c7dcd4b.kml")
OUTPUT_DIR = os.path.join(BASE_DIR, "backend", "data")
FRONTEND_DATA_DIR = os.path.join(BASE_DIR, "frontend", "src", "data")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)

def parse_kml_features(kml_path, feature_type_default='Hospital'):
    if not os.path.exists(kml_path):
        print(f"File not found: {kml_path}")
        return []

    tree = ET.parse(kml_path)
    root = tree.getroot()
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}

    features = []
    
    # Handle with and without namespace
    placemarks = root.findall('.//kml:Placemark', ns)
    if not placemarks:
        placemarks = root.findall('.//Placemark')

    for idx, pm in enumerate(placemarks):
        name_el = pm.find('kml:name', ns) if pm.find('kml:name', ns) is not None else pm.find('name')
        name = name_el.text.strip() if name_el is not None and name_el.text else f"{feature_type_default} #{idx+1}"

        # Coordinates
        coord_el = pm.find('.//kml:coordinates', ns) if pm.find('.//kml:coordinates', ns) is not None else pm.find('.//coordinates')
        if coord_el is None or not coord_el.text:
            continue

        raw_coords = coord_el.text.strip().split(',')
        if len(raw_coords) < 2:
            continue

        try:
            lon = float(raw_coords[0])
            lat = float(raw_coords[1])
        except ValueError:
            continue

        # Extract ExtendedData SimpleData fields
        props = {
            'id': f"{feature_type_default.lower()[:4]}-{idx+1}",
            'name': name,
            'feature_type': feature_type_default
        }

        simple_datas = pm.findall('.//kml:SimpleData', ns) if pm.findall('.//kml:SimpleData', ns) else pm.findall('.//SimpleData')
        for sd in simple_datas:
            attr_name = sd.attrib.get('name', '')
            val = sd.text.strip() if sd.text else ''
            props[attr_name.lower()] = val

        # Clean address, ward, type, owner department strictly from source KML
        address = props.get('address') or props.get('name_of_ho') or props.get('name_of_mat_home') or ''
        ward = props.get('ward', 'Mumbai')
        hosp_type = props.get('type') or feature_type_default
        owner_dept = props.get('owner_dept', 'Public Health Dept')
        twitter = props.get('twitter_handle', '')

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "id": props['id'],
                "name": name,
                "address": address,
                "ward": ward,
                "type": hosp_type,
                "owner_dept": owner_dept,
                "operating_hours": "Operating hours not verified",
                "twitter_handle": twitter
            }
        }
        features.append(feature)

    return features

def main():
    print("Processing Mumbai Hospitals KML...")
    hospitals_features = parse_kml_features(HOSPITALS_KML, "Hospital")
    hospitals_geojson = {
        "type": "FeatureCollection",
        "features": hospitals_features
    }
    hosp_out_path = os.path.join(OUTPUT_DIR, "mumbai_hospitals.geojson")
    with open(hosp_out_path, "w", encoding="utf-8") as f:
        json.dump(hospitals_geojson, f, indent=2)
    print(f"Saved {len(hospitals_features)} hospitals to {hosp_out_path}")

    print("Processing Mumbai Maternity Homes KML...")
    maternity_features = parse_kml_features(MATERNITY_KML, "Maternity Home")
    maternity_geojson = {
        "type": "FeatureCollection",
        "features": maternity_features
    }
    mat_out_path = os.path.join(OUTPUT_DIR, "mumbai_maternity_homes.geojson")
    with open(mat_out_path, "w", encoding="utf-8") as f:
        json.dump(maternity_geojson, f, indent=2)
    print(f"Saved {len(maternity_features)} maternity homes to {mat_out_path}")

    # Generate unified frontend dataset with source-backed fields only
    all_medical_facilities = []
    for f in hospitals_features:
        p = f['properties']
        coords = f['geometry']['coordinates'] # [lon, lat]
        all_medical_facilities.append({
            'id': p['id'],
            'name': p['name'],
            'type': 'hospital',
            'category': f"BMC {p['type']}" if p.get('type') else "BMC Hospital",
            'area': f"Ward {p['ward']}" if p.get('ward') else "Mumbai",
            'address': p['address'] or f"Ward {p.get('ward', 'Mumbai')}, Mumbai",
            'coordinates': [coords[1], coords[0]], # [lat, lon] for Leaflet
            'ward': p['ward'],
            'owner_dept': p['owner_dept'],
            'operating_hours': "Operating hours not verified"
        })

    for f in maternity_features:
        p = f['properties']
        coords = f['geometry']['coordinates']
        all_medical_facilities.append({
            'id': p['id'],
            'name': p['name'],
            'type': 'maternity_home',
            'category': 'BMC Municipal Maternity Home',
            'area': f"Ward {p['ward']}" if p.get('ward') else "Mumbai",
            'address': p['address'] or f"Ward {p.get('ward', 'Mumbai')}, Mumbai",
            'coordinates': [coords[1], coords[0]],
            'ward': p['ward'],
            'owner_dept': p['owner_dept'],
            'operating_hours': "Operating hours not verified"
        })

    frontend_json_path = os.path.join(FRONTEND_DATA_DIR, "mumbaiMedicalFacilities.json")
    with open(frontend_json_path, "w", encoding="utf-8") as f:
        json.dump(all_medical_facilities, f, indent=2)
    print(f"Generated unified frontend medical dataset with {len(all_medical_facilities)} facilities at {frontend_json_path}")

if __name__ == "__main__":
    main()
