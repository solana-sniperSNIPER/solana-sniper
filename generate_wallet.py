from nacl.signing import SigningKey
import base58
import json

# Generate new keys
signing_key = SigningKey.generate()
private_key_bytes = signing_key.encode()
public_key_bytes = signing_key.verify_key.encode()

wallet = {
    "walletPublicKey": base58.b58encode(public_key_bytes).decode(),
    "privateKey": base58.b58encode(private_key_bytes).decode()
}

print("✅ Your new wallet:")
print(json.dumps(wallet, indent=2))

with open("sniper-wallet.json", "w") as f:
    json.dump(wallet, f, indent=2)
