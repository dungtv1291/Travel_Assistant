-- =============================================================================
-- Migration 009: booking domain
-- Follows: docs/database-schema.md §9
-- Depends on: 002_users.sql, 006_hotels.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- bookings — master record shared by hotel + transport bookings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bookings (
  id                      bigserial     PRIMARY KEY,
  booking_code            varchar(50)   NOT NULL,
  user_id                 bigint        NOT NULL,
  booking_type            varchar(20)   NOT NULL,     -- 'hotel' | 'transport'
  status                  varchar(20)   NOT NULL DEFAULT 'confirmed',
  title                   varchar(255)  NOT NULL,
  subtitle                varchar(255)  NULL,
  start_date              date          NULL,
  end_date                date          NULL,
  nights_or_usage_label   varchar(100)  NULL,
  guest_info_label        varchar(100)  NULL,
  total_amount            integer       NOT NULL DEFAULT 0,
  currency                varchar(10)   NOT NULL DEFAULT 'KRW',
  confirmation_sent       boolean       NOT NULL DEFAULT false,
  note                    text          NULL,
  created_at              timestamptz   NOT NULL DEFAULT now(),
  updated_at              timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT uq_bookings_code UNIQUE (booking_code),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT chk_bookings_type CHECK (booking_type IN ('hotel', 'transport')),
  CONSTRAINT chk_bookings_status CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id       ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type  ON bookings (booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_status        ON bookings (status);

-- ---------------------------------------------------------------------------
-- hotel_booking_details — 1-to-1 with bookings for hotel type
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotel_booking_details (
  id              bigserial     PRIMARY KEY,
  booking_id      bigint        NOT NULL,
  hotel_id        bigint        NOT NULL,
  room_type_id    bigint        NOT NULL,
  guest_full_name varchar(255)  NOT NULL,
  guest_email     varchar(255)  NOT NULL,
  adults          integer       NOT NULL DEFAULT 1,
  children        integer       NOT NULL DEFAULT 0,
  special_request text          NULL,
  room_price      integer       NOT NULL,
  tax_amount      integer       NOT NULL DEFAULT 0,
  check_in_date   date          NOT NULL,
  check_out_date  date          NOT NULL,
  nights          integer       NOT NULL,

  CONSTRAINT uq_hotel_booking_details_booking UNIQUE (booking_id),
  CONSTRAINT fk_hbd_booking   FOREIGN KEY (booking_id)   REFERENCES bookings (id) ON DELETE CASCADE,
  CONSTRAINT fk_hbd_hotel     FOREIGN KEY (hotel_id)     REFERENCES hotels (id),
  CONSTRAINT fk_hbd_room_type FOREIGN KEY (room_type_id) REFERENCES hotel_room_types (id)
);

CREATE INDEX IF NOT EXISTS idx_hbd_booking_id   ON hotel_booking_details (booking_id);
CREATE INDEX IF NOT EXISTS idx_hbd_hotel_id     ON hotel_booking_details (hotel_id);
CREATE INDEX IF NOT EXISTS idx_hbd_room_type_id ON hotel_booking_details (room_type_id);
