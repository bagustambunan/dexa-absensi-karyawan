FROM node:22.23.3-bookworm-slim
WORKDIR /app/attendance-api
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/main.js"]
