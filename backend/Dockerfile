FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (only production)
RUN npm install --omit=dev

# Copy application files
COPY . .

# Ensure the uploads directory exists for missing Cloudinary API fallback
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
