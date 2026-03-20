-- =============================================================================
-- Migration 004: user_refresh_tokens table
-- Follows: docs/database-schema.md §2.3
-- Depends on: 002_users.sql
-- =============================================================================
-- token_hash stores a bcrypt hash of the raw refresh token. The raw token is
-- never persisted. Revocation is recorded by setting revoked_at rather than
-- deleting the row so that audit history is preserved.
-- Rows with expires_at < now() and revoked_at IS NOT NULL can be purged by a
-- background job without affecting correctness.
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_refresh_tokens (
  id          bigserial    PRIMARY KEY,
  user_id     bigint       NOT NULL,
  token_hash  varchar(255) NOT NULL,
  expires_at  timestamptz  NOT NULL,
  revoked_at  timestamptz  NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON user_refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON user_refresh_tokens (expires_at);
