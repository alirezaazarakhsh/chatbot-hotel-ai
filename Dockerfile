# Base image with the specified Node.js version
FROM node:20.11.0

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build the Vite application
RUN npm run build

# Expose the port
EXPOSE 3001

# Start the app in production mode using Vite's preview server
CMD ["npm", "run", "preview"]