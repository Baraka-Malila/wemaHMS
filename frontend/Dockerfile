FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# For LAN access, bind to all interfaces
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
