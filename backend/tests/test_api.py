import pytest
import os
import sys
import json
from unittest.mock import patch, MagicMock

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, RATE_LIMIT_STORE, GEOCODE_CACHE, TTS_AUDIO_CACHE

@pytest.fixture
def client():
    app.config['TESTING'] = True
    # Clear rate limit and cache stores between tests
    RATE_LIMIT_STORE.clear()
    GEOCODE_CACHE.clear()
    TTS_AUDIO_CACHE.clear()
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'
    assert 'ors_enabled' in data

def test_crimes_summary_endpoint(client):
    res = client.get('/api/crimes/summary')
    assert res.status_code == 200
    data = res.get_json()
    assert data['total_cases_2023'] == 5913
    assert data['total_cases_2022'] == 6156
    assert data['total_detected_2023'] == 5570
    assert data['total_detected_2022'] == 4995
    assert len(data['categories']) > 10

def test_police_stations_endpoint(client):
    res = client.get('/api/police-stations')
    assert res.status_code == 200
    data = res.get_json()
    assert data.get('type') == 'FeatureCollection'
    assert len(data.get('features', [])) >= 100

def test_hospitals_endpoint(client):
    res = client.get('/api/hospitals')
    assert res.status_code == 200
    data = res.get_json()
    assert data.get('type') == 'FeatureCollection'
    assert len(data.get('features', [])) >= 1

def test_maternity_homes_endpoint(client):
    res = client.get('/api/maternity-homes')
    assert res.status_code == 200
    data = res.get_json()
    assert data.get('type') == 'FeatureCollection'
    assert len(data.get('features', [])) >= 1

def test_zones_endpoint(client):
    res = client.get('/api/zones')
    assert res.status_code == 200
    data = res.get_json()
    assert data.get('type') == 'FeatureCollection'
    assert len(data.get('features', [])) >= 1

def test_geocode_local_landmark(client):
    res = client.get('/api/geocode?q=andheri')
    assert res.status_code == 200
    data = res.get_json()
    results = data.get('results', [])
    assert len(results) >= 1
    assert any('andheri' in r['name'].lower() for r in results)

def test_geocode_empty_query(client):
    res = client.get('/api/geocode?q=')
    assert res.status_code == 200
    data = res.get_json()
    assert data.get('results') == []

def test_geocode_external_mock(client):
    # Mock photon requests to test non-landmark external fallback
    mock_photon_response = MagicMock()
    mock_photon_response.status_code = 200
    mock_photon_response.json.return_value = {
        "features": [
            {
                "geometry": {"coordinates": [72.83, 18.99]},
                "properties": {"name": "Test Mock Center", "district": "Mumbai", "osm_value": "amenity"}
            }
        ]
    }

    with patch('requests.get', return_value=mock_photon_response):
        res = client.get('/api/geocode?q=uniquepoi123')
        assert res.status_code == 200
        data = res.get_json()
        assert len(data.get('results', [])) >= 1
        assert "Test Mock Center" in data['results'][0]['name']

def test_reverse_geocode_endpoint(client):
    # Test reverse geocode with mock nominatim
    mock_nominatim = MagicMock()
    mock_nominatim.status_code = 200
    mock_nominatim.json.return_value = {
        "display_name": "Marine Drive, Churchgate, Mumbai, Maharashtra"
    }

    with patch('requests.get', return_value=mock_nominatim):
        res = client.get('/api/reverse-geocode?lat=18.9432&lng=72.8230')
        assert res.status_code == 200
        data = res.get_json()
        assert "Marine Drive" in data['name']

def test_journey_analyze_success(client):
    # Mock OpenRouteService route response
    mock_ors_res = MagicMock()
    mock_ors_res.status_code = 200
    mock_ors_res.json.return_value = {
        "features": [
            {
                "geometry": {
                    "coordinates": [
                        [72.8464, 19.1197],
                        [72.8354, 18.9401]
                    ]
                },
                "properties": {
                    "segments": [
                        {"distance": 12500, "duration": 1800}
                    ]
                }
            }
        ]
    }

    with patch('app.ORS_API_KEY', 'mock_test_key'), patch('requests.post', return_value=mock_ors_res):
        payload = {
            "origin": "Andheri Station",
            "destination": "CSMT",
            "start": {"lat": 19.1197, "lng": 72.8464},
            "end": {"lat": 18.9401, "lng": 72.8354}
        }
        res = client.post('/api/journey/analyze', json=payload)
        assert res.status_code == 200
        data = res.get_json()
        assert "route" in data
        assert "routes" in data
        assert "resource_coverage" in data
        assert data["resource_coverage"]["score"] >= 0
        assert len(data["emergency_contacts"]) == 4

def test_journey_analyze_missing_body(client):
    res = client.post('/api/journey/analyze', json={})
    assert res.status_code in [400, 422]
    data = res.get_json()
    assert "error" in data or "message" in data

def test_journey_analyze_invalid_coordinates(client):
    # Invalid coordinates (out of bounds) with unknown name fallback triggers 422
    payload = {
        "origin": "Unknown Fake Nonexistent Landmark XYZ999",
        "destination": "Another Unknown Point ABC888",
        "start": {"lat": 999.0, "lng": -999.0}, # Out of bounds
        "end": {"lat": -888.0, "lng": 999.0}
    }
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 404
        res = client.post('/api/journey/analyze', json=payload)
        assert res.status_code == 422

def test_journey_analyze_routing_failure_service_unavailable(client):
    # When all routing providers fail or return non-200, system returns 503 rather than fabricating fake coordinates
    mock_err = MagicMock()
    mock_err.status_code = 500

    with patch('app.ORS_API_KEY', 'mock_test_key'), patch('requests.post', return_value=mock_err), patch('requests.get', return_value=mock_err):
        payload = {
            "origin": "Bandra West",
            "destination": "Dadar West",
            "start": {"lat": 19.0596, "lng": 72.8295},
            "end": {"lat": 19.0178, "lng": 72.8478}
        }
        res = client.post('/api/journey/analyze', json=payload)
        assert res.status_code == 503
        data = res.get_json()
        assert "error" in data


def test_safety_assistant_legal_rights(client):
    queries = [
        "What is Zero FIR?",
        "Can a woman be arrested at night?",
        "How can I get legal aid?"
    ]
    for q in queries:
        res = client.post('/api/assistant', json={'message': q})
        assert res.status_code == 200
        reply = res.get_json().get('reply', '')
        assert "BNSS" in reply or "Legal Services Authorities Act" in reply
        assert "not legal advice" in reply.lower()

def test_safety_assistant_emergency_helpline(client):
    res = client.post('/api/assistant', json={'message': 'What is the railway emergency number?'})
    assert res.status_code == 200
    reply = res.get_json().get('reply', '')
    assert "139" in reply
    assert "112" in reply
    assert "103" in reply


def test_tts_status_endpoint(client):
    res = client.get('/api/tts/status')
    assert res.status_code == 200
    data = res.get_json()
    assert "provider_configured" in data
    assert "model_id" in data
    assert "cached_entries" in data


def test_tts_synthesize_missing_text(client):
    res = client.post('/api/tts/synthesize', json={'text': ''})
    assert res.status_code == 400
    data = res.get_json()
    assert data.get('use_client_tts') is True


def test_tts_synthesize_text_too_long(client):
    res = client.post('/api/tts/synthesize', json={'text': 'A' * 350})
    assert res.status_code == 400
    data = res.get_json()
    assert data.get('use_client_tts') is True


def test_tts_synthesize_unconfigured_fallback(client):
    with patch.dict(os.environ, {'ELEVENLABS_API_KEY': ''}, clear=False):
        res = client.post('/api/tts/synthesize', json={'text': 'Beta, I am outside.', 'persona': 'mom'})
        assert res.status_code == 200
        data = res.get_json()
        assert data.get('status') == 'fallback'
        assert data.get('use_client_tts') is True


def test_tts_synthesize_success_and_caching(client):
    mock_audio = b"MOCK_MP3_AUDIO_BYTES_STREAM"
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = mock_audio

    env_overrides = {
        'ELEVENLABS_API_KEY': 'mock_elevenlabs_key_123',
        'ELEVENLABS_MOM_VOICE_ID': 'mock_voice_id_mom'
    }

    with patch.dict(os.environ, env_overrides, clear=False), patch('requests.post', return_value=mock_resp) as mock_post:
        # First call -> fetches and caches
        res1 = client.post('/api/tts/synthesize', json={'text': 'Beta, please come out safely.', 'persona': 'mom'})
        assert res1.status_code == 200
        assert res1.data == mock_audio
        assert res1.content_type.startswith('audio/mpeg')
        assert mock_post.call_count == 1

        # Second call with identical payload -> served from in-memory cache without hitting requests.post
        res2 = client.post('/api/tts/synthesize', json={'text': 'Beta, please come out safely.', 'persona': 'mom'})
        assert res2.status_code == 200
        assert res2.data == mock_audio
        assert mock_post.call_count == 1  # No second request to external provider!


def test_tts_synthesize_external_failure_fallback(client):
    mock_err_resp = MagicMock()
    mock_err_resp.status_code = 429

    env_overrides = {
        'ELEVENLABS_API_KEY': 'mock_elevenlabs_key_123',
        'ELEVENLABS_DAD_VOICE_ID': 'mock_voice_id_dad'
    }

    with patch.dict(os.environ, env_overrides, clear=False), patch('requests.post', return_value=mock_err_resp):
        res = client.post('/api/tts/synthesize', json={'text': 'Beta, I am near the signal.', 'persona': 'dad'})
        assert res.status_code == 200
        data = res.get_json()
        assert data.get('status') == 'fallback'
        assert data.get('use_client_tts') is True

