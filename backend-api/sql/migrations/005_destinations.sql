-- =============================================================================
-- Migration 005: destination domain
-- Follows: docs/database-schema.md §3 + §4
-- =============================================================================

-- ---------------------------------------------------------------------------
-- destinations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destinations (
  id                          bigserial     PRIMARY KEY,
  slug                        varchar(255)  NOT NULL,
  code                        varchar(20)   NULL,
  name_ko                     varchar(255)  NOT NULL,
  name_en                     varchar(255)  NOT NULL,
  name_vi                     varchar(255)  NOT NULL,
  region_label_ko             varchar(255)  NULL,
  region_label_en             varchar(255)  NULL,
  region_label_vi             varchar(255)  NULL,
  country_label_ko            varchar(255)  NULL,
  country_label_en            varchar(255)  NULL,
  country_label_vi            varchar(255)  NULL,
  hero_image_url              varchar(500)  NULL,
  rating                      numeric(2,1)  NOT NULL DEFAULT 0,
  review_count                integer       NOT NULL DEFAULT 0,
  visit_count                 integer       NOT NULL DEFAULT 0,
  match_percent               integer       NULL,
  short_description_ko        text          NULL,
  short_description_en        text          NULL,
  short_description_vi        text          NULL,
  overview_description_ko     text          NULL,
  overview_description_en     text          NULL,
  overview_description_vi     text          NULL,
  best_season_label_ko        varchar(255)  NULL,
  best_season_label_en        varchar(255)  NULL,
  best_season_label_vi        varchar(255)  NULL,
  average_temperature_c       integer       NULL,
  language_label_ko           varchar(255)  NULL,
  language_label_en           varchar(255)  NULL,
  language_label_vi           varchar(255)  NULL,
  currency_label_ko           varchar(255)  NULL,
  currency_label_en           varchar(255)  NULL,
  currency_label_vi           varchar(255)  NULL,
  is_featured                 boolean       NOT NULL DEFAULT false,
  is_active                   boolean       NOT NULL DEFAULT true,
  sort_order                  integer       NOT NULL DEFAULT 0,
  created_at                  timestamptz   NOT NULL DEFAULT now(),
  updated_at                  timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT uq_destinations_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_destinations_slug        ON destinations (slug);
CREATE INDEX IF NOT EXISTS idx_destinations_is_featured ON destinations (is_featured);
CREATE INDEX IF NOT EXISTS idx_destinations_is_active   ON destinations (is_active);
CREATE INDEX IF NOT EXISTS idx_destinations_sort_order  ON destinations (sort_order);
-- pg_trgm trigram indexes for ILIKE search on name columns
CREATE INDEX IF NOT EXISTS idx_destinations_name_ko_trgm ON destinations USING gin (name_ko gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_destinations_name_en_trgm ON destinations USING gin (name_en gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- destination_badges
-- Category and label tags shown on destination cards and detail header.
-- badge_type = 'category' → used for list filtering via ?category=
-- badge_type = NULL       → general tag shown in detail and featured cards
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destination_badges (
  id              bigserial    PRIMARY KEY,
  destination_id  bigint       NOT NULL,
  label_ko        varchar(255) NOT NULL,
  label_en        varchar(255) NOT NULL,
  label_vi        varchar(255) NOT NULL,
  badge_type      varchar(50)  NULL,
  sort_order      integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_dest_badges_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_dest_badges_destination_id ON destination_badges (destination_id);

-- ---------------------------------------------------------------------------
-- destination_feature_tags
-- Short keyword tags shown in the overview tab (e.g. "역사", "문화", "음식").
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destination_feature_tags (
  id              bigserial    PRIMARY KEY,
  destination_id  bigint       NOT NULL,
  label_ko        varchar(255) NOT NULL,
  label_en        varchar(255) NOT NULL,
  label_vi        varchar(255) NOT NULL,
  sort_order      integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_dest_feature_tags_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_dest_feature_tags_dest_id ON destination_feature_tags (destination_id);

-- ---------------------------------------------------------------------------
-- destination_images
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destination_images (
  id              bigserial    PRIMARY KEY,
  destination_id  bigint       NOT NULL,
  image_url       varchar(500) NOT NULL,
  sort_order      integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_dest_images_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_dest_images_destination_id ON destination_images (destination_id);

-- ---------------------------------------------------------------------------
-- destination_seasons
-- Season blocks rendered in the weather tab.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destination_seasons (
  id                  bigserial    PRIMARY KEY,
  destination_id      bigint       NOT NULL,
  season_key          varchar(50)  NOT NULL,
  label_ko            varchar(100) NOT NULL,
  label_en            varchar(100) NOT NULL,
  label_vi            varchar(100) NOT NULL,
  months_label_ko     varchar(255) NULL,
  months_label_en     varchar(255) NULL,
  months_label_vi     varchar(255) NULL,
  note_ko             text         NULL,
  note_en             text         NULL,
  note_vi             text         NULL,
  icon_key            varchar(100) NULL,
  sort_order          integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_dest_seasons_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_dest_seasons_destination_id ON destination_seasons (destination_id);

-- ---------------------------------------------------------------------------
-- destination_packing_items
-- Packing checklist shown in the weather tab.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destination_packing_items (
  id              bigserial    PRIMARY KEY,
  destination_id  bigint       NOT NULL,
  icon_key        varchar(100) NULL,
  label_ko        varchar(255) NOT NULL,
  label_en        varchar(255) NOT NULL,
  label_vi        varchar(255) NOT NULL,
  sort_order      integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_dest_packing_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_dest_packing_destination_id ON destination_packing_items (destination_id);

-- ---------------------------------------------------------------------------
-- destination_tips
-- Travel tips shown in the travel tips tab.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destination_tips (
  id              bigserial    PRIMARY KEY,
  destination_id  bigint       NOT NULL,
  order_no        integer      NOT NULL,
  text_ko         text         NOT NULL,
  text_en         text         NOT NULL,
  text_vi         text         NOT NULL,
  is_active       boolean      NOT NULL DEFAULT true,
  CONSTRAINT fk_dest_tips_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_dest_tips_dest_order ON destination_tips (destination_id, order_no);

-- ---------------------------------------------------------------------------
-- destination_essential_apps
-- App recommendations shown in the travel tips tab (e.g. Grab, Google Maps).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destination_essential_apps (
  id              bigserial    PRIMARY KEY,
  destination_id  bigint       NOT NULL,
  name            varchar(255) NOT NULL,
  subtitle        varchar(255) NULL,
  icon_url        varchar(500) NULL,
  external_url    varchar(500) NULL,
  sort_order      integer      NOT NULL DEFAULT 0,
  is_active       boolean      NOT NULL DEFAULT true,
  CONSTRAINT fk_dest_apps_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_dest_apps_destination_id ON destination_essential_apps (destination_id);

-- ---------------------------------------------------------------------------
-- places  (attractions / POIs)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS places (
  id                          bigserial     PRIMARY KEY,
  destination_id              bigint        NOT NULL,
  slug                        varchar(255)  NOT NULL,
  name_ko                     varchar(255)  NOT NULL,
  name_en                     varchar(255)  NOT NULL,
  name_vi                     varchar(255)  NOT NULL,
  category_label_ko           varchar(255)  NULL,
  category_label_en           varchar(255)  NULL,
  category_label_vi           varchar(255)  NULL,
  short_description_ko        text          NULL,
  short_description_en        text          NULL,
  short_description_vi        text          NULL,
  cover_image_url             varchar(500)  NULL,
  rating                      numeric(2,1)  NOT NULL DEFAULT 0,
  review_count                integer       NOT NULL DEFAULT 0,
  visit_duration_label_ko     varchar(100)  NULL,
  visit_duration_label_en     varchar(100)  NULL,
  visit_duration_label_vi     varchar(100)  NULL,
  ticket_price_amount         integer       NULL,
  ticket_price_currency       varchar(10)   NULL DEFAULT 'VND',
  lat                         numeric(10,7) NULL,
  lng                         numeric(10,7) NULL,
  is_active                   boolean       NOT NULL DEFAULT true,
  sort_order                  integer       NOT NULL DEFAULT 0,
  created_at                  timestamptz   NOT NULL DEFAULT now(),
  updated_at                  timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT uq_places_slug UNIQUE (slug),
  CONSTRAINT fk_places_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_places_destination_id ON places (destination_id);
CREATE INDEX IF NOT EXISTS idx_places_is_active       ON places (is_active);

-- ---------------------------------------------------------------------------
-- place_tags
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS place_tags (
  id          bigserial    PRIMARY KEY,
  place_id    bigint       NOT NULL,
  label_ko    varchar(255) NOT NULL,
  label_en    varchar(255) NOT NULL,
  label_vi    varchar(255) NOT NULL,
  sort_order  integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_place_tags_place FOREIGN KEY (place_id) REFERENCES places (id)
);

CREATE INDEX IF NOT EXISTS idx_place_tags_place_id ON place_tags (place_id);
