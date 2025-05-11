const web3 = require('@solana/web3.js');

// 👇 Replace this with your actual Phantom wallet public key
const WALLET_ADDRESS = 'J7c4kCSgFUvgfKHnssEvK26MfBg9o5vr83FjAAVK435G';

async function checkBalance() {
  try {
    const connection = new web3.Connection(
      web3.clusterApiUrl('mainnet-beta'),
      'confirmed'
    );

    const publicKey = new web3.PublicKey(WALLET_ADDRESS);
    const lamports = await connection.getBalance(publicKey);
    const sol = lamports / web3.LAMPORTS_PER_SOL;

    console.log(`✅ Wallet balance: ${sol} SOL`);
  } catch (err) {
    console.error('❌ Error checking balance:', err.message);
  }
}

checkBalance();
