-- =============================================================================
-- Migration 008: itinerary domain
-- Follows: docs/database-schema.md §8
-- Tables: itineraries, itinerary_days, itinerary_timeline_items,
--         itinerary_item_tags, itinerary_warnings,
--         itinerary_booking_needed_items, itinerary_smart_tips,
--         ai_generation_logs
-- =============================================================================

-- ---------------------------------------------------------------------------
-- itineraries — master record
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS itineraries (
  id                        bigserial      PRIMARY KEY,
  public_id                 varchar(100)   NOT NULL,
  user_id                   bigint         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  destination_id            bigint         NOT NULL REFERENCES destinations (id),
  title                     varchar(255)   NOT NULL,
  start_date                date           NULL,
  nights                    integer        NOT NULL,
  days                      integer        NOT NULL,
  traveler_type             varchar(20)    NOT NULL,
  budget_level              varchar(20)    NOT NULL,
  pace                      varchar(20)    NOT NULL,
  travel_styles             jsonb          NOT NULL DEFAULT '[]',
  interests                 jsonb          NOT NULL DEFAULT '[]',
  language                  varchar(10)    NOT NULL DEFAULT 'ko',
  currency                  varchar(10)    NOT NULL DEFAULT 'KRW',
  total_activities          integer        NOT NULL DEFAULT 0,
  estimated_cost_amount     integer        NOT NULL DEFAULT 0,
  estimated_cost_currency   varchar(10)    NOT NULL DEFAULT 'KRW',
  estimated_cost_display    varchar(100)   NULL,
  budget_label              varchar(255)   NULL,
  generated_by              varchar(20)    NOT NULL DEFAULT 'ai',
  is_saved                  boolean        NOT NULL DEFAULT false,
  cover_image_url           varchar(500)   NULL,
  created_at                timestamptz    NOT NULL DEFAULT now(),
  updated_at                timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT uq_itineraries_public_id UNIQUE (public_id)
);

CREATE INDEX IF NOT EXISTS idx_itineraries_public_id    ON itineraries (public_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id      ON itineraries (user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_destination  ON itineraries (destination_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_is_saved     ON itineraries (is_saved) WHERE is_saved = true;
CREATE INDEX IF NOT EXISTS idx_itineraries_user_saved   ON itineraries (user_id, is_saved);

-- ---------------------------------------------------------------------------
-- itinerary_days — one row per calendar day in the trip
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS itinerary_days (
  id                         bigserial     PRIMARY KEY,
  itinerary_id               bigint        NOT NULL REFERENCES itineraries (id) ON DELETE CASCADE,
  day_number                 integer       NOT NULL,
  date_value                 date          NULL,
  date_label                 varchar(50)   NULL,     -- e.g. "3.18"
  day_label                  varchar(50)   NULL,     -- e.g. "DAY 1"
  title                      varchar(255)  NOT NULL,
  weather_condition_code     varchar(50)   NULL,
  weather_condition_label    varchar(255)  NULL,
  weather_temperature_c      integer       NULL,
  weather_note               varchar(255)  NULL,
  weather_icon_key           varchar(100)  NULL,
  estimated_cost_amount      integer       NOT NULL DEFAULT 0,
  estimated_cost_currency    varchar(10)   NOT NULL DEFAULT 'VND',
  estimated_cost_display     varchar(100)  NULL,
  activity_count             integer       NOT NULL DEFAULT 0,
  created_at                 timestamptz   NOT NULL DEFAULT now(),
  updated_at                 timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT uq_itinerary_days_number UNIQUE (itinerary_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_itinerary_days_itinerary ON itinerary_days (itinerary_id);

-- ---------------------------------------------------------------------------
-- itinerary_timeline_items — ordered activity cards per day
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS itinerary_timeline_items (
  id                       bigserial     PRIMARY KEY,
  itinerary_day_id         bigint        NOT NULL REFERENCES itinerary_days (id) ON DELETE CASCADE,
  item_public_id           varchar(100)  NOT NULL,  -- e.g. "item_d1_01"
  item_type                varchar(50)   NOT NULL,  -- food|transport|beach|attraction|...
  start_time               varchar(10)   NOT NULL,  -- HH:MM e.g. "07:30"
  duration_minutes         integer       NOT NULL DEFAULT 0,
  duration_label           varchar(100)  NULL,
  title                    varchar(255)  NOT NULL,
  description              text          NULL,
  location_name            varchar(255)  NULL,
  location_address         varchar(500)  NULL,
  location_lat             numeric(10,7) NULL,
  location_lng             numeric(10,7) NULL,
  estimated_cost_amount    integer       NULL,
  estimated_cost_currency  varchar(10)   NULL,
  estimated_cost_display   varchar(100)  NULL,
  tip_text                 varchar(500)  NULL,
  booking_required         boolean       NOT NULL DEFAULT false,
  booking_url              varchar(500)  NULL,
  accent_color             varchar(50)   NULL,
  icon_key                 varchar(100)  NULL,
  image_url                varchar(500)  NULL,
  sort_order               integer       NOT NULL DEFAULT 0,
  created_at               timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT uq_itinerary_item_public_id UNIQUE (itinerary_day_id, item_public_id)
);

CREATE INDEX IF NOT EXISTS idx_timeline_items_day      ON itinerary_timeline_items (itinerary_day_id);
CREATE INDEX IF NOT EXISTS idx_timeline_items_day_sort ON itinerary_timeline_items (itinerary_day_id, sort_order);

-- ---------------------------------------------------------------------------
-- itinerary_item_tags — string tags displayed on timeline cards
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS itinerary_item_tags (
  id               bigserial    PRIMARY KEY,
  timeline_item_id bigint       NOT NULL REFERENCES itinerary_timeline_items (id) ON DELETE CASCADE,
  label            varchar(255) NOT NULL,
  sort_order       integer      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_item_tags_item ON itinerary_item_tags (timeline_item_id);

-- ---------------------------------------------------------------------------
-- itinerary_warnings — per-day warning boxes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS itinerary_warnings (
  id               bigserial    PRIMARY KEY,
  itinerary_day_id bigint       NOT NULL REFERENCES itinerary_days (id) ON DELETE CASCADE,
  warning_type     varchar(50)  NOT NULL,  -- weather|booking_required|crowded|timing|transport|general
  title            varchar(255) NULL,
  text             varchar(500) NOT NULL,
  count_value      integer      NULL,
  sort_order       integer      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_warnings_day ON itinerary_warnings (itinerary_day_id);

-- ---------------------------------------------------------------------------
-- itinerary_booking_needed_items — labels inside "사전 예약 필요" box
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS itinerary_booking_needed_items (
  id               bigserial    PRIMARY KEY,
  itinerary_day_id bigint       NOT NULL REFERENCES itinerary_days (id) ON DELETE CASCADE,
  label            varchar(255) NOT NULL,
  sort_order       integer      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_booking_needed_day ON itinerary_booking_needed_items (itinerary_day_id);

-- ---------------------------------------------------------------------------
-- itinerary_smart_tips — smart tip cards shown at bottom of each day
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS itinerary_smart_tips (
  id               bigserial    PRIMARY KEY,
  itinerary_day_id bigint       NOT NULL REFERENCES itinerary_days (id) ON DELETE CASCADE,
  order_no         integer      NOT NULL DEFAULT 1,
  text             varchar(500) NOT NULL,
  icon_key         varchar(100) NULL
);

CREATE INDEX IF NOT EXISTS idx_smart_tips_day ON itinerary_smart_tips (itinerary_day_id, order_no);

-- ---------------------------------------------------------------------------
-- ai_generation_logs — audit trail for every AI call
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id               bigserial    PRIMARY KEY,
  user_id          bigint       NOT NULL REFERENCES users (id),
  feature_type     varchar(50)  NOT NULL,   -- itinerary_generate|itinerary_regenerate|flight_recommend
  request_payload  jsonb        NOT NULL,
  response_payload jsonb        NULL,
  status           varchar(50)  NOT NULL,   -- success|error
  provider_name    varchar(50)  NOT NULL DEFAULT 'openai',
  model_name       varchar(100) NULL,
  tokens_used      integer      NULL,
  error_message    text         NULL,
  created_at       timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user  ON ai_generation_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type  ON ai_generation_logs (feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_time  ON ai_generation_logs (created_at DESC);
