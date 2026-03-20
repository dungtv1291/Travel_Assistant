-- =============================================================================
-- Migration 006: hotel domain
-- Follows: docs/database-schema.md §5
-- Depends on: 005_destinations.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS hotels (
  id                              bigserial     PRIMARY KEY,
  destination_id                  bigint        NOT NULL,
  slug                            varchar(255)  NOT NULL,
  name                            varchar(255)  NOT NULL,
  destination_label_ko            varchar(255)  NULL,
  destination_label_en            varchar(255)  NULL,
  destination_label_vi            varchar(255)  NULL,
  address_full_ko                 text          NULL,
  address_full_en                 text          NULL,
  address_full_vi                 text          NULL,
  hotel_type_label_ko             varchar(100)  NULL,
  hotel_type_label_en             varchar(100)  NULL,
  hotel_type_label_vi             varchar(100)  NULL,
  star_rating                     integer       NOT NULL DEFAULT 0,
  rating                          numeric(2,1)  NOT NULL DEFAULT 0,
  review_count                    integer       NOT NULL DEFAULT 0,
  cover_image_url                 varchar(500)  NULL,
  short_description_ko            text          NULL,
  short_description_en            text          NULL,
  short_description_vi            text          NULL,
  nightly_from_price              integer       NULL,
  currency                        varchar(10)   NOT NULL DEFAULT 'KRW',
  check_in_time                   varchar(20)   NULL,
  check_out_time                  varchar(20)   NULL,
  cancellation_policy_label_ko    varchar(255)  NULL,
  cancellation_policy_label_en    varchar(255)  NULL,
  cancellation_policy_label_vi    varchar(255)  NULL,
  pets_policy_label_ko            varchar(255)  NULL,
  pets_policy_label_en            varchar(255)  NULL,
  pets_policy_label_vi            varchar(255)  NULL,
  smoking_policy_label_ko         varchar(255)  NULL,
  smoking_policy_label_en         varchar(255)  NULL,
  smoking_policy_label_vi         varchar(255)  NULL,
  policy_notice_ko                text          NULL,
  policy_notice_en                text          NULL,
  policy_notice_vi                text          NULL,
  is_recommended                  boolean       NOT NULL DEFAULT false,
  is_active                       boolean       NOT NULL DEFAULT true,
  sort_order                      integer       NOT NULL DEFAULT 0,
  created_at                      timestamptz   NOT NULL DEFAULT now(),
  updated_at                      timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT uq_hotels_slug UNIQUE (slug),
  CONSTRAINT fk_hotels_destination FOREIGN KEY (destination_id) REFERENCES destinations (id)
);

CREATE INDEX IF NOT EXISTS idx_hotels_destination_id  ON hotels (destination_id);
CREATE INDEX IF NOT EXISTS idx_hotels_is_recommended  ON hotels (is_recommended);
CREATE INDEX IF NOT EXISTS idx_hotels_is_active       ON hotels (is_active);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotel_badges (
  id          bigserial    PRIMARY KEY,
  hotel_id    bigint       NOT NULL,
  label_ko    varchar(255) NOT NULL,
  label_en    varchar(255) NOT NULL,
  label_vi    varchar(255) NOT NULL,
  badge_type  varchar(50)  NULL,
  sort_order  integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_hotel_badges_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id)
);

CREATE INDEX IF NOT EXISTS idx_hotel_badges_hotel_id ON hotel_badges (hotel_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotel_images (
  id          bigserial    PRIMARY KEY,
  hotel_id    bigint       NOT NULL,
  image_url   varchar(500) NOT NULL,
  sort_order  integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_hotel_images_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id)
);

CREATE INDEX IF NOT EXISTS idx_hotel_images_hotel_id ON hotel_images (hotel_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotel_amenities (
  id          bigserial    PRIMARY KEY,
  hotel_id    bigint       NOT NULL,
  amenity_key varchar(100) NOT NULL,
  label_ko    varchar(255) NOT NULL,
  label_en    varchar(255) NOT NULL,
  label_vi    varchar(255) NOT NULL,
  icon_key    varchar(100) NULL,
  sort_order  integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_hotel_amenities_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id)
);

CREATE INDEX IF NOT EXISTS idx_hotel_amenities_hotel_id ON hotel_amenities (hotel_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotel_room_types (
  id                    bigserial    PRIMARY KEY,
  hotel_id              bigint       NOT NULL,
  name_ko               varchar(255) NOT NULL,
  name_en               varchar(255) NOT NULL,
  name_vi               varchar(255) NOT NULL,
  bed_label_ko          varchar(255) NULL,
  bed_label_en          varchar(255) NULL,
  bed_label_vi          varchar(255) NULL,
  room_size_m2          integer      NULL,
  max_guests            integer      NULL,
  cover_image_url       varchar(500) NULL,
  nightly_price         integer      NOT NULL,
  currency              varchar(10)  NOT NULL DEFAULT 'KRW',
  is_default_selected   boolean      NOT NULL DEFAULT false,
  is_active             boolean      NOT NULL DEFAULT true,
  sort_order            integer      NOT NULL DEFAULT 0,
  created_at            timestamptz  NOT NULL DEFAULT now(),
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT fk_room_types_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id)
);

CREATE INDEX IF NOT EXISTS idx_room_types_hotel_id ON hotel_room_types (hotel_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotel_room_badges (
  id            bigserial    PRIMARY KEY,
  room_type_id  bigint       NOT NULL,
  label_ko      varchar(255) NOT NULL,
  label_en      varchar(255) NOT NULL,
  label_vi      varchar(255) NOT NULL,
  badge_group   varchar(50)  NULL,
  sort_order    integer      NOT NULL DEFAULT 0,
  CONSTRAINT fk_room_badges_room_type FOREIGN KEY (room_type_id) REFERENCES hotel_room_types (id)
);

CREATE INDEX IF NOT EXISTS idx_room_badges_room_type_id ON hotel_room_badges (room_type_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotel_reviews (
  id                  bigserial     PRIMARY KEY,
  hotel_id            bigint        NOT NULL,
  reviewer_name       varchar(255)  NOT NULL,
  reviewer_initial    varchar(10)   NULL,
  rating              numeric(2,1)  NOT NULL,
  review_date         date          NOT NULL,
  content_ko          text          NULL,
  content_en          text          NULL,
  content_vi          text          NULL,
  is_active           boolean       NOT NULL DEFAULT true,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT fk_hotel_reviews_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id)
);

CREATE INDEX IF NOT EXISTS idx_hotel_reviews_hotel_id ON hotel_reviews (hotel_id);
