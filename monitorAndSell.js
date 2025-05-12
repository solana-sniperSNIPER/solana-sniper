const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');

// Load wallet & API key
const wallet = JSON.parse(fs.readFileSync('sniper-wallet.json', 'utf8'));
const mint = process.argv[2];
const targetCap = parseFloat(process.argv[3]);
const stopLossCap = parseFloat(process.argv[4]);

if (!mint || isNaN(targetCap) || isNaN(stopLossCap)) {
  console.error('❌ Usage: node monitorAndSell.js <mint> <targetCap> <stopLossCap>');
  process.exit(1);
}

console.log(`📊 Monitoring ${mint} until cap hits ${targetCap} or drops below ${stopLossCap} SOL...`);

async function getMarketCap() {
  try {
    const res = await axios.get(`https://pumpportal.fun/api/token/${mint}`);
    return res.data.marketCapSol;
  } catch (err) {
    console.log('⚠️ Error checking cap:', err.response?.statusText || err.message);
    return null;
  }
}

async function sellToken() {
  try {
    const res = await axios.post(
      'https://pumpportal.fun/api/sell',
      {
        mint,
        apiKey: wallet.apiKey,
        walletPublicKey: wallet.walletPublicKey,
        privateKey: wallet.privateKey,
      }
    );

    if (res.data.signature) {
      console.log(`💸 Sold ${mint}! TX: https://solscan.io/tx/${res.data.signature}`);
      return true;
    } else {
      console.error('❌ Sell failed:', res.data);
    }
  } catch (err) {
    console.error('❌ Sell request error:', err.message);
  }
  return false;
}

(async () => {
  while (true) {
    const cap = await getMarketCap();
    if (cap === null) {
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }

    console.log(`🔎 Current Market Cap: ${cap.toFixed(2)} SOL`);

    if (cap >= targetCap) {
      console.log('🚀 Target cap reached! Selling...');
      const success = await sellToken();
      if (success) break;
    }

    if (cap <= stopLossCap) {
      console.log('🔻 Stop-loss hit. Selling...');
      const success = await sellToken();
      if (success) break;
    }

    await new Promise((r) => setTimeout(r, 15000)); // wait 15s
  }
})();
