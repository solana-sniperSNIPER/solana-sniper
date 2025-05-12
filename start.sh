#!/bin/bash

# Start dummy HTTP server in the background to keep Koyeb health check happy
node keepalive.js &

# Start your sniper bot (Python WebSocket listener)
python3 watch_new_tokens.py
