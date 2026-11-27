FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./backend/
RUN npm ci --prefix backend
COPY backend ./backend
COPY src ./src
WORKDIR /app/backend
RUN npm run prisma:generate
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4000 AUTH_DEV_OTP=false
EXPOSE 4000
CMD ["npm", "start"]
