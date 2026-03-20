
# Backend Plan

## 1. Mục tiêu

Backend phục vụ app du lịch cho khách Hàn tại Việt Nam, bám sát UI hiện tại và ưu tiên MVP thực dụng.

Backend giai đoạn đầu tập trung vào 6 nhóm chức năng:

1. quản lý người dùng và preferences
2. quản lý nội dung du lịch
3. quản lý khách sạn / phòng / xe / booking request
4. lấy dữ liệu thời tiết
5. lấy dữ liệu chuyến bay để AI phân tích
6. tạo và lưu lịch trình AI

Backend **không** cố làm OTA hoàn chỉnh ngay từ đầu.

---

## 2. Nguyên tắc kiến trúc

### 2.1 Không dùng ORM
Dự án không dùng Prisma, TypeORM, Sequelize hay ORM khác.

Chỉ dùng:
- PostgreSQL tự host
- thư viện kết nối DB như `pg`
- SQL thuần
- migration SQL tự quản lý

### 2.2 Backend là nguồn dữ liệu duy nhất cho mobile app
Mobile app không gọi trực tiếp:
- OpenAI
- WeatherAPI
- Travelpayouts / Aviasales

Tất cả đi qua backend.

### 2.3 Dữ liệu nội bộ và dữ liệu ngoài phải tách rõ
- dữ liệu nội bộ: destination, hotel, room, transport, tips, itinerary, booking request
- dữ liệu ngoài: flight, weather

### 2.4 AI chỉ làm reasoning
AI không phải nguồn sự thật cho dữ liệu fact.

AI chỉ dùng để:
- sắp xếp
- đề xuất
- giải thích
- tối ưu lịch trình
- gợi ý lựa chọn chuyến bay

Dữ liệu fact phải đến từ:
- DB của hệ thống
- weather API
- flight API

### 2.5 Bám sát UI hiện tại
Thiết kế backend phải hỗ trợ trực tiếp các màn đã có:
- home
- explore destinations
- destination detail
- hotel list/detail/booking
- transport list/detail/booking
- flight search
- AI planner
- trips
- bookings
- profile/settings

---

## 3. Stack kỹ thuật

### 3.1 Core stack
- Framework: NestJS
- Language: TypeScript
- Database: PostgreSQL
- DB client: `pg`
- Cache: Redis
- Upload: local server storage
- Validation: class-validator / class-transformer
- Auth: JWT + refresh token
- Docker dev: backend + postgres + redis

### 3.2 Không dùng
- ORM
- object storage bên thứ 3 ở giai đoạn đầu
- elasticsearch ở giai đoạn đầu
- queue / message broker ở giai đoạn đầu
- booking engine OTA thật ở giai đoạn đầu

---

## 4. Nguồn dữ liệu ngoài

### 4.1 Flights
Nguồn: Travelpayouts / Aviasales

Dùng cho:
- airport / city autocomplete
- flight pricing data
- cheap flight deals
- search result data cho AI phân tích

Không lưu lâu dài toàn bộ raw data flight.
Chỉ cache ngắn hạn.

### 4.2 Weather
Nguồn: WeatherAPI

Dùng cho:
- current weather
- forecast
- weather summary cho destination
- input cho itinerary planner

Không lưu raw data dài hạn.
Chỉ cache ngắn hạn và chuẩn hóa thành weather summary.

### 4.3 AI
Nguồn: OpenAI

Dùng cho:
- itinerary generation
- itinerary refinement
- flight recommendation reasoning

Không để OpenAI trả text tự do khi render UI.
Bắt trả về JSON có cấu trúc.

---

## 5. Dữ liệu nội bộ hệ thống

Các dữ liệu sau sẽ do CMS và backend quản lý:

- destinations
- destination images
- attractions / places
- travel tips
- weather meta / season info / packing info
- hotels
- hotel images
- hotel room types
- hotel amenities
- hotel policies
- hotel reviews summary
- transport services
- transport features
- transport price options
- booking requests
- itineraries
- favorites
- user profile / preferences

---

## 6. Mô hình nghiệp vụ giai đoạn đầu

### 6.1 Destinations
App cần hiển thị:
- danh sách điểm đến nổi bật
- detail destination
- tabs overview / places / hotels / weather / travel tips
- hotel gợi ý theo destination
- AI planner theo destination

### 6.2 Hotels
Hệ thống chưa tích hợp OTA hotel realtime.

Giai đoạn đầu:
- quản lý hotel bằng CMS
- quản lý room variant bằng CMS
- giá phòng nhập tay theo rule hoặc theo ngày
- booking theo request / confirmation flow đơn giản

### 6.3 Transport
Hệ thống chưa có đối tác API cố định.

Giai đoạn đầu:
- nhập tay dịch vụ transport trong CMS
- hỗ trợ các loại:
  - airport pickup
  - private car
  - self-drive
  - scooter rental
  - day trip transport
- booking theo request / confirmation flow đơn giản

### 6.4 Flights
Flight không tự quản lý trong DB.
Backend chỉ:
- gọi provider
- cache
- chuẩn hóa dữ liệu
- gửi kết quả cho AI recommendation

### 6.5 Itinerary
Đây là core feature.

Backend cần:
- nhận input từ planner UI
- gom dữ liệu destination + weather + attractions + transport heuristics
- gọi OpenAI
- parse JSON output
- lưu itinerary
- trả đúng shape để render timeline UI

### 6.6 Booking
Booking giai đoạn đầu là:
- booking request
- confirmed booking summary
- confirmation code
- booking list view

Chưa phải booking engine full:
- chưa thanh toán thật
- chưa inventory sync realtime
- chưa cancel/refund automation

---

## 7. Cấu trúc module backend

### 7.1 Core modules
- auth
- users
- settings
- files
- health

### 7.2 Travel content modules
- destinations
- hotels
- transports
- flights
- weather
- itineraries
- bookings
- favorites

### 7.3 Tích hợp ngoài
- integrations/openai
- integrations/weatherapi
- integrations/travelpayouts

---

## 8. Cấu trúc thư mục dự kiến

```text
backend-api/
  src/
    main.ts
    app.module.ts

    common/
      constants/
      decorators/
      dto/
      filters/
      guards/
      interceptors/
      utils/

    config/
      app.config.ts
      env.ts

    database/
      database.module.ts
      database.service.ts
      transaction.ts

    integrations/
      openai/
      travelpayouts/
      weatherapi/

    modules/
      auth/
      users/
      settings/
      files/
      health/
      destinations/
      hotels/
      transports/
      flights/
      weather/
      itineraries/
      bookings/
      favorites/

  sql/
    migrations/
    seeds/

  uploads/

  Dockerfile
  docker-compose.yml
  .env.example
  package.json
````

---

## 9. Database strategy

### 9.1 DB ownership

DB hoàn toàn do hệ thống tự quản lý.
Không dùng dịch vụ ngoài để quản lý schema.

### 9.2 Naming convention

* table: `snake_case`
* column: `snake_case`
* API response: `camelCase`

### 9.3 Translation strategy

Giai đoạn đầu dùng cột riêng cho nội dung đa ngôn ngữ nếu cần:

Ví dụ:

* `name_ko`
* `name_en`
* `name_vi`

Điều này phù hợp hơn với SQL thuần và solo dev.

### 9.4 Migration strategy

Dùng migration SQL thủ công:

```text
sql/migrations/
  001_init.sql
  002_users.sql
  003_destinations.sql
  ...
```

Có bảng `schema_migrations` để tracking version đã apply.

---

## 10. Cache strategy

### 10.1 Cache bằng Redis

Redis chạy cùng môi trường dev Docker.

### 10.2 Những thứ phải cache

* weather forecast
* flight search result
* flight deals
* itinerary generation result theo input hash
* destination detail summary nếu cần

### 10.3 TTL gợi ý

* current weather: 30 phút
* forecast weather: 1–3 giờ
* flight search result: 15–60 phút
* itinerary result: 1–6 giờ nếu regenerate cùng request
* featured destination / hotel list: 10–30 phút nếu cần

---

## 11. File upload strategy

### 11.1 Lưu local server

Ảnh được lưu ngay trên server.

### 11.2 Cấu trúc folder

```text
uploads/
  destinations/
  hotels/
  rooms/
  transports/
  avatars/
```

### 11.3 Quy tắc

* đổi tên file ngẫu nhiên
* DB chỉ lưu relative path
* resize/compress trước khi lưu nếu cần
* backup thư mục upload định kỳ

---

## 12. Auth strategy

### 12.1 Giai đoạn đầu

* email/password
* JWT access token
* refresh token
* profile cơ bản

### 12.2 Chưa cần ngay

* social login thật
* SSO
* enterprise auth flow

### 12.3 User preferences

Backend phải lưu được:

* language
* preferred currency
* notification settings
* dark mode preference nếu muốn sync
* travel interests
* traveler type
* budget level
* pace

---

## 13. Core UI flows mà backend phải support

### 13.1 Home

Backend cần support:

* featured destinations
* recommended hotels
* flight deals
* transport shortcuts
* upcoming booking
* AI planner CTA context

### 13.2 Destination detail

Backend cần support:

* overview summary
* places list
* recommended hotels
* weather tab
* travel tips tab
* essential apps / packing / season info

### 13.3 Hotel flow

Backend cần support:

* hotel list
* hotel detail
* room options
* amenities
* policies
* reviews summary
* booking summary
* booking confirmation

### 13.4 Transport flow

Backend cần support:

* transport list
* transport detail
* duration options
* pickup options
* booking summary
* booking confirmation

### 13.5 Flight flow

Backend cần support:

* airport/destination selection
* trip type
* date range
* seat class
* passenger count
* flexible dates
* AI recommendation result

### 13.6 Itinerary flow

Backend cần support:

* planner input
* loading
* itinerary result
* daily summary
* timeline activities
* warnings
* smart tips
* save itinerary
* trips list

### 13.7 Bookings

Backend cần support:

* booking list
* booking counters
* booking detail summary
* confirmation code

---

## 14. Itinerary planner strategy

### 14.1 Input factors

* destination
* dates / nights
* traveler type
* budget level
* travel style
* interests
* pace
* preferred language
* preferred currency

### 14.2 Data sources for reasoning

* destination meta
* attractions
* weather forecast
* travel tips
* transport heuristics
* optionally selected hotel area
* optionally flight arrival / departure timing

### 14.3 Output rules

OpenAI phải trả JSON có cấu trúc, không phải free text.

Output phải render được:

* itinerary summary header
* day tabs
* day header
* weather line
* estimated cost
* timeline items
* warnings
* booking-needed section
* smart tips section

### 14.4 Persistence

Itinerary đã generate có thể:

* lưu draft
* lưu saved itinerary
* hiển thị trong trips list
* regenerate later

---

## 15. Booking strategy

### 15.1 Hotel booking

Giai đoạn đầu:

* select room
* select stay option
* guest info
* price breakdown
* special request
* confirm booking
* confirmation summary

### 15.2 Transport booking

Giai đoạn đầu:

* select vehicle/service
* select duration or pickup option
* guest info
* price breakdown
* confirm booking
* confirmation summary

### 15.3 Booking statuses

Giai đoạn đầu nên có:

* pending
* confirmed
* cancelled

UI hiện đang thiên về confirmed.
Nhưng backend phải support lifecycle đầy đủ.

---

## 16. Affiliate strategy giai đoạn đầu

### 16.1 Flights

* user search flight in app
* backend fetches provider data
* AI recommends
* user clicks affiliate booking link
* backend logs click event

### 16.2 Hotels

Giai đoạn đầu chưa phụ thuộc affiliate hotel để render core flow.
Nếu thêm affiliate sau này:

* hotel card có booking deeplink
* backend log click
* UI vẫn ưu tiên data nội bộ

### 16.3 Transport

Chưa làm affiliate.
Ưu tiên CMS + booking request / local partner flow.

---

## 17. Những gì chưa làm ở giai đoạn đầu

* hotel OTA realtime sync
* payment gateway production-grade
* inventory sync realtime
* refund / cancellation automation
* social login thật
* admin CMS đầy đủ role matrix
* elasticsearch
* analytics pipeline phức tạp
* background job phức tạp
* notification automation phức tạp

---

## 18. Roadmap kỹ thuật đề xuất

### Phase 1

* backend skeleton
* docker compose
* postgres
* redis
* health module
* database module
* auth
* users
* destinations

### Phase 2

* attractions
* destination detail APIs
* hotels
* hotel rooms
* hotel booking request/confirm flow
* transports
* transport booking flow

### Phase 3

* weather integration
* itinerary generation
* itinerary save/list/detail
* favorites

### Phase 4

* flight integration
* flight AI recommendation
* affiliate click logging
* booking list summary

### Phase 5

* CMS/admin screens
* content management improvements
* pricing rules refinement
* cache tuning
* analytics/logging refinement

---

## 19. Source of truth

### 19.1 UI source

UI hiện tại trong `mobile-app/` là nguồn tham chiếu cho:

* screen flow
* visible fields
* expected response shapes

### 19.2 Docs source

Thư mục `docs/` là nguồn sự thật cho:

* backend contract
* schema
* data normalization rules
* system decisions

### 19.3 Code generation rule

Copilot / Claude khi code backend phải:

1. đọc docs trước
2. đọc UI sau
3. không suy diễn kiến trúc chỉ từ UI

---

## 20. Quyết định chốt

Dự án backend sẽ đi theo hướng:

* NestJS
* PostgreSQL
* `pg`
* raw SQL
* local uploads
* Redis cache
* WeatherAPI
* Travelpayouts / Aviasales
* OpenAI
* booking request / confirmation flow đơn giản
* itinerary là core feature số 1
* hotel và transport là dữ liệu nội bộ qua CMS


