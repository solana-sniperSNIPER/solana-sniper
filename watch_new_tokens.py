import asyncio
import websockets
import json
import subprocess
import requests
import time

WALLET = json.load(open("sniper-wallet.json"))
BUY_THRESHOLD_SOL = 0.001

def snipe_token(mint):
    url = "https://pumpportal.fun/api/buy"
    payload = {
        "apiKey": WALLET["apiKey"],
        "walletPublicKey": WALLET["walletPublicKey"],
        "privateKey": WALLET["privateKey"],
        "mint": mint
    }
    try:
        res = requests.post(url, json=payload)
        data = res.json()
        print(f"🔎 Full API response: {json.dumps(data, indent=2)}")
        if "signature" in data:
            print(f"✅ Snipe sent! TX ID: https://solscan.io/tx/{data['signature']}")
            auto_monitor(mint)
        else:
            print("⚠️ No transaction ID returned. Something may have failed silently.")
    except Exception as e:
        print(f"❌ Failed to snipe {mint}: {e}")

def auto_monitor(mint, tp_mult=2.0, sl_mult=0.5):
    try:
        token_info = requests.get(f"https://pumpportal.fun/api/token/{mint}").json()
        cap = float(token_info.get("marketCapSol", 0))
        if cap > 0:
            target = round(cap * tp_mult, 2)
            stop = round(cap * sl_mult, 2)
            print(f"📈 Launching auto-monitor for {mint} | Target: {target} | Stop: {stop}")
            subprocess.Popen(["node", "monitorAndSell.js", mint, str(target), str(stop)])
        else:
            print("⚠️ Initial market cap not found. Skipping auto-monitor.")
    except Exception as e:
        print(f"⚠️ Couldn't fetch market cap for {mint}: {e}")

async def subscribe():
    uri = "wss://pumpportal.fun/api/data"
    async with websockets.connect(uri) as ws:
        await ws.send(json.dumps({ "method": "subscribeNewToken" }))

        while True:
            msg = await ws.recv()
            try:
                data = json.loads(msg)
                if "mint" in data and "vSolInBondingCurve" in data:
                    mint = data["mint"]
                    price = float(data["vSolInBondingCurve"]) / float(data["vTokensInBondingCurve"])
                    if price < BUY_THRESHOLD_SOL:
                        print("🚨 NEW TOKEN FOUND under $0.001!")
                        print(f"Name: {data.get('name', 'Unknown')}")
                        print(f"Symbol: {data.get('symbol', 'Unknown')}")
                        print(f"Mint Address: {mint}")
                        print(f"Price: {price:.8f} SOL\n---")
                        snipe_token(mint)
            except Exception as e:
                print(f"⚠️ Failed to parse token event: {e}")
                print("🔧 RAW MESSAGE RECEIVED:")
                print(msg)

asyncio.run(subscribe())
