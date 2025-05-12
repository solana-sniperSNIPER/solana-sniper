# Use Node.js and Python base
FROM node:18

# Install Python 3 and pip
RUN apt update && apt install -y python3 python3-pip

# Create working directory
WORKDIR /app

# Copy everything
COPY . .

# Install Node.js dependencies
RUN npm install

# Install Python dependencies
RUN pip3 install -r requirements.txt || true

# Expose port for Koyeb health check
EXPOSE 8000

# Run keepalive and sniper script
CMD ["./start.sh"]
