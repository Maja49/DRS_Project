# frontend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies early to leverage Docker caching
COPY ./package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build app
RUN npm run build

# Expose port used by Vite
EXPOSE 5173

# Start preview (production-like)
CMD ["npm", "run", "preview", "--", "--host"]
