# Use a Node base image
FROM node:18

# Install Python and pip
RUN apt update && apt install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install
RUN pip3 install -r requirements.txt || true

# Expose dummy port for Koyeb health check
EXPOSE 8000

# Run keepalive server and Python bot
CMD ["./start.sh"]
