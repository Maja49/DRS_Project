# frontend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies early to leverage Docker caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port used by Vite
EXPOSE 5173

# Start Vite dev server
CMD ["sh", "-c", "npm run dev -- --host"]
