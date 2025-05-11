const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');

// Paste the private key from sniper-wallet.json here (in quotes)
const privateKey = '3828P34ya6jLNELACDs7qfUdNXbUokEquXPBBUeNCjaDn6ceofKabuLSghzkGdTqwwGAzchX2TNgGgLjooNH6ZGj';

const secret = bs58.decode(privateKey);
const keypair = Keypair.fromSecretKey(secret);

console.log('✅ Recovered Wallet Address: ', keypair.publicKey.toBase58());
