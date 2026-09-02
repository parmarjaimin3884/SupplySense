import urllib.request, json, urllib.error

url = "http://localhost:8000/api/v1/forecast"
try:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        print("Status:", resp.getcode())
        data = json.loads(resp.read())
        print("Data length:", len(data.get("data", [])))
        if data.get("data"):
            print("First item:", json.dumps(data["data"][0], indent=2))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode())
except Exception as e:
    print("Exception:", e)
