# syntax=docker/dockerfile:1

# ---- deps: install production dependencies ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- build: generate prisma client ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
# Prisma needs OpenSSL to detect the right engine; bookworm-slim ships without it.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# ---- run: final image ----
FROM node:20-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production
# Prisma's query engine links against libssl at runtime; bookworm-slim ships without it.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

RUN chown -R node:node /app

USER node
EXPOSE 4002
# migrations are applied explicitly (see docker-compose command), not on import
CMD ["node", "src/server.js"]
