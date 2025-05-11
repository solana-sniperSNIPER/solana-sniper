const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WALLET_ADDRESS = '4z4JNxCbzey5okdmMY8WH1En1G5a3BZxD54aZN92wqgb';
const TELEGRAM_BOT_TOKEN = '7871990997:AAF2Btzipsbdsl0HlmD1zdMvdKM8y1fiiL0';
const TELEGRAM_CHAT_ID = '1370133617';
const connection = new Connection('https://api.mainnet-beta.solana.com');

let processedIds = new Set(); // ✅ track handled messages

async function getWalletBalance() {
  try {
    const publicKey = new PublicKey(WALLET_ADDRESS);
    const balanceLamports = await connection.getBalance(publicKey);
    return balanceLamports / 1e9;
  } catch (err) {
    console.error('❌ Wallet balance error:', err.message);
    return null;
  }
}

async function sendTelegram(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
    });
  } catch (err) {
    console.error('❌ Telegram error:', err.message);
  }
}

async function sendTelegramFile(filePath) {
  try {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('document', fs.createReadStream(filePath));
    const headers = formData.getHeaders();
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, { headers });
  } catch (err) {
    console.error('❌ File send error:', err.message);
    await sendTelegram("⚠️ Could not send log.");
  }
}

async function handleActiveCommand() {
  const file = path.join(__dirname, 'active_tokens.json');
  if (!fs.existsSync(file)) return sendTelegram("🛑 No active tokens.");

  try {
    const tokens = JSON.parse(fs.readFileSync(file));
    if (!tokens.length) return sendTelegram("🛑 No active tokens.");

    let msg = `🎯 Monitoring ${tokens.length} tokens:\n`;
    for (let t of tokens) {
      msg += `• ${t.mint.slice(0, 6)}... — cap: ${t.target_cap} / stop: ${t.stop_loss_cap}\n`;
    }
    await sendTelegram(msg);
  } catch {
    await sendTelegram("⚠️ Could not read active tokens.");
  }
}

async function handleLastCommand() {
  const file = path.join(__dirname, 'sniper_logs.csv');
  if (!fs.existsSync(file)) return sendTelegram("🧾 No trades logged yet.");

  try {
    const lines = fs.readFileSync(file).toString().trim().split('\n');
    const last = lines[lines.length - 1].split(',');
    const [time, action, mint, value, tx] = last;
    const emoji = action === "BUY" ? "🟢" : "🔴";
    const msg = `${emoji} Last ${action}:\n🪙 Mint: ${mint.slice(0, 6)}...\n💰 Value: ${value}\n🔗 ${tx}`;
    await sendTelegram(msg);
  } catch {
    await sendTelegram("⚠️ Could not fetch last trade.");
  }
}

async function listen() {
  console.log('🤖 Bot is live — listening for /wallet, /log, /active, /last');

  setInterval(async () => {
    try {
      const res = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      const updates = res.data.result;

      for (let update of updates) {
        const id = update.update_id;
        const msg = update.message?.text?.trim();
        if (!msg || processedIds.has(id)) continue;

        processedIds.add(id);

        if (msg === '/wallet') {
          const balance = await getWalletBalance();
          const reply = balance !== null
            ? `📊 Sniper Wallet:\n💰 ${balance.toFixed(4)} SOL\n🔑 ${WALLET_ADDRESS}`
            : '⚠️ Unable to fetch wallet balance.';
          await sendTelegram(reply);
        }

        if (msg === '/log') {
          const logPath = path.join(__dirname, 'sniper_logs.csv');
          fs.existsSync(logPath)
            ? await sendTelegramFile(logPath)
            : await sendTelegram("⚠️ Log file not found.");
        }

        if (msg === '/active') {
          await handleActiveCommand();
        }

        if (msg === '/last') {
          await handleLastCommand();
        }
      }
    } catch (err) {
      console.error('Polling failed:', err.message);
    }
  }, 5000);
}

listen();
