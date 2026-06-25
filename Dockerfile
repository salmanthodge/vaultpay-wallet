# syntax=docker/dockerfile:1

# ---- deps: install production dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- build: generate prisma client ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# ---- run: final image ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY . .
USER app
EXPOSE 4002
# migrations are applied explicitly (see docker-compose command), not on import
CMD ["node", "src/server.js"]
