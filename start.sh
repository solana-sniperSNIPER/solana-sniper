#!/bin/bash

# Start dummy HTTP server for Koyeb health check
node keepalive.js &

# Start your sniper bot
python3 watch_new_tokens.py
