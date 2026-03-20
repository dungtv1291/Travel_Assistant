# Travel Assistant — Backend API

NestJS REST API for the Travel Assistant mobile app.
Stack: NestJS 11 · PostgreSQL 16 · Redis 7 · pg (raw SQL) · Docker

---

## Prerequisites

| Tool | Min version |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| Docker Desktop | 4.x |

---

## Local development (recommended — Docker)

### 1. Create your env file

```bash
cp .env.example .env
```

Edit `.env` if you want to change ports or secrets. The defaults work out of
the box with the docker-compose setup.

### 2. Start all services

```bash
docker compose up --build
```

This starts:
- `travel_postgres` — PostgreSQL 16 on port **5432**
- `travel_redis`    — Redis 7 on port **6379**
- `travel_backend`  — NestJS with `nest start --watch` on port **3000**

The backend container mounts `./src` so any file save triggers an automatic
restart (hot-reload via `nest start --watch`).

### 3. Run database migrations

In a separate terminal once `travel_postgres` is healthy:

```bash
npm run db:migrate
```

Or, to run it inside the container:

```bash
docker compose exec backend npm run db:migrate
```

### 4. Verify the service

```bash
curl http://localhost:3000/api/v1/health
# {"success":true,"data":{"status":"ok","timestamp":"..."}}
```

---

## Local development (without Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL and Redis locally

Use your preferred method (Homebrew, system packages, or a local Docker
network). Update `.env` with the correct host/credentials.

### 3. Run migrations

```bash
npm run db:migrate
```

### 4. Start the dev server

```bash
npm run start:dev
```

---

## Useful commands

| Command | Purpose |
|---|---|
| `npm run start:dev` | Hot-reload dev server (ts-node) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm run db:migrate` | Apply pending SQL migrations |
| `npm run lint` | ESLint with auto-fix |
| `npm test` | Jest unit tests |

---

## Project layout

```
backend-api/
  src/
    main.ts               # Bootstrap — global prefix, guards, filters, pipes
    app.module.ts         # Root module

    common/
      filters/            # AllExceptionsFilter → standard error envelope
      interceptors/       # TransformInterceptor → standard success envelope
      utils/              # case-mapper (snake_case → camelCase)

    config/
      app.config.ts       # Typed config factory (reads process.env)
      env.ts              # Canonical env variable name constants

    database/
      database.module.ts  # @Global() pg Pool module
      database.service.ts # query / queryOne / queryMany / transaction / ping
      transaction.ts      # withTransaction() helper

    modules/
      health/             # GET /api/v1/health

  sql/
    migrations/           # Raw SQL migration files (001_initial_schema.sql …)
    seeds/                # Seed scripts for local dev

  uploads/                # Local file storage (avatars, images)
    avatars/
    destinations/
    hotels/
    rooms/
    transports/

  scripts/
    migrate.js            # Node script — runs pending SQL migration files

  Dockerfile              # Multi-stage production image
  Dockerfile.dev          # Dev image — npm run start:dev (hot-reload)
  docker-compose.yml      # postgres + redis + backend (dev)
  .env.example            # All supported env vars with defaults
```

---

## API conventions

- Base prefix: `/api/v1`
- Success envelope: `{ "success": true, "data": { … } }`
- Error envelope: `{ "success": false, "error": { "code": "…", "message": "…", "details": [] } }`
- All response keys: `camelCase`
- All DB columns: `snake_case`
- Amounts are plain integers (no string formatting in backend)

---

## Environment variables

See [.env.example](.env.example) for the full list with documentation.

Critical variables that **must** be set before production deploy:

- `JWT_ACCESS_SECRET` — min 32 chars, randomly generated
- `JWT_REFRESH_SECRET` — min 32 chars, randomly generated
- `DB_PASSWORD`
- `REDIS_PASSWORD` (if Redis auth is enabled)
