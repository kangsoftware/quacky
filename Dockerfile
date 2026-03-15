FROM node:24-alpine AS deps
WORKDIR /app

# Prisma config requires DATABASE_URL to exist during install/build-time generation.
ENV DATABASE_URL=postgresql://docker:docker@localhost:5432/app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app

ENV DATABASE_URL=postgresql://docker:docker@localhost:5432/app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run app:build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/prisma ./src/prisma

EXPOSE 3001

CMD ["npm", "run", "app:start"]
