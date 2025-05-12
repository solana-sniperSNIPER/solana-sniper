#!/bin/bash

# Start the dummy web server in the background
node keepalive.js &

# Start your sniper bot
python3 watch_new_tokens.py
