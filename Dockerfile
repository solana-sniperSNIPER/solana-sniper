# Use Python base
FROM python:3.10-slim

# Install Node.js + pip + other tools
RUN apt update && apt install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs && \
    apt clean

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Install Node packages (for Telegram bot, etc)
RUN npm install || true

# Expose port for Koyeb health check
EXPOSE 8000

# Run both sniper and dummy server
CMD ["./start.sh"]
