-- =============================================================================
-- Migration 003: user_preferences table
-- Follows: docs/database-schema.md §2.2
-- Depends on: 002_users.sql
-- =============================================================================
-- travel_styles and interest_keywords are stored as jsonb arrays, e.g.:
--   travel_styles:      ["culture", "food"]
--   interest_keywords:  ["photography", "local food"]
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id                  bigserial   PRIMARY KEY,
  user_id             bigint      NOT NULL,
  traveler_type       varchar(20) NULL,
  budget_level        varchar(20) NULL,
  pace                varchar(20) NULL,
  travel_styles       jsonb       NOT NULL DEFAULT '[]',
  interest_keywords   jsonb       NOT NULL DEFAULT '[]',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_preferences_user_id UNIQUE (user_id),
  CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users (id)
);
