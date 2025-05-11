const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ✅ Get mint from CLI
const MINT_ADDRESS = process.argv[2];

// ✅ Your sniper config
const API_KEY = '5dk3grbu6n152db3at0q8tjq64tp4dkk6xrmrdamdwr4ymbu9dcp2bu8e95mrgj7dx24rv3hdnmket379xr7jnbk60umjtv8att5jtu9axqmmjtbf9b7eja4c9qnakvuc526aykp84ykua9a6ejht9tr3evvk6nmq8kkq84drr36kj36tu3gdve8gtprrjmcd34acuuatkkuf8';
const TELEGRAM_BOT_TOKEN = '7871990997:AAF2Btzipsbdsl0HlmD1zdMvdKM8y1fiiL0';
const TELEGRAM_CHAT_ID = '1370133617';
const AMOUNT_SOL = 0.015;

// ✅ CSV Logging Function
function logBuy(mint, txid, amountSol) {
  const logLine = `${new Date().toISOString()},BUY,${mint},${amountSol},https://solscan.io/tx/${txid}\n`;
  fs.appendFileSync(path.join(__dirname, 'sniper_logs.csv'), logLine);
}

// ✅ Telegram alert
async function sendTelegramMessage(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
    });
  } catch (err) {
    console.error('❌ Failed to send Telegram alert:', err.message);
  }
}

(async () => {
  try {
    const response = await axios.post(
      `https://pumpportal.fun/api/trade?api-key=${API_KEY}`,
      {
        action: 'buy',
        mint: MINT_ADDRESS,
        amount: AMOUNT_SOL,
        denominatedInSol: "true",
        slippage: 10,
        priorityFee: 0.00005,
        pool: 'pump'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🔎 Full API response:', response.data);

    if (response.data.signature) {
      const txLink = `https://solscan.io/tx/${response.data.signature}`;
      console.log(`✅ Snipe sent! TX ID: ${txLink}`);

      // Log to CSV
      logBuy(MINT_ADDRESS, response.data.signature, AMOUNT_SOL);

      // Telegram alert
      const msg = `🚨 SNIPED!\n\nMint: ${MINT_ADDRESS}\nAmount: ${AMOUNT_SOL} SOL\nTX: ${txLink}`;
      await sendTelegramMessage(msg);
    } else {
      console.log('⚠️ No transaction ID returned. Something may have failed silently.');
    }

  } catch (error) {
    console.error('❌ Failed to snipe:', error.response?.data || error.message);
    await sendTelegramMessage(`❌ Snipe failed for ${MINT_ADDRESS}`);
  }
})();
