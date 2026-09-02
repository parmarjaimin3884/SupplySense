import json, sys, urllib.request

url = "http://localhost:8000/api/v1/shipments?limit=2"
req = urllib.request.Request(url)
with urllib.request.urlopen(req, timeout=30) as resp:
    data = json.loads(resp.read())

items = data.get("data", [])
print(f"Total items returned: {len(items)}")
print()
for i in items[-6:]:
    stype = i.get("shipment_type", "N/A")
    po = i.get("po_number", "?")
    prod = i.get("product_name", "?")
    wh = i.get("warehouse_name", "?")
    fwh = i.get("from_warehouse_name", "N/A")
    print(f"  {po} | type={stype} | {prod} | dest={wh} | from={fwh}")
