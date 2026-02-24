# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build for production
COPY . .
RUN npm run build

# Stage 2: Serve the statically compiled files via NGINX
FROM nginx:alpine

# Copy the built React app to the default NGINX html serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Apply custom configuration for React Router routing inside NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
