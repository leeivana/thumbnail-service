FROM node:20-alpine AS builder
# Install build dependencies for Sharp compilation
RUN apk add --no-cache python3 make g++ jpeg-dev cairo-dev giflib-dev pango-dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
# Install runtime dependencies for Sharp
RUN apk add --no-cache jpeg-dev cairo-dev giflib-dev pango-dev
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist

# Create directories and set permissions
RUN mkdir -p uploads thumbnails && \
    chown -R node:node uploads thumbnails

# Switch to non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]