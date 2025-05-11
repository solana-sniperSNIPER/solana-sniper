import asyncio
import websockets
import json

async def subscribe():
    uri = "wss://pumpportal.fun/api/data"
    async with websockets.connect(uri) as websocket:
        
        # Subscribe only to new token events
        payload = {
            "method": "subscribeNewToken"
        }
        await websocket.send(json.dumps(payload))

        print("📡 Listening for new token launches on pump.fun...\n")

        async for message in websocket:
            data = json.loads(message)
            print(json.dumps(data, indent=2))  # Pretty-print the data for now

# Run it
asyncio.get_event_loop().run_until_complete(subscribe())
