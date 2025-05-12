import requests
import json

response = requests.get("https://pumpportal.fun/api/create-wallet")

data = response.json()
print(json.dumps(data, indent=2))
