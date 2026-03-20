-- =============================================================================
-- Migration 002: users table
-- Follows: docs/database-schema.md §2.1
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                          bigserial     PRIMARY KEY,
  email                       varchar(255)  NOT NULL,
  password_hash               varchar(255)  NOT NULL,
  full_name                   varchar(255)  NOT NULL,
  avatar_url                  varchar(500)  NULL,
  language                    varchar(10)   NOT NULL DEFAULT 'ko',
  preferred_currency          varchar(10)   NOT NULL DEFAULT 'KRW',
  dark_mode_enabled           boolean       NOT NULL DEFAULT false,
  push_notification_enabled   boolean       NOT NULL DEFAULT true,
  is_active                   boolean       NOT NULL DEFAULT true,
  last_login_at               timestamptz   NULL,
  created_at                  timestamptz   NOT NULL DEFAULT now(),
  updated_at                  timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
