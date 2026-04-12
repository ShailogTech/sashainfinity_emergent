# ===========================
#       BUILD STAGE
# ===========================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy environment file BEFORE build
COPY .env.production ./.env
COPY .env ./.env.local

# Copy source code
COPY . .

# Build Vite app
RUN npm run build


# ===========================
#       RUNTIME STAGE
# ===========================
FROM node:18-alpine AS runtime

WORKDIR /app

# Simple static server
RUN npm install -g serve

# Copy built assets
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
