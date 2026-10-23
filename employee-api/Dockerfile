FROM node:22.23.3-bookworm-slim
WORKDIR /app/employee-api
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main.js"]
