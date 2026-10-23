FROM node:22.23.3-bookworm-slim
WORKDIR /app/frontend
ENV HUSKY=0
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_EMPLOYEE_API_URL=http://localhost:3001
ARG VITE_ATTENDANCE_API_URL=http://localhost:3002
ENV VITE_EMPLOYEE_API_URL=$VITE_EMPLOYEE_API_URL
ENV VITE_ATTENDANCE_API_URL=$VITE_ATTENDANCE_API_URL
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
