import urllib.request, json

url = "http://127.0.0.1:8000/health"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        print("Health Status:", resp.getcode())
        print(resp.read().decode())
except Exception as e:
    print("Health error:", e)

# Test forecast list
url_fc = "http://127.0.0.1:8000/api/v1/forecast?limit=5"
req_fc = urllib.request.Request(url_fc, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req_fc, timeout=5) as resp:
        data = json.loads(resp.read())
        print("Forecast count:", len(data["data"]))
        first = data["data"][0]
        print(f"First: {first['sku']} @ {first['warehouse_code']} | Avail: {first['available_stock']} | Exp30d: {first['projected_30d']} | Shortfall: {first['is_shortfall']}")
except Exception as e:
    print("Forecast error:", e)

# Test summary
url_sum = "http://127.0.0.1:8000/api/v1/forecast/summary"
req_sum = urllib.request.Request(url_sum, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req_sum, timeout=5) as resp:
        data = json.loads(resp.read())
        print("Summary Exp Sales:", data["data"]["total_expected_sales_30d"])
        print("Summary Avail Stock:", data["data"]["total_available_stock"])
        print("Monthly comparison bars count:", len(data["data"]["monthly_comparison"]))
except Exception as e:
    print("Summary error:", e)
