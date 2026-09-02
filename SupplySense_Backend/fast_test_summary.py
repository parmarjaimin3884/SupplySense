import urllib.request, json

url = "http://localhost:8000/api/v1/forecast/summary"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
        print("Summary Status:", resp.getcode())
        print("Expected 30D Sales:", data["data"]["total_expected_sales_30d"])
        print("Total Avail Stock:", data["data"]["total_available_stock"])
        print("Monthly Points Count:", len(data["data"]["monthly_comparison"]))
except Exception as e:
    print("Error:", e)
