FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p uploads thumbnails data && \
    touch data/db.json && \
    chown -R node:node /app && \
    chmod 755 uploads thumbnails data && \
    chmod 644 data/db.json

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]