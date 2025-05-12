from solders.keypair import Keypair
from base58 import b58decode

# 🔐 Replace this with your Backpack private key (base58 format)
private_key_b58 = "3828P34ya6jLNELACDs7qfUdNXbUokEquXPBBUeNCjaDn6ceofKabuLSghzkGdTqwwGAzchX2TNgGgLjooNH6ZGj"

# 📦 Replace this with your Backpack public key (wallet address)
expected_public_key = "4z4JNxCbzey5okdmMY8WH1En1G5a3BZxD54aZN92wqgb"

try:
    # Decode the base58 private key and generate Keypair
    decoded = b58decode(private_key_b58)
    kp = Keypair.from_bytes(decoded)

    derived_public_key = str(kp.pubkey())

    print("✅ Derived Public Key:", derived_public_key)
    print("📦 Expected Public Key:", expected_public_key)

    if derived_public_key == expected_public_key:
        print("🎉 SUCCESS: Keys match!")
    else:
        print("❌ ERROR: Keys do NOT match!")
except Exception as e:
    print("❌ Failed to decode or match:", e)
