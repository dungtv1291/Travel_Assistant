Đây là nội dung file thứ tư:

## `docs/api-contract.md`

````md id="wbs8aq"
# API Contract

Tài liệu này mô tả contract API giai đoạn MVP cho backend của app du lịch khách Hàn tại Việt Nam.

Nguyên tắc:
- response JSON dùng `camelCase`
- backend dùng raw SQL + `pg`
- toàn bộ mobile app chỉ gọi backend
- không gọi trực tiếp provider ngoài từ mobile
- tất cả amount phải trả về dạng số, không hardcode format UI
- mọi list response nên có cấu trúc ổn định để frontend dễ map

---

## 1. Base conventions

### 1.1 Base URL
```text
/api/v1
````

### 1.2 Auth

Dùng JWT Bearer token cho các API yêu cầu đăng nhập.

Header:

```http
Authorization: Bearer <access_token>
```

### 1.3 Standard success response

Không bắt buộc mọi endpoint phải bọc `data`, nhưng nên ưu tiên cấu trúc thống nhất:

```json
{
  "success": true,
  "data": {}
}
```

### 1.4 Standard list response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10
    }
  }
}
```

### 1.5 Standard error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```

### 1.6 Common enums

#### Language

* `ko`
* `en`
* `vi`

#### Currency

* `KRW`
* `VND`
* `USD`

#### Traveler type

* `solo`
* `couple`
* `family`
* `friends`

#### Pace

* `relaxed`
* `balanced`
* `active`

#### Budget level

* `budget`
* `medium`
* `luxury`

#### Booking type

* `hotel`
* `transport`

#### Booking status

* `pending`
* `confirmed`
* `cancelled`

---

## 2. Auth APIs

## 2.1 Register

**POST** `/auth/register`

### Request

```json
{
  "email": "kim.travel@gmail.com",
  "password": "StrongPassword123",
  "fullName": "Kim Minji",
  "language": "ko"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "kim.travel@gmail.com",
      "fullName": "Kim Minji",
      "avatarUrl": null,
      "language": "ko"
    },
    "tokens": {
      "accessToken": "jwt_access",
      "refreshToken": "jwt_refresh"
    }
  }
}
```

---

## 2.2 Login

**POST** `/auth/login`

### Request

```json
{
  "email": "kim.travel@gmail.com",
  "password": "StrongPassword123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "kim.travel@gmail.com",
      "fullName": "Kim Minji",
      "avatarUrl": "/uploads/avatars/user-1.jpg",
      "language": "ko"
    },
    "tokens": {
      "accessToken": "jwt_access",
      "refreshToken": "jwt_refresh"
    }
  }
}
```

---

## 2.3 Refresh token

**POST** `/auth/refresh`

### Request

```json
{
  "refreshToken": "jwt_refresh"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## 2.4 Logout

**POST** `/auth/logout`

### Request

```json
{
  "refreshToken": "jwt_refresh"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 2.5 Current user

**GET** `/auth/me`

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "kim.travel@gmail.com",
    "fullName": "Kim Minji",
    "avatarUrl": "/uploads/avatars/user-1.jpg",
    "language": "ko",
    "preferredCurrency": "KRW"
  }
}
```

---

## 3. User / Profile / Preferences APIs

## 3.1 Get profile

**GET** `/users/profile`

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "Kim Minji",
    "email": "kim.travel@gmail.com",
    "avatarUrl": "/uploads/avatars/user-1.jpg",
    "savedTripsCount": 5,
    "bookingsCount": 3,
    "favoritesCount": 2,
    "travelStyles": ["culture", "food"],
    "interestKeywords": ["photography", "local food", "history"]
  }
}
```

---

## 3.2 Update profile

**PATCH** `/users/profile`

### Request

```json
{
  "fullName": "Kim Minji",
  "avatarUrl": "/uploads/avatars/user-1-new.jpg"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "Kim Minji",
    "avatarUrl": "/uploads/avatars/user-1-new.jpg"
  }
}
```

---

## 3.3 Get preferences

**GET** `/users/preferences`

### Response

```json
{
  "success": true,
  "data": {
    "language": "ko",
    "preferredCurrency": "KRW",
    "darkModeEnabled": false,
    "pushNotificationEnabled": true,
    "travelerType": "couple",
    "budgetLevel": "medium",
    "pace": "balanced"
  }
}
```

---

## 3.4 Update preferences

**PATCH** `/users/preferences`

### Request

```json
{
  "language": "en",
  "preferredCurrency": "USD",
  "darkModeEnabled": true,
  "pushNotificationEnabled": false
}
```

### Response

```json
{
  "success": true,
  "data": {
    "language": "en",
    "preferredCurrency": "USD",
    "darkModeEnabled": true,
    "pushNotificationEnabled": false
  }
}
```

---

## 4. Home APIs

## 4.1 Home aggregate

**GET** `/home`

### Response

```json
{
  "success": true,
  "data": {
    "userSummary": {
      "fullName": "Kim Minji",
      "avatarUrl": "/uploads/avatars/user-1.jpg"
    },
    "upcomingBooking": {
      "id": 101,
      "bookingType": "hotel",
      "title": "The Nam Hai Resort",
      "subtitle": "2026-04-15 → 2026-04-18",
      "status": "confirmed",
      "confirmationCode": "VTHABC123"
    },
    "featuredDestinations": [],
    "recommendedHotels": [],
    "flightDeals": [],
    "transportHighlights": []
  }
}
```

---

## 5. Destination APIs

## 5.1 Featured destinations

**GET** `/destinations/featured`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "slug": "hoi-an",
        "name": "호이안",
        "regionLabel": "베트남 중부",
        "countryLabel": "Vietnam",
        "rating": 4.8,
        "reviewCount": 12400,
        "heroImage": "/uploads/destinations/hoi-an-cover.jpg",
        "matchPercent": 32,
        "isFavorite": true,
        "tags": ["고대 도시", "유네스코"]
      }
    ]
  }
}
```

---

## 5.2 Destination list

**GET** `/destinations`

### Query params

* `search`
* `category`
* `page`
* `limit`
* `sortBy`
* `sortOrder`

### Example

```text
/destinations?category=beach&page=1&limit=10
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 2,
        "slug": "da-nang",
        "name": "다낭",
        "regionLabel": "베트남 중부",
        "rating": 4.7,
        "reviewCount": 21000,
        "coverImage": "/uploads/destinations/da-nang.jpg",
        "categoryLabels": ["해변"],
        "isFavorite": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 9,
      "totalPages": 1
    }
  }
}
```

---

## 5.3 Destination detail

**GET** `/destinations/:slug`

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "hoi-an",
    "name": "호이안",
    "countryLabel": "Vietnam",
    "regionLabel": "베트남 중부",
    "rating": 4.8,
    "reviewCount": 12400,
    "visitCount": 0,
    "heroImage": "/uploads/destinations/hoi-an-cover.jpg",
    "badges": ["고대 도시", "유네스코"],
    "shortDescription": "호이안은 15세기부터 19세기까지 번성한 동남아시아 무역항을 잘 보존한 유네스코 세계유산입니다.",
    "overviewDescription": "호이안은 ...",
    "bestSeasonLabel": "2월 - 8월",
    "averageTemperatureC": 28,
    "languageLabel": "베트남어",
    "currencyLabel": "VND (동)",
    "featureTags": ["역사", "문화", "구시가지", "음식"],
    "isFavorite": true
  }
}
```

---

## 5.4 Destination places

**GET** `/destinations/:id/places`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 11,
        "name": "호이안 고대 마을",
        "categoryLabel": "문화유산",
        "shortDescription": "The ancient town of Hoi An ...",
        "rating": 4.9,
        "reviewCount": 8200,
        "visitDurationLabel": "3-4시간",
        "ticketPriceAmount": 120000,
        "ticketPriceCurrency": "VND",
        "coverImage": "/uploads/places/hoi-an-old-town.jpg",
        "tags": ["문화유산", "인기"]
      }
    ]
  }
}
```

---

## 5.5 Destination hotels

**GET** `/destinations/:id/hotels`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 201,
        "name": "더 남 하이 리조트",
        "rating": 4.9,
        "reviewCount": 3200,
        "nightlyPrice": 620000,
        "currency": "KRW",
        "coverImage": "/uploads/hotels/the-nam-hai.jpg",
        "badges": ["럭셔리", "편집자 추천"]
      }
    ]
  }
}
```

---

## 5.6 Destination weather

**GET** `/destinations/:id/weather`

### Response

```json
{
  "success": true,
  "data": {
    "currentWeather": {
      "conditionCode": "sunny",
      "conditionLabel": "맑고 화창",
      "temperatureC": 28,
      "humidityPercent": 75,
      "rainChancePercent": 0,
      "uvLevelLabel": "보통"
    },
    "bestTravelPeriod": {
      "label": "2월 - 8월",
      "description": "이 시기에는 날씨가 좋고 여행하기 최적입니다."
    },
    "seasonBlocks": [
      {
        "seasonKey": "spring",
        "label": "봄",
        "monthsLabel": "2월 - 4월",
        "note": "건기 시작",
        "iconKey": "spring"
      }
    ],
    "packingItems": [
      {
        "iconKey": "sunscreen",
        "label": "선크림"
      },
      {
        "iconKey": "medicine",
        "label": "상비약"
      }
    ]
  }
}
```

---

## 5.7 Destination travel tips

**GET** `/destinations/:id/tips`

### Response

```json
{
  "success": true,
  "data": {
    "tips": [
      {
        "id": 1,
        "orderNo": 1,
        "text": "현금을 충분히 준비하세요. ATM 수수료가 높을 수 있습니다."
      },
      {
        "id": 2,
        "orderNo": 2,
        "text": "영어보다 베트남어 기본 인사로 현지인에게 친근감을 표현하세요."
      }
    ],
    "essentialApps": [
      {
        "id": 1,
        "name": "Grab",
        "subtitle": "apps.grab",
        "iconUrl": "/uploads/apps/grab.png",
        "externalUrl": "https://grab.com"
      }
    ]
  }
}
```

---

## 6. Hotel APIs

## 6.1 Recommended hotels

**GET** `/hotels/recommended`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 201,
        "slug": "the-nam-hai-resort",
        "name": "더 남 하이 리조트",
        "destinationName": "Hoi An",
        "rating": 4.9,
        "reviewCount": 3200,
        "nightlyPrice": 620000,
        "currency": "KRW",
        "coverImage": "/uploads/hotels/the-nam-hai.jpg",
        "badges": ["추천"],
        "isFavorite": true
      }
    ]
  }
}
```

---

## 6.2 Hotel list

**GET** `/hotels`

### Query params

* `destinationId`
* `search`
* `sortBy`
* `sortOrder`
* `page`
* `limit`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 201,
        "slug": "the-nam-hai-resort",
        "name": "더 남 하이 리조트",
        "destinationLabel": "호이안 하미 해변, 꽝남성",
        "hotelTypeLabel": "럭셔리",
        "starRating": 5,
        "rating": 4.9,
        "reviewCount": 3200,
        "nightlyPrice": 620000,
        "currency": "KRW",
        "coverImage": "/uploads/hotels/the-nam-hai.jpg",
        "amenityBadges": ["수영장", "스파", "레스토랑"],
        "editorBadge": "추천",
        "categoryBadge": "럭셔리",
        "isFavorite": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 8,
      "totalPages": 1
    }
  }
}
```

---

## 6.3 Hotel detail

**GET** `/hotels/:id`

### Response

```json
{
  "success": true,
  "data": {
    "id": 201,
    "slug": "the-nam-hai-resort",
    "name": "더 남 하이 리조트",
    "destinationLabel": "호이안 하미 해변, 꽝남성",
    "addressFull": "Hoi An, Quang Nam, Vietnam",
    "starRating": 5,
    "rating": 4.9,
    "reviewCount": 3200,
    "coverImage": "/uploads/hotels/the-nam-hai.jpg",
    "badges": ["럭셔리", "편집자 추천"],
    "shortDescription": "에메랄드빛 논밭과 새하얀 모래 해변 사이에 자리한 ...",
    "nightlyFromPrice": 620000,
    "currency": "KRW"
  }
}
```

---

## 6.4 Hotel rooms

**GET** `/hotels/:id/rooms`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 301,
        "name": "가든 풀 빌라",
        "bedLabel": "킹 베드",
        "roomSizeM2": 120,
        "maxGuests": 2,
        "coverImage": "/uploads/rooms/garden-pool-villa.jpg",
        "featureBadges": ["개인 수영장 포함", "가든뷰", "야외 샤워"],
        "mealBadges": ["조식 포함"],
        "nightlyPrice": 620000,
        "currency": "KRW",
        "isDefaultSelected": true
      }
    ]
  }
}
```

---

## 6.5 Hotel amenities

**GET** `/hotels/:id/amenities`

### Response

```json
{
  "success": true,
  "data": {
    "amenities": [
      {
        "key": "pool",
        "label": "수영장",
        "iconKey": "pool"
      },
      {
        "key": "spa",
        "label": "스파",
        "iconKey": "spa"
      }
    ],
    "description": "에메랄드빛 논밭과 새하얀 모래 해변 사이에 자리한 ..."
  }
}
```

---

## 6.6 Hotel policies

**GET** `/hotels/:id/policies`

### Response

```json
{
  "success": true,
  "data": {
    "checkInTime": "14:00",
    "checkOutTime": "12:00",
    "cancellationPolicyLabel": "체크인 48시간 전 무료 취소",
    "petsPolicyLabel": "반려동물 불가",
    "smokingPolicyLabel": "전 구역 금연",
    "noticeText": "예약 전 최신 정책을 반드시 확인하세요."
  }
}
```

---

## 6.7 Hotel reviews

**GET** `/hotels/:id/reviews`

### Response

```json
{
  "success": true,
  "data": {
    "summary": {
      "rating": 4.9,
      "reviewCount": 3200
    },
    "items": [
      {
        "id": 1,
        "reviewerName": "김민준",
        "reviewerInitial": "김",
        "rating": 5.0,
        "reviewDate": "2026-02-15",
        "content": "더 남 하이는 정말 꿈 같은 곳이었어요."
      }
    ]
  }
}
```

---

## 7. Hotel Booking APIs

## 7.1 Create hotel booking

**POST** `/hotel-bookings`

### Request

```json
{
  "hotelId": 201,
  "roomId": 301,
  "checkInDate": "2026-04-10",
  "checkOutDate": "2026-04-12",
  "adults": 2,
  "children": 0,
  "guestFullName": "Kim Minji",
  "guestEmail": "kim.travel@gmail.com",
  "specialRequest": "조용한 객실 선호",
  "currency": "KRW"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "bookingId": 501,
    "bookingCode": "VTHAXGMD5",
    "status": "confirmed",
    "hotelName": "더 남 하이 리조트",
    "roomName": "가든 풀 빌라",
    "checkInDate": "2026-04-10",
    "checkOutDate": "2026-04-12",
    "nights": 2,
    "guestCountLabel": "성인 2명",
    "priceBreakdown": {
      "roomPrice": 1240000,
      "taxAmount": 124000,
      "totalAmount": 1364000,
      "currency": "KRW"
    }
  }
}
```

---

## 8. Transport APIs

## 8.1 Transport highlights

**GET** `/transports/highlights`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "airport_pickup",
        "label": "공항 픽업",
        "shortDescription": "전용 기사",
        "iconKey": "airport_pickup"
      }
    ]
  }
}
```

---

## 8.2 Transport list

**GET** `/transports`

### Query params

* `destinationId`
* `type`
* `page`
* `limit`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 701,
        "name": "공항 픽업 (세단)",
        "serviceType": "airport_pickup",
        "vehicleModel": "Toyota Camry",
        "transmissionLabel": "자동",
        "capacity": 3,
        "luggageCount": 3,
        "withDriver": true,
        "priceAmount": 75000,
        "currency": "KRW",
        "coverImage": "/uploads/transports/airport-pickup-sedan.jpg",
        "rating": 4.8,
        "reviewCount": 2412,
        "featureBadges": ["에어컨", "기사 포함", "명패 서비스"],
        "categoryBadge": "공항 픽업",
        "isPopular": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 8,
      "totalPages": 1
    }
  }
}
```

---

## 8.3 Transport detail

**GET** `/transports/:id`

### Response

```json
{
  "success": true,
  "data": {
    "id": 801,
    "name": "전용 기사 포함 차량",
    "serviceType": "private_car",
    "vehicleModel": "Toyota Innova",
    "transmissionLabel": "자동",
    "capacity": 4,
    "luggageCount": 4,
    "driverModeLabel": "기사 포함",
    "coverImage": "/uploads/transports/private-driver.jpg",
    "rating": 4.9,
    "reviewCount": 3284,
    "description": "한국어 가능한 전문 기사와 함께 자유롭게 베트남 탐방.",
    "includedBadges": ["종일 이용", "한국어 안내", "에어컨", "유연한 일정"],
    "durationOptions": [
      {
        "value": 1,
        "label": "1일",
        "priceAmount": 150000,
        "currency": "KRW"
      },
      {
        "value": 2,
        "label": "2일",
        "priceAmount": 300000,
        "currency": "KRW"
      }
    ],
    "insuranceNotice": "모든 렌트 차량에는 기본 보험이 포함됩니다."
  }
}
```

---

## 9. Transport Booking APIs

## 9.1 Create transport booking

**POST** `/transport-bookings`

### Request

```json
{
  "transportId": 701,
  "pickupOptionKey": "airport_direct",
  "usageDate": "2026-04-10",
  "durationOptionValue": 1,
  "guestFullName": "Kim Minji",
  "guestEmail": "kim.travel@gmail.com",
  "note": "",
  "currency": "KRW"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "bookingId": 601,
    "bookingCode": "VTTFE8DUH",
    "status": "confirmed",
    "transportName": "공항 픽업 (SUV)",
    "serviceTypeLabel": "공항 픽업",
    "pickupLabel": "공항 직접 픽업",
    "usageDate": "2026-04-10",
    "driverLabel": "기사 포함",
    "priceBreakdown": {
      "baseAmount": 120000,
      "taxAmount": 12000,
      "totalAmount": 132000,
      "currency": "KRW"
    }
  }
}
```

---

## 10. Booking APIs

## 10.1 Booking list

**GET** `/bookings`

### Query params

* `type`
* `status`

### Response

```json
{
  "success": true,
  "data": {
    "summary": {
      "hotelCount": 2,
      "transportCount": 1,
      "confirmedCount": 3
    },
    "items": [
      {
        "id": 501,
        "bookingType": "hotel",
        "title": "빈펄 리조트 & 스파 나트랑",
        "subtitle": "오션뷰 룸",
        "startDate": "2026-04-10",
        "endDate": "2026-04-11",
        "nightsOrUsage": "1박",
        "guestInfoLabel": "성인 1",
        "totalAmount": 313500,
        "currency": "KRW",
        "confirmationCode": "VTHEB6VJJ",
        "status": "confirmed"
      }
    ]
  }
}
```

---

## 10.2 Booking detail

**GET** `/bookings/:id`

### Response for hotel

```json
{
  "success": true,
  "data": {
    "id": 501,
    "bookingType": "hotel",
    "bookingCode": "VTHAXGMD5",
    "status": "confirmed",
    "title": "더 남 하이 리조트",
    "roomName": "가든 풀 빌라",
    "checkInDate": "2026-04-10",
    "checkOutDate": "2026-04-12",
    "nightsOrUsage": "2박",
    "totalAmount": 1364000,
    "currency": "KRW"
  }
}
```

### Response for transport

```json
{
  "success": true,
  "data": {
    "id": 601,
    "bookingType": "transport",
    "bookingCode": "VTTFE8DUH",
    "status": "confirmed",
    "title": "공항 픽업 (SUV)",
    "serviceTypeLabel": "공항 픽업",
    "pickupLabel": "공항 직접 픽업",
    "usageDate": "2026-04-10",
    "driverLabel": "기사 포함",
    "totalAmount": 142000,
    "currency": "KRW"
  }
}
```

---

## 11. Favorites APIs

## 11.1 Get favorites

**GET** `/favorites`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "targetType": "destination",
        "targetId": 1,
        "title": "호이안",
        "subtitle": "베트남 중부",
        "coverImage": "/uploads/destinations/hoi-an-cover.jpg"
      }
    ]
  }
}
```

---

## 11.2 Add favorite

**POST** `/favorites`

### Request

```json
{
  "targetType": "destination",
  "targetId": 1
}
```

### Response

```json
{
  "success": true,
  "data": {
    "favoriteId": 123,
    "targetType": "destination",
    "targetId": 1
  }
}
```

---

## 11.3 Remove favorite

**DELETE** `/favorites/:favoriteId`

### Response

```json
{
  "success": true,
  "data": {
    "favoriteId": 123,
    "removed": true
  }
}
```

---

## 12. Flight APIs

## 12.1 Flight deals

**GET** `/flights/deals`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "deal_001",
        "airlineName": "대한항공",
        "airlineCode": "KE",
        "originCode": "ICN",
        "destinationCode": "DAD",
        "originLabel": "서울",
        "destinationLabel": "다낭",
        "departureTime": "09:30",
        "arrivalTime": "13:00",
        "durationMinutes": 270,
        "priceAmount": 285000,
        "currency": "KRW",
        "dealTag": "최단시간"
      }
    ]
  }
}
```

---

## 12.2 Search flights

**POST** `/flights/search`

### Request

```json
{
  "tripType": "round_trip",
  "originCode": "ICN",
  "destinationCode": "DAD",
  "departureDate": "2026-04-10",
  "returnDate": "2026-04-17",
  "seatClass": "economy",
  "passengerCount": 2,
  "flexibleDays": 3,
  "language": "ko",
  "currency": "KRW"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "searchId": "flight_search_001",
    "results": [
      {
        "id": "flt_001",
        "airlineName": "대한항공",
        "airlineCode": "KE",
        "originCode": "ICN",
        "destinationCode": "DAD",
        "departureTime": "09:30",
        "arrivalTime": "13:00",
        "durationMinutes": 270,
        "stops": 0,
        "priceAmount": 285000,
        "currency": "KRW",
        "tags": ["fastest"]
      }
    ]
  }
}
```

---

## 12.3 Recommend flights with AI

**POST** `/flights/recommend`

### Request

```json
{
  "searchId": "flight_search_001",
  "preference": "best_value",
  "language": "ko"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "bestOption": {
      "id": "flt_001",
      "airlineName": "대한항공",
      "priceAmount": 285000,
      "currency": "KRW",
      "reason": "출발 시간과 가격의 균형이 가장 좋습니다."
    },
    "cheapestOption": {
      "id": "flt_002",
      "airlineName": "아시아나항공",
      "priceAmount": 270000,
      "currency": "KRW",
      "reason": "가장 저렴한 옵션입니다."
    },
    "fastestOption": {
      "id": "flt_001",
      "airlineName": "대한항공",
      "priceAmount": 285000,
      "currency": "KRW",
      "reason": "직항이며 소요 시간이 가장 짧습니다."
    },
    "reasoningSummary": "최저가, 최단시간, 최고 가성비 순으로 추천했습니다."
  }
}
```

---

## 13. Itinerary APIs

## 13.1 Generate itinerary

**POST** `/itineraries/generate`

### Request

```json
{
  "destinationId": 2,
  "startDate": "2026-03-18",
  "nights": 5,
  "days": 6,
  "travelerType": "couple",
  "budgetLevel": "medium",
  "pace": "balanced",
  "travelStyles": ["food", "beach", "shopping"],
  "interests": ["local_food", "photography"],
  "language": "ko",
  "currency": "KRW"
}
```

### Response

Response shape phải theo `docs/itinerary-schema.json`

---

## 13.2 Get itinerary list

**GET** `/itineraries`

### Query params

* `savedOnly`

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "iti_2026_03_18_dad_001",
        "title": "AI-Planned 5-Day 다낭 Trip",
        "destinationName": "다낭",
        "coverImage": "/uploads/destinations/da-nang-cover.jpg",
        "startDate": "2026-03-17",
        "nights": 5,
        "days": 6,
        "totalActivities": 40,
        "estimatedCostAmount": 3000000,
        "currency": "KRW",
        "badges": ["AI 생성 일정"]
      }
    ]
  }
}
```

---

## 13.3 Get itinerary detail

**GET** `/itineraries/:id`

### Response

Response shape phải theo `docs/itinerary-schema.json`

---

## 13.4 Save itinerary

**POST** `/itineraries/:id/save`

### Response

```json
{
  "success": true,
  "data": {
    "id": "iti_2026_03_18_dad_001",
    "status": "saved",
    "savedAt": "2026-03-18T06:20:00Z"
  }
}
```

---

## 13.5 Regenerate itinerary

**POST** `/itineraries/:id/regenerate`

### Request

```json
{
  "regenerateScope": "full",
  "language": "ko",
  "currency": "KRW"
}
```

### Response

Response shape phải theo `docs/itinerary-schema.json`

---

## 14. Settings / support APIs

## 14.1 App meta

**GET** `/settings/app-meta`

### Response

```json
{
  "success": true,
  "data": {
    "appName": "Travenor",
    "version": "1.0.0",
    "supportEmail": "support@example.com"
  }
}
```

---

## 14.2 Legal

**GET** `/settings/legal`

### Response

```json
{
  "success": true,
  "data": {
    "privacyPolicyUrl": "/legal/privacy-policy",
    "termsOfServiceUrl": "/legal/terms-of-service"
  }
}
```

---

## 14.3 Support

**GET** `/settings/support`

### Response

```json
{
  "success": true,
  "data": {
    "customerCenterLabel": "고객센터 문의",
    "supportHours": "평일 09:00–18:00",
    "supportLanguage": "한국어 지원"
  }
}
```

---

## 15. Health API

## 15.1 Health check

**GET** `/health`

### Response

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-03-18T06:00:00Z"
  }
}
```

---

## 16. Notes for implementation

### 16.1 Formatting rules

Backend trả:

* `priceAmount` là number
* `currency` là code
* frontend tự format

Trừ itinerary schema hiện đang cho phép `display` để fit UI nhanh, nhưng về lâu dài nên cân nhắc formatter layer riêng.

### 16.2 External provider isolation

* `/flights/*` không expose raw provider response
* `/weather/*` không expose raw weather provider response
* mọi response đều phải normalize

### 16.3 Booking model

Giai đoạn đầu booking có thể là:

* request created
* immediately confirmed in demo/mvp
* status lifecycle vẫn phải tồn tại trong DB

### 16.4 AI output

Mọi response của itinerary generation phải conform theo:

* `docs/itinerary-schema.json`


