#!/usr/bin/env ts-node
/**
 * Database migration runner.
 *
 * Reads all *.sql files from sql/migrations/ in lexicographic order, checks
 * which have already been applied via the schema_migrations table, and runs
 * each pending migration inside its own transaction.
 *
 * Usage:
 *   npm run db:migrate
 *
 * Environment variables (all optional, fall back to dev defaults):
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

import { Client, QueryResult } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Load .env from project root so the script works when run on the host machine
// (outside Docker) where process.env is not pre-populated.
// ---------------------------------------------------------------------------
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'sql', 'migrations');

// ---------------------------------------------------------------------------
// Bootstrap — ensure the tracking table exists before running any migration.
// This is intentionally outside the migration files themselves so the runner
// stays self-contained.
// ---------------------------------------------------------------------------
async function ensureMigrationsTable(client: Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         bigserial    PRIMARY KEY,
      filename   varchar(255) NOT NULL,
      applied_at timestamptz  NOT NULL DEFAULT now(),
      CONSTRAINT uq_schema_migrations_filename UNIQUE (filename)
    )
  `);
}

async function getAppliedMigrations(client: Client): Promise<Set<string>> {
  const result: QueryResult<{ filename: string }> = await client.query(
    'SELECT filename FROM schema_migrations ORDER BY filename ASC',
  );
  return new Set(result.rows.map((r) => r.filename));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'travel_assistant',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
  });

  await client.connect();
  console.log('[migrate] Connected to database.');

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort(); // lexicographic — relies on numeric prefix e.g. 001_, 002_

    if (files.length === 0) {
      console.log('[migrate] No migration files found.');
      return;
    }

    let ran = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[migrate] Already applied: ${file}`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Each migration runs in its own transaction so a failure rolls back
      // only that file and leaves previously applied migrations intact.
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`[migrate] Applied:  ${file}`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[migrate] FAILED on ${file}: ${message}`);
        process.exit(1);
      }
    }

    if (ran === 0) {
      console.log('[migrate] All migrations are up to date.');
    } else {
      console.log(`[migrate] Done. Applied ${ran} migration(s).`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[migrate] Unexpected error:', message);
  process.exit(1);
});
