import pandas as pd
import json
import xmltodict
import os
import hashlib
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent.parent
CSV_PATH = BASE_DIR / "a502dd53-cecd-4def-a951-48eb0e4c5100.csv"
KML_PATH = BASE_DIR / "fbe6a2e1-64ee-459b-ab45-be1de84f603b.kml"
OUTPUT_DIR = BASE_DIR / "backend" / "data"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def get_risk_color(score):
    if score <= 20:
        return "#22C55E", "Low Recorded Risk"
    elif score <= 40:
        return "#84CC16", "Moderate-Low Recorded Risk"
    elif score <= 60:
        return "#FACC15", "Moderate Recorded Risk"
    elif score <= 80:
        return "#F97316", "Elevated Recorded Risk"
    else:
        return "#EF4444", "Higher Recorded Risk"

def process_crime_data():
    print("Processing Crime Data...")
    df = pd.read_csv(CSV_PATH)
    
    # Clean the dataframe
    df = df.iloc[:, [0, 2, 3, 4, 5, 6, 7]]
    df.columns = ["Category", "Registered_2023", "Detected_2023", "Detection_Rate_2023", 
                  "Registered_2022", "Detected_2022", "Detection_Rate_2022"]
    
    df = df.dropna(how='all')
    df["Category"] = df["Category"].fillna("Unknown")
    for col in df.columns[1:]:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
        
    total_2022 = df[df["Category"].str.contains("Total of Crime", na=False)]["Registered_2022"].sum()
    total_2023 = df[df["Category"].str.contains("Total of Crime", na=False)]["Registered_2023"].sum()
    
    if total_2022 == 0 and total_2023 == 0:
        total_2022 = df["Registered_2022"].sum()
        total_2023 = df["Registered_2023"].sum()
        
    trend = 0
    if total_2022 > 0:
        trend = ((total_2023 - total_2022) / total_2022) * 100
        
    stats = {
        "total_cases_2022": int(total_2022),
        "total_cases_2023": int(total_2023),
        "trend_percentage": round(trend, 2),
        "total_detected_2022": int(df[df["Category"].str.contains("Total of Crime", na=False)]["Detected_2022"].sum()),
        "total_detected_2023": int(df[df["Category"].str.contains("Total of Crime", na=False)]["Detected_2023"].sum()),
        "detection_rate_2022": int(df[df["Category"].str.contains("Total of Crime", na=False)]["Detection_Rate_2022"].sum()),
        "detection_rate_2023": int(df[df["Category"].str.contains("Total of Crime", na=False)]["Detection_Rate_2023"].sum()),
        "categories": df.to_dict(orient="records")
    }
    
    with open(OUTPUT_DIR / "crime_stats.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=4)
        
    print("Crime data processed successfully.")
    
def process_kml_data():
    print("Processing KML Data...")
    
    with open(KML_PATH, 'r', encoding='utf-8') as f:
        doc = xmltodict.parse(f.read())
        
    features = []
    
    try:
        placemarks = doc['kml']['Document']['Folder']['Placemark']
    except KeyError:
        try:
            placemarks = doc['kml']['Document']['Placemark']
        except KeyError:
            print("Could not find placemarks in KML structure.")
            return

    if not isinstance(placemarks, list):
        placemarks = [placemarks]
        
    for idx, p in enumerate(placemarks):
        name = p.get('name', f'Police Station {idx+1}')
        
        props = {}
        if 'ExtendedData' in p and 'SchemaData' in p['ExtendedData']:
            schema_data = p['ExtendedData']['SchemaData']
            if 'SimpleData' in schema_data:
                simple_data = schema_data['SimpleData']
                if not isinstance(simple_data, list):
                    simple_data = [simple_data]
                for sd in simple_data:
                    key = sd.get('@name')
                    val = sd.get('#text')
                    if key and val:
                        props[key] = val
                        
        if 'Point' in p and 'coordinates' in p['Point']:
            coords = p['Point']['coordinates'].split(',')
            try:
                lon = float(coords[0])
                lat = float(coords[1])
                
                ward = props.get('WARD', 'General').strip()
                
                feature = {
                    "type": "Feature",
                    "properties": {
                        "name": props.get('NAME', name),
                        "ward": ward,
                        "location": props.get('LOCATION', 'Mumbai, Maharashtra')
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    }
                }
                features.append(feature)
            except ValueError:
                pass
                
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open(OUTPUT_DIR / "police_stations.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=4)
        
    print(f"Processed {len(features)} police stations as verified emergency infrastructure.")

if __name__ == "__main__":
    process_crime_data()
    process_kml_data()

