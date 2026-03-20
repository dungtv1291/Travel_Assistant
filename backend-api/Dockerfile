# ---------------------------------------------------------------------------
# Stage 1 — deps: install production dependencies only
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
# Stage 2 — build: compile TypeScript
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3 — runner: lean production image
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only what the runtime needs
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY package*.json ./

# uploads must exist so the volume mount works
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/main"]
