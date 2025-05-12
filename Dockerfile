# Base image with both Node.js and Python
FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Install Node.js dependencies
RUN npm install

# Start the sniper
CMD ["./start.sh"]

