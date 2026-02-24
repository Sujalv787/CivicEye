# Stage 1: Build the React Application
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy dependencies and install
COPY frontend/package*.json ./
RUN npm install

# Copy source code and build for production
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Node.js Backend Application
FROM node:20-alpine
WORKDIR /app

# Enable strict error checking and performance boosts
ENV NODE_ENV=production

# Copy backend dependencies
COPY backend/package*.json ./backend/

WORKDIR /app/backend

# Install only production dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ ./

# Create uploads directory for local picture fallback
RUN mkdir -p uploads

# Copy built React app from the first stage into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose standard port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
