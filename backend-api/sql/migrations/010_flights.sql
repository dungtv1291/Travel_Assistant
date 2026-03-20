-- 010_flights.sql
-- Flight domain: search cache, search logs, affiliate click logs.
-- Flight data is never stored long-term; only cache + audit rows live here.

-- ---------------------------------------------------------------------------
-- flight_search_cache
-- Short-lived store of provider search results keyed by a deterministic hash
-- of the search parameters.  TTL is enforced by expires_at (backend checks
-- before returning) and a daily cleanup job removes stale rows.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flight_search_cache (
  id                bigserial     PRIMARY KEY,
  cache_key         varchar(255)  NOT NULL UNIQUE,
  search_id         varchar(100)  NOT NULL,
  request_payload   jsonb         NOT NULL,
  response_payload  jsonb         NOT NULL,
  expires_at        timestamptz   NOT NULL,
  created_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fsc_search_id  ON flight_search_cache(search_id);
CREATE INDEX IF NOT EXISTS idx_fsc_expires_at ON flight_search_cache(expires_at);

-- ---------------------------------------------------------------------------
-- flight_search_logs
-- One row per search request — used for analytics and to surface recent
-- searches.  user_id is nullable (unauthenticated searches are still logged).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flight_search_logs (
  id                bigserial     PRIMARY KEY,
  user_id           bigint        REFERENCES users(id) ON DELETE SET NULL,
  search_id         varchar(100)  NOT NULL,
  trip_type         varchar(20)   NOT NULL,
  origin_code       varchar(20)   NOT NULL,
  destination_code  varchar(20)   NOT NULL,
  departure_date    date          NOT NULL,
  return_date       date          NULL,
  seat_class        varchar(20)   NOT NULL,
  passenger_count   integer       NOT NULL,
  flexible_days     integer       NOT NULL DEFAULT 0,
  provider_name     varchar(50)   NOT NULL DEFAULT 'travelpayouts',
  created_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fsl_user_id   ON flight_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fsl_search_id ON flight_search_logs(search_id);

-- ---------------------------------------------------------------------------
-- affiliate_click_logs
-- Tracks outbound affiliate link clicks for revenue attribution.
-- target_type: 'flight' | 'hotel' | 'activity'
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS affiliate_click_logs (
  id               bigserial     PRIMARY KEY,
  user_id          bigint        REFERENCES users(id) ON DELETE SET NULL,
  target_type      varchar(50)   NOT NULL,
  target_id        varchar(100)  NULL,
  provider_name    varchar(50)   NOT NULL,
  affiliate_url    text          NOT NULL,
  context_payload  jsonb         NULL,
  clicked_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acl_user_id     ON affiliate_click_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_acl_target_type ON affiliate_click_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_acl_clicked_at  ON affiliate_click_logs(clicked_at);

