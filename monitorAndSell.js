const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Inputs from CLI
const MINT = process.argv[2];
const TARGET_CAP = parseFloat(process.argv[3]) || 50;
const STOP_LOSS_CAP = parseFloat(process.argv[4]) || 8;

const API_KEY = '5dk3grbu6n152db3at0q8tjq64tp4dkk6xrmrdamdwr4ymbu9dcp2bu8e95mrgj7dx24rv3hdnmket379xr7jnbk60umjtv8att5jtu9axqmmjtbf9b7eja4c9qnakvuc526aykp84ykua9a6ejht9tr3evvk6nmq8kkq84drr36kj36tu3gdve8gtprrjmcd34acuuatkkuf8';
const TELEGRAM_BOT_TOKEN = '7871990997:AAF2Btzipsbdsl0HlmD1zdMvdKM8y1fiiL0';
const TELEGRAM_CHAT_ID = '1370133617';

// Send Telegram alert
async function sendTelegram(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
    });
  } catch (err) {
    console.error("❌ Telegram error:", err.message);
  }
}

// Log to CSV
function logSell(mint, txid, cap, reason) {
  const logLine = `${new Date().toISOString()},SELL,${mint},${cap},https://solscan.io/tx/${txid},${reason}\n`;
  fs.appendFileSync(path.join(__dirname, 'sniper_logs.csv'), logLine);
}

// Remove sold token from active list
function removeFromActiveTokens(mint) {
  const filePath = path.join(__dirname, 'active_tokens.json');
  if (!fs.existsSync(filePath)) return;

  try {
    const tokens = JSON.parse(fs.readFileSync(filePath));
    const filtered = tokens.filter(t => t.mint !== mint);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
    console.log(`🧹 Removed ${mint} from active_tokens.json`);
  } catch (e) {
    console.error("❌ Failed to update active_tokens.json:", e.message);
  }
}

// Auto-sell logic
async function sell(reason) {
  const sell = await axios.post(`https://pumpportal.fun/api/trade?api-key=${API_KEY}`, {
    action: 'sell',
    mint: MINT,
    amount: 100,
    denominatedInSol: false,
    slippage: 10,
    pool: 'pump',
    priorityFee: 0.00005
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  const txid = sell.data.signature;
  const txLink = `https://solscan.io/tx/${txid}`;
  logSell(MINT, txid, '-', reason);
  await sendTelegram(`🚨 AUTO-SELL (${reason})\nTX: ${txLink}`);
  removeFromActiveTokens(MINT);
  console.log(`✅ Sold (${reason}): ${txLink}`);
  process.exit();
}

// Monitor loop
async function checkMarketCap() {
  try {
    const res = await axios.get(`https://pumpportal.fun/api/token/${MINT}`);
    const token = res.data;
    const cap = token.marketCapSol;
    console.log(`🔍 [${MINT.slice(0,6)}...] Cap: ${cap} SOL`);

    if (cap >= TARGET_CAP) {
      await sell(`target cap reached (${cap})`);
    }

    if (cap <= STOP_LOSS_CAP) {
      await sell(`stop-loss triggered (${cap})`);
    }

  } catch (err) {
    console.error("⚠️ Error checking cap:", err.message);
  }
}

setInterval(checkMarketCap, 15000);
checkMarketCap();
