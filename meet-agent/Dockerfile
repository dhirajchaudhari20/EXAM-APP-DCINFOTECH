# Base image with Node.js
FROM node:18-slim

# Install dependencies for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    procps \
    libxss1 \
    libasound2 \
    pulseaudio \
    xvfb \
    dbus \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome (Stable)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Git dependencies (if any) and others
RUN npm install

# Copy source code
COPY . .

# Environment variables
ENV HEADLESS=true
# Port for PulseAudio (if needed)
# ENV PULSE_SERVER=...

# Start command (using xvfb-run for virtual display)
CMD ["xvfb-run", "--auto-servernum", "--server-args='-screen 0 1280x720x24'", "node", "bot.js"]
