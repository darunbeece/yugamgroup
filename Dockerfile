# Multi-stage build: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy all application files
COPY *.html ./
COPY *.js ./
COPY *.css ./
COPY *.json ./
COPY *.md ./

# Expose port 3000 (Node.js Express server)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the Node.js Express server
CMD ["node", "server.js"]
