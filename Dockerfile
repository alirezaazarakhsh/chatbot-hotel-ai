# Base image
FROM node:20.11.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose correct port
EXPOSE 3000

# Run preview on port 3000
CMD ["npm", "run", "preview"]