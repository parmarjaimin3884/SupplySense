import urllib.request, json

for path in ['/api/v1/forecast?limit=5', '/api/v1/forecast/summary']:
    url = f'http://localhost:8000{path}'
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read())
        print(f"{path} -> Status: {r.getcode()}, Success: {data.get('success')}")
