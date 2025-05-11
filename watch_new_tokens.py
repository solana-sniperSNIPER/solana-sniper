import asyncio
import websockets
import json
import subprocess
import time
import requests
import os
import tempfile
import shutil

TELEGRAM_BOT_TOKEN = '7871990997:AAF2Btzipsbdsl0HlmD1zdMvdKM8y1fiiL0'
TELEGRAM_CHAT_ID = '1370133617'

sniped_mints = set()
token_trade_counts = {}

def log_active_token(mint, target_cap, stop_loss_cap):
    filepath = "active_tokens.json"
    tokens = []

    if os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                tokens = json.load(f)
        except:
            tokens = []

    tokens.append({
        "mint": mint,
        "target_cap": target_cap,
        "stop_loss_cap": stop_loss_cap
    })

    with tempfile.NamedTemporaryFile("w", delete=False, dir=".") as tmp:
        json.dump(tokens, tmp, indent=2)
        temp_name = tmp.name

    shutil.move(temp_name, filepath)

async def monitor_volume_and_sell(mint, name, symbol):
    await asyncio.sleep(30)
    count = token_trade_counts.get(mint, 0)

    if count < 2:
        print(f"🔁 Low volume detected for {symbol} — auto-selling...")
        subprocess.Popen(["node", "monitorAndSell.js", mint, "3", "0.5"])  # emergency cap and stop
    else:
        # continue standard sell tracking
        log_active_token(mint, "50", "8")
        subprocess.Popen(["node", "monitorAndSell.js", mint, "50", "8"])

async def handle_token(mint, name, symbol, price, vSol):
    if mint in sniped_mints:
        return

    if price >= 0.001 or vSol < 1.5:
        return

    print(f"🚀 Instant-buying {symbol} with {vSol:.2f} vSol")
    sniped_mints.add(mint)

    try:
        subprocess.run(["node", "snipeViaAPI.js", mint])
        token_trade_counts[mint] = 0
        asyncio.create_task(monitor_volume_and_sell(mint, name, symbol))
    except Exception as e:
        print(f"❌ Failed to snipe {symbol}: {e}")

async def main():
    uri = "wss://pumpportal.fun/api/data"

    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({"method": "subscribeNewToken"}))
        await websocket.send(json.dumps({"method": "subscribeTokenTrade", "keys": []}))
        print("📡 Sniper Phase 1 Live: Instant Buy + Volume Exit")

        async for message in websocket:
            try:
                data = json.loads(message)
                if "txType" in data and data["txType"] == "create":
                    mint = data.get("mint", "").replace("pump", "")
                    name = data.get("name", "Unknown")
                    symbol = data.get("symbol", "")
                    solAmount = data.get("solAmount", 0)
                    initialBuy = data.get("initialBuy", 0)
                    vSol = data.get("vSolInBondingCurve", 0)

                    if solAmount == 0 or initialBuy == 0:
                        continue

                    price = solAmount / initialBuy
                    asyncio.create_task(handle_token(mint, name, symbol, price, vSol))

                elif "txType" in data and data["txType"] == "buy":
                    mint = data.get("mint", "").replace("pump", "")
                    if mint not in token_trade_counts:
                        token_trade_counts[mint] = 0
                    token_trade_counts[mint] += 1

            except Exception as e:
                print("⚠️ Error:", e)

asyncio.run(main())
