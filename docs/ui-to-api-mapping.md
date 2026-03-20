# UI to API Mapping

Tài liệu này map trực tiếp giữa UI hiện tại của app mobile và các API/backend capability cần có.

Mục tiêu:
- tránh backend lệch khỏi UI
- xác định field nào đang thực sự được render
- xác định endpoint nào cần ưu tiên làm trước
- làm rõ domain nào là dữ liệu nội bộ, domain nào là dữ liệu ngoài

---

## 1. Home Screen

### UI sections
- greeting / user summary
- search bar
- quick category shortcuts
- upcoming booking card
- top destinations
- recommended hotels
- flight deals
- transport shortcuts
- AI planner banner / CTA

### Backend requirements

#### 1.1 User greeting / summary
**API**
- `GET /auth/me`

**Response fields**
- `id`
- `fullName`
- `email`
- `avatarUrl`
- `language`
- `preferredCurrency`

#### 1.2 Upcoming booking card
**API**
- `GET /bookings/upcoming`

**Response fields**
- `id`
- `bookingType`
- `title`
- `subtitle`
- `startDate`
- `endDate`
- `status`
- `confirmationCode`

#### 1.3 Top destinations
**API**
- `GET /destinations/featured`

**Response fields**
- `id`
- `slug`
- `name`
- `regionLabel`
- `countryLabel`
- `rating`
- `reviewCount`
- `heroImage`
- `matchPercent`
- `isFavorite`
- `tags`

#### 1.4 Recommended hotels
**API**
- `GET /hotels/recommended`

**Response fields**
- `id`
- `slug`
- `name`
- `destinationName`
- `rating`
- `reviewCount`
- `nightlyPrice`
- `currency`
- `coverImage`
- `badges`
- `isFavorite`

#### 1.5 Flight deals
**API**
- `GET /flights/deals`

**Response fields**
- `id`
- `airlineName`
- `airlineCode`
- `originCode`
- `destinationCode`
- `originLabel`
- `destinationLabel`
- `departureTime`
- `arrivalTime`
- `durationMinutes`
- `priceAmount`
- `currency`
- `dealTag`

#### 1.6 Transport shortcuts
**API**
- `GET /transports/highlights`

**Response fields**
- `type`
- `label`
- `shortDescription`
- `iconKey`

---

## 2. Explore / Popular Destinations Screen

### UI sections
- title
- search input
- category filters
- grid/list toggle
- destination cards
- favorite action

### Backend requirements

#### 2.1 Destination list
**API**
- `GET /destinations`

**Query params**
- `search`
- `category`
- `page`
- `limit`
- `sortBy`
- `sortOrder`

**Response fields**
- `id`
- `slug`
- `name`
- `categoryLabels`
- `regionLabel`
- `rating`
- `reviewCount`
- `coverImage`
- `isFavorite`

#### 2.2 Favorite destination toggle
**API**
- `POST /favorites`
- `DELETE /favorites/:favoriteId`

**Request**
- `targetType: "destination"`
- `targetId`

---

## 3. Destination Detail Screen

### UI tabs
- overview
- places
- hotels
- weather
- travel tips

### Backend requirements

#### 3.1 Destination overview
**API**
- `GET /destinations/:slug`

**Response fields**
- `id`
- `slug`
- `name`
- `countryLabel`
- `regionLabel`
- `rating`
- `reviewCount`
- `visitCount`
- `heroImage`
- `badges`
- `shortDescription`
- `overviewDescription`
- `bestSeasonLabel`
- `averageTemperatureC`
- `languageLabel`
- `currencyLabel`
- `featureTags`

#### 3.2 Places tab
**API**
- `GET /destinations/:id/places`

**Response fields**
- `id`
- `name`
- `categoryLabel`
- `shortDescription`
- `rating`
- `reviewCount`
- `visitDurationLabel`
- `ticketPriceAmount`
- `ticketPriceCurrency`
- `coverImage`
- `tags`

#### 3.3 Hotels tab in destination detail
**API**
- `GET /destinations/:id/hotels`

**Response fields**
- `id`
- `name`
- `rating`
- `reviewCount`
- `nightlyPrice`
- `currency`
- `coverImage`
- `badges`

#### 3.4 Weather tab
**API**
- `GET /destinations/:id/weather`

**Response fields**
- `currentWeather`
  - `conditionCode`
  - `conditionLabel`
  - `temperatureC`
  - `humidityPercent`
  - `rainChancePercent`
  - `uvLevelLabel`
- `bestTravelPeriod`
  - `label`
  - `description`
- `seasonBlocks`
  - `seasonKey`
  - `label`
  - `monthsLabel`
  - `note`
  - `iconKey`
- `packingItems`
  - `iconKey`
  - `label`

#### 3.5 Travel tips tab
**API**
- `GET /destinations/:id/tips`

**Response fields**
- `tips`
  - `id`
  - `orderNo`
  - `text`
- `essentialApps`
  - `id`
  - `name`
  - `subtitle`
  - `iconUrl`
  - `externalUrl`

#### 3.6 Destination detail bottom CTAs
**Actions**
- AI itinerary generation entry
- hotel booking entry

**Related APIs**
- `POST /itineraries/generate`
- `GET /destinations/:id/hotels`

---

## 4. Hotel List Screen

### UI sections
- search
- destination filters
- sorting
- hotel cards
- favorite action

### Backend requirements

#### 4.1 Hotel list
**API**
- `GET /hotels`

**Query params**
- `destinationId`
- `search`
- `sortBy`
- `sortOrder`
- `page`
- `limit`

**Response fields**
- `id`
- `slug`
- `name`
- `destinationLabel`
- `addressShort`
- `hotelTypeLabel`
- `starRating`
- `rating`
- `reviewCount`
- `nightlyPrice`
- `currency`
- `coverImage`
- `amenityBadges`
- `editorBadge`
- `categoryBadge`
- `isFavorite`

---

## 5. Hotel Detail Screen

### UI tabs
- room selection
- amenities
- policy
- reviews

### Backend requirements

#### 5.1 Hotel detail base
**API**
- `GET /hotels/:id`

**Response fields**
- `id`
- `slug`
- `name`
- `destinationLabel`
- `addressFull`
- `starRating`
- `rating`
- `reviewCount`
- `coverImage`
- `badges`
- `shortDescription`
- `nightlyFromPrice`
- `currency`

#### 5.2 Room selection tab
**API**
- `GET /hotels/:id/rooms`

**Response fields**
- `id`
- `name`
- `bedLabel`
- `roomSizeM2`
- `maxGuests`
- `coverImage`
- `featureBadges`
- `mealBadges`
- `nightlyPrice`
- `currency`
- `isDefaultSelected`

#### 5.3 Amenities tab
**API**
- `GET /hotels/:id/amenities`

**Response fields**
- `amenities`
  - `key`
  - `label`
  - `iconKey`
- `description`

#### 5.4 Policy tab
**API**
- `GET /hotels/:id/policies`

**Response fields**
- `checkInTime`
- `checkOutTime`
- `cancellationPolicyLabel`
- `petsPolicyLabel`
- `smokingPolicyLabel`
- `noticeText`

#### 5.5 Reviews tab
**API**
- `GET /hotels/:id/reviews`

**Response fields**
- `summary`
  - `rating`
  - `reviewCount`
- `items`
  - `id`
  - `reviewerName`
  - `reviewerInitial`
  - `rating`
  - `reviewDate`
  - `content`

#### 5.6 Hotel favorite
**API**
- `POST /favorites`
- `DELETE /favorites/:favoriteId`

**Request**
- `targetType: "hotel"`
- `targetId`

---

## 6. Hotel Booking Flow

### UI screens
- booking form
- booking summary
- booking success

### Backend requirements

#### 6.1 Create hotel booking request
**API**
- `POST /hotel-bookings`

**Request fields**
- `hotelId`
- `roomId`
- `stayOptionId` or `checkInDate` + `checkOutDate`
- `adults`
- `children`
- `guestFullName`
- `guestEmail`
- `specialRequest`
- `currency`

**Response fields**
- `bookingId`
- `bookingCode`
- `status`
- `hotelName`
- `roomName`
- `checkInDate`
- `checkOutDate`
- `nights`
- `guestCountLabel`
- `priceBreakdown`
  - `roomPrice`
  - `taxAmount`
  - `totalAmount`
  - `currency`

#### 6.2 Confirmed booking detail for success screen
**API**
- `GET /bookings/:id`

**Response fields**
- `id`
- `bookingCode`
- `bookingType`
- `hotelName`
- `roomName`
- `checkInDate`
- `checkOutDate`
- `nights`
- `totalAmount`
- `currency`
- `status`

---

## 7. Transport List Screen

### UI sections
- category filter
- service summary banner
- transport cards

### Backend requirements

#### 7.1 Transport list
**API**
- `GET /transports`

**Query params**
- `destinationId`
- `type`
- `page`
- `limit`

**Response fields**
- `id`
- `name`
- `serviceType`
- `vehicleModel`
- `transmissionLabel`
- `capacity`
- `luggageCount`
- `withDriver`
- `priceAmount`
- `currency`
- `coverImage`
- `rating`
- `reviewCount`
- `featureBadges`
- `categoryBadge`
- `isPopular`

---

## 8. Transport Detail Screen

### UI sections
- hero image
- base summary
- vehicle specs
- included features
- duration options
- price summary
- booking CTA

### Backend requirements

#### 8.1 Transport detail
**API**
- `GET /transports/:id`

**Response fields**
- `id`
- `name`
- `serviceType`
- `vehicleModel`
- `transmissionLabel`
- `capacity`
- `luggageCount`
- `driverModeLabel`
- `coverImage`
- `rating`
- `reviewCount`
- `description`
- `includedBadges`
- `durationOptions`
  - `value`
  - `label`
  - `priceAmount`
  - `currency`
- `insuranceNotice`

---

## 9. Transport Booking Flow

### UI screens
- pickup selection
- booking summary
- booking success

### Backend requirements

#### 9.1 Create transport booking request
**API**
- `POST /transport-bookings`

**Request fields**
- `transportId`
- `pickupOptionKey`
- `usageDate`
- `durationOptionValue`
- `guestFullName`
- `guestEmail`
- `note`
- `currency`

**Response fields**
- `bookingId`
- `bookingCode`
- `status`
- `transportName`
- `serviceTypeLabel`
- `pickupLabel`
- `usageDate`
- `driverLabel`
- `priceBreakdown`
  - `baseAmount`
  - `taxAmount`
  - `totalAmount`
  - `currency`

#### 9.2 Transport booking success detail
**API**
- `GET /bookings/:id`

**Response fields**
- `id`
- `bookingCode`
- `transportName`
- `serviceTypeLabel`
- `pickupLabel`
- `usageDate`
- `driverLabel`
- `totalAmount`
- `currency`
- `status`

---

## 10. Flight Search Screen

### UI sections
- round trip / one way
- destination chips
- origin chips
- departure/return date
- quick duration chips
- seat class
- passenger count
- flexible date flag
- AI optimize hint

### Backend requirements

#### 10.1 Search flights
**API**
- `POST /flights/search`

**Request fields**
- `tripType`
- `originCode`
- `destinationCode`
- `departureDate`
- `returnDate` (nullable for one-way)
- `seatClass`
- `passengerCount`
- `flexibleDays`
- `language`
- `currency`

**Response fields**
- `searchId`
- `results`
  - `id`
  - `airlineName`
  - `airlineCode`
  - `originCode`
  - `destinationCode`
  - `departureTime`
  - `arrivalTime`
  - `durationMinutes`
  - `stops`
  - `priceAmount`
  - `currency`
  - `tags`

#### 10.2 Recommend best flights with AI
**API**
- `POST /flights/recommend`

**Request fields**
- `searchId`
- `preference`
- `language`

**Response fields**
- `bestOption`
- `cheapestOption`
- `fastestOption`
- `reasoningSummary`

---

## 11. AI Planner Input Screen

### UI inputs
- destination
- nights
- travel styles
- traveler type
- budget level
- pace
- interests

### Backend requirements

#### 11.1 Generate itinerary
**API**
- `POST /itineraries/generate`

**Request fields**
- `destinationId`
- `startDate` (optional if fixed by UX later)
- `nights`
- `days`
- `travelerType`
- `budgetLevel`
- `pace`
- `travelStyles`
- `interests`
- `language`
- `currency`

**Response**
See itinerary schema in `itinerary-schema.json`

---

## 12. AI Planner Loading Screen

### Backend requirements
No separate API.
Uses loading state of:
- `POST /itineraries/generate`

---

## 13. AI Planner Result Screen

### UI sections
- itinerary header
- day tabs
- day title
- weather row
- estimated cost
- timeline items
- warnings
- smart tips
- save / regenerate

### Backend requirements

#### 13.1 Get itinerary detail
**API**
- `GET /itineraries/:id`

**Response**
Must include:
- trip summary
- day tabs
- daily sections
- timeline items
- warnings
- booking-needed blocks
- smart tips

#### 13.2 Regenerate itinerary
**API**
- `POST /itineraries/:id/regenerate`

**Request fields**
- `regenerateScope`
- `language`
- `currency`

#### 13.3 Save itinerary
**API**
- `POST /itineraries/:id/save`

**Response fields**
- `id`
- `status`
- `savedAt`

---

## 14. Trips / My Travel Screen

### UI sections
- saved itinerary count
- favorite destination count
- toggle between saved itineraries and favorites

### Backend requirements

#### 14.1 Saved itineraries list
**API**
- `GET /itineraries`

**Query params**
- `savedOnly=true`

**Response fields**
- `id`
- `title`
- `destinationName`
- `coverImage`
- `startDate`
- `nights`
- `days`
- `totalActivities`
- `estimatedCostAmount`
- `currency`
- `badges`

#### 14.2 Favorite items list
**API**
- `GET /favorites`

**Response fields**
- `id`
- `targetType`
- `targetId`
- `title`
- `subtitle`
- `coverImage`

---

## 15. Bookings Screen

### UI sections
- booking counters
- hotel/transport filters
- booking cards

### Backend requirements

#### 15.1 Booking list
**API**
- `GET /bookings`

**Query params**
- `type`
- `status`

**Response fields**
- `summary`
  - `hotelCount`
  - `transportCount`
  - `confirmedCount`
- `items`
  - `id`
  - `bookingType`
  - `title`
  - `subtitle`
  - `startDate`
  - `endDate`
  - `nightsOrUsage`
  - `guestInfoLabel`
  - `totalAmount`
  - `currency`
  - `confirmationCode`
  - `status`

---

## 16. Profile / Settings Screen

### UI sections
- profile info
- counts
- saved trips
- bookings
- favorites
- travel style / keywords
- language
- dark mode
- push notifications
- legal
- support
- app version
- logout

### Backend requirements

#### 16.1 Profile
**API**
- `GET /users/profile`
- `PATCH /users/profile`

**Response fields**
- `id`
- `fullName`
- `email`
- `avatarUrl`
- `savedTripsCount`
- `bookingsCount`
- `favoritesCount`
- `travelStyles`
- `interestKeywords`

#### 16.2 Preferences
**API**
- `GET /users/preferences`
- `PATCH /users/preferences`

**Response/request fields**
- `language`
- `preferredCurrency`
- `darkModeEnabled`
- `pushNotificationEnabled`

#### 16.3 Logout
**API**
- `POST /auth/logout`

---

## 17. Favorite Flow

### UI places using favorites
- destination cards
- hotel cards
- destination detail favorite
- trips favorite tab

### Backend requirements

#### 17.1 Add favorite
**API**
- `POST /favorites`

**Request fields**
- `targetType`
- `targetId`

#### 17.2 Remove favorite
**API**
- `DELETE /favorites/:favoriteId`

---

## 18. Support / legal / static sections

### UI sections
- privacy policy
- terms of service
- customer support
- app version

### Backend requirements

#### 18.1 Static content
Có thể hardcode giai đoạn đầu hoặc cho vào CMS sau.

Nếu đưa vào backend:
- `GET /settings/app-meta`
- `GET /settings/legal`
- `GET /settings/support`

---

## 19. Data ownership summary

### Internal DB owned data
- users
- preferences
- destinations
- places
- travel tips
- hotel data
- hotel room data
- hotel policies
- transport data
- transport prices/options
- itineraries
- bookings
- favorites

### External API data
- flights
- weather

### AI generated data
- itinerary result
- flight recommendation explanation

---

## 20. Priority order for backend implementation

### Priority 1
- auth
- users/profile/preferences
- destinations
- destination detail
- itinerary generate/detail/save

### Priority 2
- hotels
- hotel detail
- hotel rooms
- hotel booking

### Priority 3
- transports
- transport detail
- transport booking

### Priority 4
- bookings list
- favorites
- home aggregated sections

### Priority 5
- flights search
- flights recommend
- affiliate click logging