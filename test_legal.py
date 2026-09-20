import urllib.request
import json

questions = [
    "What is Zero FIR?",
    "Can a woman be arrested at night?",
    "What is the railway emergency number?",
    "How can I get legal aid?"
]

print("Testing Assistant API with updated BNSS and Emergency Helplines:\n")
for q in questions:
    req = urllib.request.Request(
        'http://localhost:5000/api/assistant',
        data=json.dumps({'message': q}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    print(f"==================================================")
    print(f"QUESTION: {q}")
    print(f"==================================================")
    print(res['reply'])
    print("\n")
