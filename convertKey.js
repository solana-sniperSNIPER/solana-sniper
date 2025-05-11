const bs58 = require('bs58');
const fs = require('fs');

// 🔐 Replace with your Phantom private key string
const phantomPrivateKey = '5sqCGtxcRWazfWcUkfiGXqfHnTXu8HsDie4WHZsXVmWVcHNP8axgBsjb3jYayNznKFeHLunh6iwjwyqGZZB2zFbt';

try {
  const decoded = bs58.decode(phantomPrivateKey); // ⬅️ This should now work
  const uint8Array = new Uint8Array(decoded);
  fs.writeFileSync('keypair.json', JSON.stringify(Array.from(uint8Array)));
  console.log('✅ keypair.json has been created successfully.');
} catch (error) {
  console.error('❌ Error decoding the private key:', error.message);
}
