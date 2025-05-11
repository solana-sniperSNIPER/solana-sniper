const axios = require('axios');
const fs = require('fs');

(async () => {
  try {
    const response = await axios.get('https://pumpportal.fun/api/create-wallet');
    const data = response.data;

    console.log('✅ Sniper wallet created!');
    console.log(`🧠 Wallet Address: ${data.wallet}`);
    console.log(`🔑 API Key: ${data.apiKey}`);

    // Save locally for later use
    fs.writeFileSync('sniper-wallet.json', JSON.stringify(data, null, 2));
    console.log('💾 Saved to sniper-wallet.json');
  } catch (err) {
    console.error('❌ Failed to create sniper wallet:', err.message);
  }
})();
