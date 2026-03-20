-- =============================================================================
-- Migration 007: favorites
-- Follows: docs/database-schema.md §6
-- Depends on: 002_users.sql
-- =============================================================================
-- Polymorphic favorites: target_type = 'destination' | 'hotel' | 'transport'
-- target_id references the PK of the corresponding table.
-- No FK constraint on target_id because it is polymorphic.
-- =============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id          bigserial    PRIMARY KEY,
  user_id     bigint       NOT NULL,
  target_type varchar(50)  NOT NULL,
  target_id   bigint       NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT uq_favorites_user_target UNIQUE (user_id, target_type, target_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id            ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_target_type   ON favorites (user_id, target_type);
