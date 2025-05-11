#!/bin/bash

# Adjust this if your venv is in a different place
VENV_PATH="$HOME/solana-wallet-check/venv/bin/activate"

# Start sniper Python script in a new Terminal window
osascript <<EOF
tell application "Terminal"
    do script "cd ~/solana-wallet-check && source $VENV_PATH && python watch_new_tokens.py"
end tell
EOF

# Start Telegram bot in another new Terminal window
osascript <<EOF
tell application "Terminal"
    do script "cd ~/solana-wallet-check && source $VENV_PATH && node walletBot.js"
end tell
EOF
