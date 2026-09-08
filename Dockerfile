# syntax=docker/dockerfile:1

# ---------- Base ----------
# Debian slim (not alpine): avoids musl edge-cases with Prisma / Next.
FROM node:22-slim AS base
ENV HUSKY=0 \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
# Prisma needs openssl at generate time.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# `npm ci` triggers `postinstall` (prisma generate) and `prepare` (husky, no-op via HUSKY=0).
RUN npm ci

# ---------- Builder ----------
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL / DIRECT_URL are only needed at runtime, not for `next build`.
RUN npm run build

# ---------- Runner (production) ----------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Next.js standalone bundle + static assets + public dir.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma generated client (driver-adapter build: no query-engine binary, JS query compiler).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# ---------- Migrate (one-shot, opt-in) ----------
# Has the full toolchain + prisma CLI. Not started by `up`; run on demand:
#   docker compose run --rm migrate
FROM builder AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]
