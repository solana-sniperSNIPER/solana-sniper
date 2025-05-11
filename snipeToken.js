const axios = require('axios');
const web3 = require('@solana/web3.js');
const bs58 = require('bs58');
const fs = require('fs');

// Load your Phantom keypair
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('keypair.json')));
const keypair = web3.Keypair.fromSecretKey(secretKey);

// Settings
const MINT_ADDRESS = 'REPLACE_WITH_TOKEN_MINT'; // from Python sniper
const AMOUNT_SOL = 0.015;

(async () => {
  try {
    const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
    const wallet = keypair.publicKey.toBase58();

    // STEP 1: Call /buy to get a serialized transaction
    const buyResponse = await axios.post('https://pumpportal.fun/api/buy', {
      buyer: wallet,
      mint: MINT_ADDRESS,
      sol: AMOUNT_SOL
    });

    const txBase64 = buyResponse.data.transaction;
    const txBuffer = Buffer.from(txBase64, 'base64');

    // STEP 2: Deserialize and sign transaction
    const transaction = web3.Transaction.from(txBuffer);
    transaction.partialSign(keypair);

    // STEP 3: Send the signed transaction to Solana
    const txid = await connection.sendRawTransaction(transaction.serialize());

    console.log(`✅ Success! TX ID: https://solscan.io/tx/${txid}`);
  } catch (err) {
    console.error('❌ Failed to snipe:', err.response?.data || err.message);
  }
})();
