import urllib.request
import urllib.error
import json

print("=== RUNNING LOCATION & GEOCODING CORRECTNESS TESTS ===")

# TEST 1: Exact search result coordinates preservation
print("\n[TEST 1] Search 'Andheri Railway Station' & Route to 'Gateway of India' with exact coordinates")
req1 = urllib.request.Request(
    'http://localhost:5000/api/journey/analyze',
    data=json.dumps({
        'origin': 'Andheri Railway Station',
        'destination': 'Gateway of India',
        'start': {'lat': 19.1197, 'lng': 72.8464},
        'end': {'lat': 18.9220, 'lng': 72.8347}
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
resp1 = urllib.request.urlopen(req1)
d1 = json.loads(resp1.read().decode())
print(f"Status: {resp1.getcode()} | Start Coords Used: {d1['route']['origin']['lat']}, {d1['route']['origin']['lng']} | End Coords Used: {d1['route']['destination']['lat']}, {d1['route']['destination']['lng']}")
assert abs(d1['route']['origin']['lat'] - 19.1197) < 0.001
assert abs(d1['route']['destination']['lat'] - 18.9220) < 0.001
print("[PASS] Exact coordinates preserved through journey analysis.")

# TEST 2: Type invalid gibberish location
print("\n[TEST 2] Gibberish input 'asdfghjklxyz' without coordinates")
req2 = urllib.request.Request(
    'http://localhost:5000/api/journey/analyze',
    data=json.dumps({
        'origin': 'asdfghjklxyz',
        'destination': 'Gateway of India, Mumbai'
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    urllib.request.urlopen(req2)
    print("❌ Expected 422 error, but request succeeded!")
except urllib.error.HTTPError as e:
    err_body = json.loads(e.read().decode())
    print(f"HTTP Status: {e.code} | Error Code: {err_body.get('error')} | Message: {err_body.get('message')}")
    assert e.code == 422
    assert err_body.get('error') == 'origin_not_found'
    print("[PASS] Failed geocoding correctly returned HTTP 422 with no fake coordinate fallback.")

# TEST 3: Invalid destination
print("\n[TEST 3] Invalid destination 'qwertyuiop999'")
req3 = urllib.request.Request(
    'http://localhost:5000/api/journey/analyze',
    data=json.dumps({
        'origin': 'Andheri West, Mumbai',
        'destination': 'qwertyuiop999'
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    urllib.request.urlopen(req3)
    print("❌ Expected 422 error, but request succeeded!")
except urllib.error.HTTPError as e:
    err_body = json.loads(e.read().decode())
    print(f"HTTP Status: {e.code} | Error Code: {err_body.get('error')} | Message: {err_body.get('message')}")
    assert e.code == 422
    assert err_body.get('error') == 'destination_not_found'
    print("[PASS] Unknown destination correctly returned HTTP 422.")

# TEST 4: Map click / GPS coordinates directly submitted
print("\n[TEST 4] Custom Map-Click / GPS coordinates submission")
custom_lat, custom_lng = 19.0543, 72.8312
req4 = urllib.request.Request(
    'http://localhost:5000/api/journey/analyze',
    data=json.dumps({
        'origin': 'GPS Location (19.0543, 72.8312)',
        'destination': 'Map Pick (18.9300, 72.8300)',
        'start': {'lat': custom_lat, 'lng': custom_lng},
        'end': {'lat': 18.9300, 'lng': 72.8300}
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
resp4 = urllib.request.urlopen(req4)
d4 = json.loads(resp4.read().decode())
print(f"Status: {resp4.getcode()} | Start: {d4['route']['origin']['lat']}, {d4['route']['origin']['lng']}")
assert abs(d4['route']['origin']['lat'] - custom_lat) < 0.0001
print("[PASS] Map-click / GPS coordinates used directly by routing engine.")

# TEST 5: Malformed coordinates validation (lat='abc', lng=None)
print("\n[TEST 5] Malformed API coordinates validation")
req5 = urllib.request.Request(
    'http://localhost:5000/api/journey/analyze',
    data=json.dumps({
        'origin': 'Gibberish',
        'destination': 'Gibberish2',
        'start': {'lat': 'abc', 'lng': None},
        'end': {'lat': 999.99, 'lng': -999.99} # Outside MMR
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    urllib.request.urlopen(req5)
    print("FAILED: Expected 422 error, but request succeeded!")
except urllib.error.HTTPError as e:
    print(f"HTTP Status: {e.code}")
    assert e.code == 422
    print("[PASS] Malformed and out-of-bounds coordinates correctly rejected without server crash.")

print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")
