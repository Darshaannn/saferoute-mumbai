import urllib.request
import json

queries = [
    'How do I contact emergency services?',
    'Show Mumbai crime stats',
    'What is Zero FIR?',
    'How safe is Bandra to Dadar?',
    'hello'
]

for q in queries:
    req = urllib.request.Request(
        'http://localhost:5000/api/assistant',
        data=json.dumps({'message': q}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    print(f"=== QUERY: {q}")
    print(f"REPLY: {res['reply'][:120].replace(chr(10), ' ')}...\n")
