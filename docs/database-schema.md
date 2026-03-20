# Database Schema

Tài liệu này mô tả schema database giai đoạn MVP cho backend app du lịch khách Hàn tại Việt Nam.

Nguyên tắc:
- PostgreSQL
- raw SQL
- naming theo `snake_case`
- API response map sang `camelCase`
- hỗ trợ đa ngôn ngữ ở mức thực dụng
- itinerary là core domain
- hotel / transport là dữ liệu nội bộ
- flight / weather là dữ liệu ngoài, chỉ cache

---

## 1. Quy ước chung

## 1.1 Naming
- table: `snake_case`
- column: `snake_case`
- primary key: `id`
- foreign key: `<entity>_id`
- time columns:
  - `created_at`
  - `updated_at`

## 1.2 ID strategy
Giai đoạn đầu dùng:
- `bigserial` cho bảng nghiệp vụ chính
- `varchar` cho booking code / itinerary public id nếu cần hiển thị

## 1.3 Timestamps
Tất cả bảng chính nên có:
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

## 1.4 Multi-language strategy
Với content do hệ thống quản lý, dùng cột riêng:
- `_ko`
- `_en`
- `_vi`

Ví dụ:
- `name_ko`
- `name_en`
- `name_vi`

Cách này phù hợp nhất với:
- raw SQL
- solo dev
- CMS nội bộ
- ít abstraction

---

## 2. Core user tables

## 2.1 `users`
Thông tin user cơ bản.

### Columns
- `id` bigint pk
- `email` varchar(255) not null unique
- `password_hash` varchar(255) not null
- `full_name` varchar(255) not null
- `avatar_url` varchar(500) null
- `language` varchar(10) not null default 'ko'
- `preferred_currency` varchar(10) not null default 'KRW'
- `dark_mode_enabled` boolean not null default false
- `push_notification_enabled` boolean not null default true
- `is_active` boolean not null default true
- `last_login_at` timestamptz null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Indexes
- unique index on `email`

---

## 2.2 `user_preferences`
Sở thích du lịch và profile mềm.

### Columns
- `id` bigint pk
- `user_id` bigint not null unique references `users(id)`
- `traveler_type` varchar(20) null
- `budget_level` varchar(20) null
- `pace` varchar(20) null
- `travel_styles` jsonb not null default '[]'
- `interest_keywords` jsonb not null default '[]'
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Notes
- `travel_styles`: ví dụ `["culture","food"]`
- `interest_keywords`: ví dụ `["photography","local food"]`

---

## 2.3 `user_refresh_tokens`
Quản lý refresh token.

### Columns
- `id` bigint pk
- `user_id` bigint not null references `users(id)`
- `token_hash` varchar(255) not null
- `expires_at` timestamptz not null
- `revoked_at` timestamptz null
- `created_at` timestamptz not null default now()

### Indexes
- index on `user_id`
- index on `expires_at`

---

## 3. Destination domain

## 3.1 `destinations`
Bảng điểm đến chính.

### Columns
- `id` bigint pk
- `slug` varchar(255) not null unique
- `code` varchar(20) null
- `name_ko` varchar(255) not null
- `name_en` varchar(255) not null
- `name_vi` varchar(255) not null
- `region_label_ko` varchar(255) null
- `region_label_en` varchar(255) null
- `region_label_vi` varchar(255) null
- `country_label_ko` varchar(255) null
- `country_label_en` varchar(255) null
- `country_label_vi` varchar(255) null
- `hero_image_url` varchar(500) null
- `rating` numeric(2,1) not null default 0
- `review_count` integer not null default 0
- `visit_count` integer not null default 0
- `match_percent` integer null
- `short_description_ko` text null
- `short_description_en` text null
- `short_description_vi` text null
- `overview_description_ko` text null
- `overview_description_en` text null
- `overview_description_vi` text null
- `best_season_label_ko` varchar(255) null
- `best_season_label_en` varchar(255) null
- `best_season_label_vi` varchar(255) null
- `average_temperature_c` integer null
- `language_label_ko` varchar(255) null
- `language_label_en` varchar(255) null
- `language_label_vi` varchar(255) null
- `currency_label_ko` varchar(255) null
- `currency_label_en` varchar(255) null
- `currency_label_vi` varchar(255) null
- `is_featured` boolean not null default false
- `is_active` boolean not null default true
- `sort_order` integer not null default 0
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Indexes
- unique index on `slug`
- index on `is_featured`
- index on `is_active`
- index on `sort_order`

---

## 3.2 `destination_badges`
Badge/tag gắn với destination.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `badge_type` varchar(50) null
- `sort_order` integer not null default 0

### Examples
- `고대 도시`
- `유네스코`
- `해변`

---

## 3.3 `destination_feature_tags`
Tags ở phần overview.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `sort_order` integer not null default 0

---

## 3.4 `destination_images`
Ảnh gallery nếu cần mở rộng.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `image_url` varchar(500) not null
- `sort_order` integer not null default 0

---

## 3.5 `destination_seasons`
Thông tin season blocks cho weather tab.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `season_key` varchar(50) not null
- `label_ko` varchar(100) not null
- `label_en` varchar(100) not null
- `label_vi` varchar(100) not null
- `months_label_ko` varchar(255) null
- `months_label_en` varchar(255) null
- `months_label_vi` varchar(255) null
- `note_ko` text null
- `note_en` text null
- `note_vi` text null
- `icon_key` varchar(100) null
- `sort_order` integer not null default 0

---

## 3.6 `destination_packing_items`
Travel packing list.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `icon_key` varchar(100) null
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `sort_order` integer not null default 0

---

## 3.7 `destination_tips`
Travel tips tab.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `order_no` integer not null
- `text_ko` text not null
- `text_en` text not null
- `text_vi` text not null
- `is_active` boolean not null default true

### Indexes
- index on `(destination_id, order_no)`

---

## 3.8 `destination_essential_apps`
Danh sách app hữu ích như Grab, Google Maps, Deepl.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `name` varchar(255) not null
- `subtitle` varchar(255) null
- `icon_url` varchar(500) null
- `external_url` varchar(500) null
- `sort_order` integer not null default 0
- `is_active` boolean not null default true

---

## 4. Places / Attractions domain

## 4.1 `places`
Danh lam thắng cảnh / point of interest.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `slug` varchar(255) not null unique
- `name_ko` varchar(255) not null
- `name_en` varchar(255) not null
- `name_vi` varchar(255) not null
- `category_label_ko` varchar(255) null
- `category_label_en` varchar(255) null
- `category_label_vi` varchar(255) null
- `short_description_ko` text null
- `short_description_en` text null
- `short_description_vi` text null
- `cover_image_url` varchar(500) null
- `rating` numeric(2,1) not null default 0
- `review_count` integer not null default 0
- `visit_duration_label_ko` varchar(100) null
- `visit_duration_label_en` varchar(100) null
- `visit_duration_label_vi` varchar(100) null
- `ticket_price_amount` integer null
- `ticket_price_currency` varchar(10) null default 'VND'
- `lat` numeric(10,7) null
- `lng` numeric(10,7) null
- `is_active` boolean not null default true
- `sort_order` integer not null default 0
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Indexes
- unique index on `slug`
- index on `destination_id`
- index on `is_active`

---

## 4.2 `place_tags`
Tags cho places.

### Columns
- `id` bigint pk
- `place_id` bigint not null references `places(id)`
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `sort_order` integer not null default 0

---

## 5. Hotel domain

## 5.1 `hotels`
Bảng hotel chính.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `slug` varchar(255) not null unique
- `name` varchar(255) not null
- `destination_label_ko` varchar(255) null
- `destination_label_en` varchar(255) null
- `destination_label_vi` varchar(255) null
- `address_full_ko` text null
- `address_full_en` text null
- `address_full_vi` text null
- `hotel_type_label_ko` varchar(100) null
- `hotel_type_label_en` varchar(100) null
- `hotel_type_label_vi` varchar(100) null
- `star_rating` integer not null default 0
- `rating` numeric(2,1) not null default 0
- `review_count` integer not null default 0
- `cover_image_url` varchar(500) null
- `short_description_ko` text null
- `short_description_en` text null
- `short_description_vi` text null
- `nightly_from_price` integer null
- `currency` varchar(10) not null default 'KRW'
- `check_in_time` varchar(20) null
- `check_out_time` varchar(20) null
- `cancellation_policy_label_ko` varchar(255) null
- `cancellation_policy_label_en` varchar(255) null
- `cancellation_policy_label_vi` varchar(255) null
- `pets_policy_label_ko` varchar(255) null
- `pets_policy_label_en` varchar(255) null
- `pets_policy_label_vi` varchar(255) null
- `smoking_policy_label_ko` varchar(255) null
- `smoking_policy_label_en` varchar(255) null
- `smoking_policy_label_vi` varchar(255) null
- `policy_notice_ko` text null
- `policy_notice_en` text null
- `policy_notice_vi` text null
- `is_recommended` boolean not null default false
- `is_active` boolean not null default true
- `sort_order` integer not null default 0
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Indexes
- unique index on `slug`
- index on `destination_id`
- index on `is_recommended`
- index on `is_active`

---

## 5.2 `hotel_badges`
Badge như:
- 럭셔리
- 편집자 추천
- 추천

### Columns
- `id` bigint pk
- `hotel_id` bigint not null references `hotels(id)`
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `badge_type` varchar(50) null
- `sort_order` integer not null default 0

---

## 5.3 `hotel_images`
Ảnh hotel.

### Columns
- `id` bigint pk
- `hotel_id` bigint not null references `hotels(id)`
- `image_url` varchar(500) not null
- `sort_order` integer not null default 0

---

## 5.4 `hotel_amenities`
Tiện ích hotel.

### Columns
- `id` bigint pk
- `hotel_id` bigint not null references `hotels(id)`
- `amenity_key` varchar(100) not null
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `icon_key` varchar(100) null
- `sort_order` integer not null default 0

---

## 5.5 `hotel_room_types`
Biến thể phòng.

### Columns
- `id` bigint pk
- `hotel_id` bigint not null references `hotels(id)`
- `name_ko` varchar(255) not null
- `name_en` varchar(255) not null
- `name_vi` varchar(255) not null
- `bed_label_ko` varchar(255) null
- `bed_label_en` varchar(255) null
- `bed_label_vi` varchar(255) null
- `room_size_m2` integer null
- `max_guests` integer null
- `cover_image_url` varchar(500) null
- `nightly_price` integer not null
- `currency` varchar(10) not null default 'KRW'
- `is_default_selected` boolean not null default false
- `is_active` boolean not null default true
- `sort_order` integer not null default 0
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Notes
Giai đoạn đầu giữ `nightly_price` ngay trên room type để MVP đơn giản.
Sau này có thể tách bảng pricing rule theo ngày.

---

## 5.6 `hotel_room_badges`
Badge/feature của room:
- 개인 수영장 포함
- 가든뷰
- 야외 샤워
- 조식 포함

### Columns
- `id` bigint pk
- `room_type_id` bigint not null references `hotel_room_types(id)`
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `badge_group` varchar(50) null
- `sort_order` integer not null default 0

---

## 5.7 `hotel_reviews`
Review hotel.

### Columns
- `id` bigint pk
- `hotel_id` bigint not null references `hotels(id)`
- `reviewer_name` varchar(255) not null
- `reviewer_initial` varchar(10) null
- `rating` numeric(2,1) not null
- `review_date` date not null
- `content_ko` text null
- `content_en` text null
- `content_vi` text null
- `is_active` boolean not null default true
- `created_at` timestamptz not null default now()

### Notes
Có thể chỉ nhập một ngôn ngữ hiển thị trong giai đoạn đầu, nhưng schema cho phép mở rộng.

---

## 6. Transport domain

## 6.1 `transport_services`
Dịch vụ vận chuyển / thuê xe.

### Columns
- `id` bigint pk
- `destination_id` bigint null references `destinations(id)`
- `slug` varchar(255) not null unique
- `name_ko` varchar(255) not null
- `name_en` varchar(255) not null
- `name_vi` varchar(255) not null
- `service_type` varchar(50) not null
- `vehicle_model` varchar(255) null
- `transmission_label_ko` varchar(100) null
- `transmission_label_en` varchar(100) null
- `transmission_label_vi` varchar(100) null
- `capacity` integer null
- `luggage_count` integer null
- `with_driver` boolean not null default false
- `driver_mode_label_ko` varchar(255) null
- `driver_mode_label_en` varchar(255) null
- `driver_mode_label_vi` varchar(255) null
- `cover_image_url` varchar(500) null
- `rating` numeric(2,1) not null default 0
- `review_count` integer not null default 0
- `description_ko` text null
- `description_en` text null
- `description_vi` text null
- `insurance_notice_ko` text null
- `insurance_notice_en` text null
- `insurance_notice_vi` text null
- `is_popular` boolean not null default false
- `is_active` boolean not null default true
- `sort_order` integer not null default 0
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Allowed `service_type`
- `airport_pickup`
- `private_car`
- `self_drive`
- `scooter`
- `day_trip`

---

## 6.2 `transport_badges`
Feature badge cho transport:
- 에어컨
- 기사 포함
- 명패 서비스
- 유연한 일정

### Columns
- `id` bigint pk
- `transport_service_id` bigint not null references `transport_services(id)`
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `sort_order` integer not null default 0

---

## 6.3 `transport_duration_options`
Option thời lượng / số ngày / giá.

### Columns
- `id` bigint pk
- `transport_service_id` bigint not null references `transport_services(id)`
- `value` integer not null
- `label_ko` varchar(100) not null
- `label_en` varchar(100) not null
- `label_vi` varchar(100) not null
- `price_amount` integer not null
- `currency` varchar(10) not null default 'KRW'
- `sort_order` integer not null default 0

### Examples
- 1일
- 2일
- 3일
- 5일

---

## 6.4 `transport_pickup_options`
Pickup choice:
- 공항 직접 픽업
- 호텔 픽업

### Columns
- `id` bigint pk
- `transport_service_id` bigint not null references `transport_services(id)`
- `option_key` varchar(100) not null
- `label_ko` varchar(255) not null
- `label_en` varchar(255) not null
- `label_vi` varchar(255) not null
- `description_ko` varchar(255) null
- `description_en` varchar(255) null
- `description_vi` varchar(255) null
- `sort_order` integer not null default 0
- `is_active` boolean not null default true

---

## 7. Favorites domain

## 7.1 `favorites`
Favorite chung cho destination / hotel / place.

### Columns
- `id` bigint pk
- `user_id` bigint not null references `users(id)`
- `target_type` varchar(50) not null
- `target_id` bigint not null
- `created_at` timestamptz not null default now()

### Allowed `target_type`
- `destination`
- `hotel`
- `place`

### Indexes
- unique index on `(user_id, target_type, target_id)`

---

## 8. Itinerary domain

## 8.1 `itineraries`
Master itinerary.

### Columns
- `id` bigint pk
- `public_id` varchar(100) not null unique
- `user_id` bigint not null references `users(id)`
- `destination_id` bigint not null references `destinations(id)`
- `title` varchar(255) not null
- `start_date` date null
- `nights` integer not null
- `days` integer not null
- `traveler_type` varchar(20) not null
- `budget_level` varchar(20) not null
- `pace` varchar(20) not null
- `travel_styles` jsonb not null default '[]'
- `interests` jsonb not null default '[]'
- `language` varchar(10) not null
- `currency` varchar(10) not null
- `total_activities` integer not null default 0
- `estimated_cost_amount` integer not null default 0
- `estimated_cost_currency` varchar(10) not null default 'KRW'
- `budget_label` varchar(255) null
- `generated_by` varchar(20) not null default 'ai'
- `is_saved` boolean not null default false
- `cover_image_url` varchar(500) null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Indexes
- unique index on `public_id`
- index on `user_id`
- index on `destination_id`
- index on `is_saved`

---

## 8.2 `itinerary_days`
Thông tin từng ngày.

### Columns
- `id` bigint pk
- `itinerary_id` bigint not null references `itineraries(id)`
- `day_number` integer not null
- `date_value` date null
- `date_label` varchar(50) null
- `day_label` varchar(50) null
- `title` varchar(255) not null
- `weather_condition_code` varchar(50) null
- `weather_condition_label` varchar(255) null
- `weather_temperature_c` integer null
- `weather_note` varchar(255) null
- `weather_icon_key` varchar(100) null
- `estimated_cost_amount` integer not null default 0
- `estimated_cost_currency` varchar(10) not null default 'VND'
- `estimated_cost_display` varchar(100) null
- `activity_count` integer not null default 0
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Indexes
- unique index on `(itinerary_id, day_number)`

---

## 8.3 `itinerary_timeline_items`
Timeline items theo ngày.

### Columns
- `id` bigint pk
- `itinerary_day_id` bigint not null references `itinerary_days(id)`
- `item_type` varchar(50) not null
- `start_time` varchar(10) not null
- `duration_minutes` integer not null default 0
- `duration_label` varchar(100) null
- `title` varchar(255) not null
- `description` text null
- `location_name` varchar(255) null
- `location_address` varchar(500) null
- `location_lat` numeric(10,7) null
- `location_lng` numeric(10,7) null
- `estimated_cost_amount` integer null
- `estimated_cost_currency` varchar(10) null
- `estimated_cost_display` varchar(100) null
- `tip_text` varchar(500) null
- `booking_required` boolean not null default false
- `booking_url` varchar(500) null
- `accent_color` varchar(50) null
- `icon_key` varchar(100) null
- `image_url` varchar(500) null
- `sort_order` integer not null default 0
- `created_at` timestamptz not null default now()

### Allowed `item_type`
- `food`
- `transport`
- `beach`
- `attraction`
- `shopping`
- `hotel`
- `cafe`
- `nightlife`
- `wellness`
- `photo`

### Indexes
- index on `itinerary_day_id`
- index on `(itinerary_day_id, sort_order)`

---

## 8.4 `itinerary_item_tags`
Tag cho timeline item nếu cần.

### Columns
- `id` bigint pk
- `timeline_item_id` bigint not null references `itinerary_timeline_items(id)`
- `label` varchar(255) not null
- `sort_order` integer not null default 0

---

## 8.5 `itinerary_warnings`
Warning section theo ngày.

### Columns
- `id` bigint pk
- `itinerary_day_id` bigint not null references `itinerary_days(id)`
- `warning_type` varchar(50) not null
- `title` varchar(255) null
- `text` varchar(500) not null
- `count_value` integer null
- `sort_order` integer not null default 0

### Allowed `warning_type`
- `weather`
- `booking_required`
- `crowded`
- `timing`
- `transport`
- `general`

---

## 8.6 `itinerary_booking_needed_items`
Danh sách item trong box "사전 예약 필요".

### Columns
- `id` bigint pk
- `itinerary_day_id` bigint not null references `itinerary_days(id)`
- `label` varchar(255) not null
- `sort_order` integer not null default 0

---

## 8.7 `itinerary_smart_tips`
Danh sách smart tips.

### Columns
- `id` bigint pk
- `itinerary_day_id` bigint not null references `itinerary_days(id)`
- `order_no` integer not null
- `text` varchar(500) not null
- `icon_key` varchar(100) null

### Indexes
- index on `(itinerary_day_id, order_no)`

---

## 8.8 `ai_generation_logs`
Log đầu vào/đầu ra AI.

### Columns
- `id` bigint pk
- `user_id` bigint not null references `users(id)`
- `feature_type` varchar(50) not null
- `request_payload` jsonb not null
- `response_payload` jsonb null
- `status` varchar(50) not null
- `provider_name` varchar(50) not null default 'openai'
- `error_message` text null
- `created_at` timestamptz not null default now()

### Allowed `feature_type`
- `itinerary_generate`
- `itinerary_regenerate`
- `flight_recommend`

---

## 9. Booking domain

## 9.1 `bookings`
Master booking table chung cho hotel / transport.

### Columns
- `id` bigint pk
- `booking_code` varchar(50) not null unique
- `user_id` bigint not null references `users(id)`
- `booking_type` varchar(20) not null
- `status` varchar(20) not null
- `title` varchar(255) not null
- `subtitle` varchar(255) null
- `start_date` date null
- `end_date` date null
- `nights_or_usage_label` varchar(100) null
- `guest_info_label` varchar(100) null
- `total_amount` integer not null
- `currency` varchar(10) not null
- `confirmation_sent` boolean not null default false
- `note` text null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Allowed `booking_type`
- `hotel`
- `transport`

### Allowed `status`
- `pending`
- `confirmed`
- `cancelled`

### Indexes
- unique index on `booking_code`
- index on `user_id`
- index on `booking_type`
- index on `status`

---

## 9.2 `hotel_booking_details`
Detail riêng cho hotel booking.

### Columns
- `id` bigint pk
- `booking_id` bigint not null unique references `bookings(id)`
- `hotel_id` bigint not null references `hotels(id)`
- `room_type_id` bigint not null references `hotel_room_types(id)`
- `guest_full_name` varchar(255) not null
- `guest_email` varchar(255) not null
- `adults` integer not null default 1
- `children` integer not null default 0
- `special_request` text null
- `room_price` integer not null
- `tax_amount` integer not null default 0
- `check_in_date` date not null
- `check_out_date` date not null
- `nights` integer not null

---

## 9.3 `transport_booking_details`
Detail riêng cho transport booking.

### Columns
- `id` bigint pk
- `booking_id` bigint not null unique references `bookings(id)`
- `transport_service_id` bigint not null references `transport_services(id)`
- `pickup_option_id` bigint null references `transport_pickup_options(id)`
- `duration_option_id` bigint null references `transport_duration_options(id)`
- `guest_full_name` varchar(255) not null
- `guest_email` varchar(255) not null
- `usage_date` date not null
- `base_amount` integer not null
- `tax_amount` integer not null default 0
- `note` text null

---

## 10. Flight domain (cache / external data)

## 10.1 `flight_search_cache`
Cache search result từ provider.

### Columns
- `id` bigint pk
- `cache_key` varchar(255) not null unique
- `search_id` varchar(100) not null
- `request_payload` jsonb not null
- `response_payload` jsonb not null
- `expires_at` timestamptz not null
- `created_at` timestamptz not null default now()

### Indexes
- unique index on `cache_key`
- index on `search_id`
- index on `expires_at`

---

## 10.2 `flight_search_logs`
Log search flight.

### Columns
- `id` bigint pk
- `user_id` bigint null references `users(id)`
- `search_id` varchar(100) not null
- `trip_type` varchar(20) not null
- `origin_code` varchar(20) not null
- `destination_code` varchar(20) not null
- `departure_date` date not null
- `return_date` date null
- `seat_class` varchar(20) not null
- `passenger_count` integer not null
- `flexible_days` integer not null default 0
- `provider_name` varchar(50) not null default 'travelpayouts'
- `created_at` timestamptz not null default now()

---

## 10.3 `affiliate_click_logs`
Log click affiliate.

### Columns
- `id` bigint pk
- `user_id` bigint null references `users(id)`
- `target_type` varchar(50) not null
- `target_id` varchar(100) null
- `provider_name` varchar(50) not null
- `affiliate_url` text not null
- `context_payload` jsonb null
- `clicked_at` timestamptz not null default now()

### Allowed `target_type`
- `flight`
- `hotel`
- `activity`

---

## 11. Weather domain (cache)

## 11.1 `weather_cache`
Cache weather summary cho destination.

### Columns
- `id` bigint pk
- `destination_id` bigint not null references `destinations(id)`
- `cache_key` varchar(255) not null unique
- `request_payload` jsonb not null
- `response_payload` jsonb not null
- `expires_at` timestamptz not null
- `created_at` timestamptz not null default now()

### Indexes
- unique index on `cache_key`
- index on `destination_id`
- index on `expires_at`

---

## 12. Static / settings domain

## 12.1 `app_settings`
App meta / support / legal URLs.

### Columns
- `id` bigint pk
- `setting_key` varchar(100) not null unique
- `setting_value` text not null
- `description` varchar(255) null
- `updated_at` timestamptz not null default now()

### Example keys
- `app_version`
- `support_email`
- `support_hours_ko`
- `support_hours_en`
- `support_hours_vi`
- `privacy_policy_url`
- `terms_of_service_url`

---

## 13. Suggested implementation order

## Phase 1 tables
- `users`
- `user_preferences`
- `user_refresh_tokens`
- `destinations`
- `destination_badges`
- `destination_feature_tags`
- `places`
- `destination_tips`
- `destination_essential_apps`

## Phase 2 tables
- `hotels`
- `hotel_badges`
- `hotel_images`
- `hotel_amenities`
- `hotel_room_types`
- `hotel_room_badges`
- `hotel_reviews`

## Phase 3 tables
- `transport_services`
- `transport_badges`
- `transport_duration_options`
- `transport_pickup_options`

## Phase 4 tables
- `itineraries`
- `itinerary_days`
- `itinerary_timeline_items`
- `itinerary_item_tags`
- `itinerary_warnings`
- `itinerary_booking_needed_items`
- `itinerary_smart_tips`
- `ai_generation_logs`

## Phase 5 tables
- `bookings`
- `hotel_booking_details`
- `transport_booking_details`
- `favorites`

## Phase 6 tables
- `flight_search_cache`
- `flight_search_logs`
- `affiliate_click_logs`
- `weather_cache`
- `app_settings`

---

## 14. Notes on normalization

### 14.1 Prices
Trong DB luôn lưu:
- `amount` là số nguyên
- `currency` là code

Không lưu string đã format kiểu:
- `300만원`
- `600K đ`

### 14.2 Reviews
UI hiện chỉ cần:
- rating
- review_count
- vài review item

Không cần phức tạp hóa sentiment hoặc media review giai đoạn đầu.

### 14.3 Bookings
UI nhìn như booking đã confirmed ngay.
Nhưng DB vẫn phải support lifecycle:
- pending
- confirmed
- cancelled

### 14.4 Itinerary
Itinerary là dữ liệu sinh bởi AI nhưng cần lưu chuẩn như domain nội bộ.
Không chỉ lưu nguyên blob JSON.

Phải lưu:
- header
- day
- timeline item
- warnings
- smart tips

để sau này:
- query list nhanh
- update từng phần
- regenerate 1 ngày
- analytics usage

---

## 15. Summary

Schema MVP chốt theo hướng:

- users + preferences
- destinations + places + tips + weather meta
- hotels + rooms + amenities + policies + reviews
- transports + options + pricing
- itineraries + days + timeline items + warnings + smart tips
- bookings + hotel detail + transport detail
- favorites
- weather cache
- flight cache/log
- affiliate click log
- app settings
