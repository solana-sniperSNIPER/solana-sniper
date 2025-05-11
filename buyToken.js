const web3 = require('@solana/web3.js');
const fs = require('fs');

// Load the keypair from keypair.json
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('keypair.json')));
const keypair = web3.Keypair.fromSecretKey(secretKey);

(async () => {
  const connection = new web3.Connection(
    web3.clusterApiUrl('mainnet-beta'),
    'confirmed'
  );

  const publicKey = keypair.publicKey.toBase58();
  const balance = await connection.getBalance(keypair.publicKey);
  const sol = balance / web3.LAMPORTS_PER_SOL;

  console.log(`🧾 Wallet: ${publicKey}`);
  console.log(`💰 Balance: ${sol} SOL`);
})();
