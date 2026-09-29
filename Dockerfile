FROM node:20-alpine

WORKDIR /app

# Install basic native build tools
RUN apk add --no-cache python3 make g++

# Copy backend package files
COPY backend/package*.json ./
RUN npm install --omit=dev --prefer-offline

# Copy backend application source and datasets
COPY backend/src ./src
COPY backend/data ./data
COPY data/ ../data/

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "src/index.js"]
