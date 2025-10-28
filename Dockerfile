# Use Node.js 18 (or any compatible version)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose your backend port
EXPOSE 5000

# Run the app
CMD ["npm", "start"]