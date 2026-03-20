-- =============================================================================
-- Migration 001: Database initialisation
-- Travel Assistant — PostgreSQL raw SQL
-- =============================================================================
-- Enables PostgreSQL extensions required by the application.
-- pg_trgm provides trigram-based operators used for fast ILIKE text search on
-- destination names, hotel names, and place names.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
