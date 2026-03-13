"""
Patch mock/itineraries.ts to add English locale support.
"""
import re

FILE = r'd:\Travel_Assistant\mock\itineraries.ts'

# ── English DEST_PROFILES_EN (inserted before getProfile) ───────────────────

DEST_ALIASES_AND_EN = r"""
const DEST_ALIASES: Record<string, DestKey> = {
  '다낭': '다낭', 'da nang': '다낭', '다낭,': '다낭', '\u0111\u00e0 n\u1eb5ng': '다낭', 'da n\u1eb5ng': '다낭',
  '호이안': '호이안', 'hoi an': '호이안', 'h\u1ed9i an': '호이안',
  '하노이': '하노이', 'hanoi': '하노이', 'ha noi': '하노이', 'h\u00e0 n\u1ed9i': '하노이',
  '호치민': '호치민', 'ho chi minh': '호치민', 'saigon': '호치민', 'hcmc': '호치민', 'ho chi minh city': '호치민',
  '푸꾸옥': '푸꾸옥', 'phu quoc': '푸꾸옥', 'ph\u00fa qu\u1ed1c': '푸꾸옥',
  '하롱베이': '하롱베이', 'ha long bay': '하롱베이', 'halong': '하롱베이', 'ha long': '하롱베이', 'h\u1ea1 long': '하롱베이',
  '사파': '사파', 'sapa': '사파', 'sa pa': '사파',
  '나트랑': '나트랑', 'nha trang': '나트랑', 'nhatrang': '나트랑',
  '후에': '후에', 'hue': '후에', 'hu\u1ebf': '후에',
};

const DEST_PROFILES_EN: Record<DestKey, DestinationProfile> = {
  '다낭': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['Sunny 30°C ☀️ — Apply sunscreen', 'Partly cloudy 28°C 🌤 — Great for outdoors', 'Sunny 31°C ☀️ — Afternoon beach is best', 'Possible showers 27°C 🌦 — Bring an umbrella', 'Sunny 29°C ☀️'],
    dayThemes: ['Arrival & Beach Relaxation', 'Ba Na Hills & Golden Bridge', 'Hoi An Ancient Town', 'Marble Mountain & Shopping', 'Son Tra & Departure'],
    morningAttractions: [
      { title: 'My Khe Beach Stroll', location: 'My Khe Beach, Da Nang', desc: 'One of Asia\'s top beaches — stroll along the shore in the cool morning breeze', cost: 0, img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600', booking: false },
      { title: 'Ba Na Hills Cable Car', location: 'Ba Na Hills National Park', desc: 'World\'s longest cable car to the summit — the iconic Golden Bridge awaits at the top', cost: 750000, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', tips: 'Arrive before 9am to skip the queue', booking: true },
      { title: 'Marble Mountain (Ngu Hanh Son)', location: '10km south of Da Nang', desc: 'Climb the highest limestone peak and explore ancient cave Buddhist temples', cost: 40000, img: 'https://images.unsplash.com/photo-1614093302611-8eaddbfd1d26?w=600', tips: 'Elevator available for an extra ₫15,000', booking: false },
    ],
    afternoonAttractions: [
      { title: 'Han Market Shopping', location: 'Han Market, Da Nang city center', desc: 'Covered traditional market packed with local food, clothing, and souvenirs', cost: 0, booking: false },
      { title: 'Golden Bridge (Cau Vang)', location: 'Ba Na Hills summit', desc: 'The famous bridge "held by giant stone hands" — a must for photos', cost: 0, tips: 'Visit on weekdays to avoid crowds', booking: false },
      { title: 'Dragon Bridge Night View', location: 'Dragon Bridge, Han River', desc: 'Illuminated dragon bridge over the Han River — fire show on weekends', cost: 0, tips: 'Fire & water show every Saturday and Sunday at 9pm', booking: false },
    ],
    eveningAttractions: [
      { title: 'Han River Night Cruise', location: 'Han River Pier, Da Nang', desc: '1-hour boat cruise admiring Da Nang\'s sparkling skyline from the water', cost: 200000, booking: true },
      { title: 'Da Nang Night Market', location: 'Bach Dang Street', desc: 'Lively nightly market with street food stalls and souvenir shops', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: 'Banh Mi Breakfast', location: 'Banh Mi Phuong', desc: 'Da Nang\'s legendary banh mi — praised by Anthony Bourdain himself', cost: 35000, tips: 'Best visited 7–10am. Expect a short queue' },
      { title: 'Pho Breakfast', location: 'Pho Xua Restaurant', desc: 'Rich local beef noodle soup enjoyed by residents every morning', cost: 50000 },
      { title: 'Hotel Breakfast Buffet', location: 'Your hotel', desc: 'A relaxed start to the day at the hotel buffet', cost: 0, tips: 'Confirm if included in your booking' },
    ],
    lunches: [
      { title: 'Mi Quang (Da Nang Noodles)', location: 'Mi Quang 1A', desc: 'Da Nang\'s signature turmeric noodle dish with shrimp, pork and fresh herbs', cost: 60000, tips: 'Local favorite — no English menu, just point to order' },
      { title: 'Banh Xeo (Vietnamese Crispy Pancake)', location: 'Quan Com Hue Ba Cu', desc: 'Sizzling rice pancake stuffed with shrimp, pork and bean sprouts', cost: 70000 },
    ],
    dinners: [
      { title: 'Seafood BBQ Dinner', location: 'Be Man Quan Seafood', desc: 'Grill your own fresh seafood right at the table — a quintessential Da Nang experience', cost: 350000, tips: 'Fills up fast from 6pm. Reservation recommended' },
      { title: 'Rooftop Dining', location: 'Sky 36 Restaurant', desc: 'Da Nang panorama from the 36th floor — Western and Asian fusion menu', cost: 500000, booking: true },
    ],
    transports: [
      { title: 'Grab Taxi', location: 'Da Nang city', desc: 'Easiest and most affordable way to get around — app required', cost: 80000 },
      { title: 'Electric Scooter Rental', location: 'My Khe Beach rental shops', desc: 'Explore the city freely all day — no international licence needed (local rules)', cost: 150000 },
    ],
    insights: [
      'April–May is Da Nang\'s dry season — the best time to visit',
      'Golden Bridge is least crowded on weekday mornings',
      'My Khe Beach has free public areas and separate paid sunbed zones',
      'Bring cash VND — smaller restaurants usually do not accept cards',
    ],
    warnings: [
      '⚠️ Ba Na Hills: buy tickets online to save ~10% vs. buying on-site',
      '⚠️ Dragon Bridge fire shows only run on Saturdays and Sundays',
      '⚠️ If renting a scooter, carry an international driving permit',
    ],
    budgetPerDay: { budget: 300000, medium: 600000, luxury: 1200000 },
  },
  '호이안': {
    cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    weather: ['Sunny 29°C ☀️ — Perfect for exploring the ancient town', 'Overcast 27°C 🌥 — Still great outdoors', 'Sunny 30°C ☀️', 'Possible rain 26°C 🌦', 'Sunny 28°C ☀️'],
    dayThemes: ['Ancient Town Exploration', 'Thu Bon River & Lantern Village', 'Cooking Class & Countryside Cycling', 'Beach Day & Shopping', 'Morning Market & Farewell'],
    morningAttractions: [
      { title: 'Hoi An Ancient Town', location: 'Hoi An Old Town', desc: 'UNESCO World Heritage Site — your ticket grants access to 5 historic landmarks', cost: 120000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: 'Arrive just after sunrise (7–8am) to beat the tourist crowds', booking: false },
      { title: 'Thu Bon River Boat Tour', location: 'Thu Bon River Pier', desc: '30-minute scenic boat ride with lovely views of the old town waterfront', cost: 150000, booking: true },
      { title: 'Phoc Kien Assembly Hall', location: 'Hoi An Old Town', desc: 'Beautiful 200-year-old Chinese assembly hall and temple — included with town entry', cost: 0, booking: false },
    ],
    afternoonAttractions: [
      { title: 'Vietnamese Cooking Class', location: 'Miss Ly Cooking Class', desc: 'Visit the local market to buy ingredients then cook 3 traditional dishes', cost: 450000, img: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600', tips: 'Around 4 hours. Must pre-book in advance', booking: true },
      { title: 'Rice Paddy Cycling Tour', location: 'Hoi An countryside', desc: 'Pedal through scenic rice paddies and traditional villages — half-day activity', cost: 200000, booking: false },
    ],
    eveningAttractions: [
      { title: 'Night Market & Lantern Floating', location: 'Thu Bon River, Hoi An', desc: 'Float a glowing lantern on the river surrounded by hundreds of colourful lights', cost: 50000, tips: 'Lanterns cost ₫25,000 each at riverside stalls', booking: false },
      { title: 'Hoi An Night Market', location: 'Nguyen Hoang Street', desc: 'Handcrafts, keepsakes, and street food among the old town\'s illuminated streets', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: 'Cao Lau Noodles', location: 'Thanh Cao Lau', desc: 'Hoi An\'s famous thick noodle dish topped with pork slices and crispy crackers', cost: 55000 },
      { title: 'Banh Mi', location: 'Banh Mi Phuong Hoi An', desc: 'The legendary banh mi shop visited by Obama — world-famous for good reason', cost: 35000, tips: 'Expect a short queue between 7–9am' },
    ],
    lunches: [
      { title: 'White Rose Dumplings & Banh Vac', location: 'White Rose Restaurant', desc: 'Delicate shrimp dumplings unique to Hoi An — a dish you cannot find elsewhere', cost: 80000 },
      { title: 'Pho & Fresh Spring Rolls', location: 'Mango Mango Restaurant', desc: 'Authentic Vietnamese food with beautiful views of the old town', cost: 150000 },
    ],
    dinners: [
      { title: 'Riverside Seafood Dinner', location: 'Mango Rooms', desc: 'Inventive Vietnamese fusion cuisine on a terrace overlooking the Thu Bon River', cost: 400000, booking: true },
      { title: 'Traditional Hoi An Set Course', location: 'Morning Glory Restaurant', desc: 'The best local dishes served as a tasting set — ideal introduction to Hoi An cuisine', cost: 350000 },
    ],
    transports: [
      { title: 'Bicycle Rental', location: 'Old town rental shops', desc: 'Best way to explore the car-free ancient town — full day for ₫50,000', cost: 50000 },
      { title: 'Cyclo (Pedicab) Tour', location: 'Hoi An Old Town', desc: 'A leisurely pedicab ride around narrow old-town streets and alleyways', cost: 100000 },
    ],
    insights: [
      'On the 14th night of the lunar month, the town switches off electric lights — only lanterns illuminate the streets',
      'Order tailor-made clothes on day one — typically ready within 24 hours',
      'Negotiate group prices for Thu Bon River boat tours',
    ],
    warnings: [
      '⚠️ Motorcycles are banned inside the old town from 12:00–17:00',
      '⚠️ Compare prices at multiple tailors before placing an order',
      '⚠️ River levels can rise sharply during the rainy season',
    ],
    budgetPerDay: { budget: 250000, medium: 500000, luxury: 1000000 },
  },
  '하노이': {
    cover: 'https://images.unsplash.com/photo-1509510983883-40b4c9e3742e?w=800',
    weather: ['Cool 23°C 🌥 — Perfect travel weather', 'Overcast 21°C — Bring a light jacket', 'Sunny 25°C ☀️', 'Misty 22°C 🌫 — Atmospheric and moody', 'Sunny 24°C ☀️'],
    dayThemes: ['Old Quarter & Hoan Kiem Lake', 'Ho Chi Minh Mausoleum & Temples', 'Old Quarter Food Walking Tour', 'West Lake & Ethnology Museum', 'Last Coffee & Departure'],
    morningAttractions: [
      { title: 'Hoan Kiem Lake & Turtle Tower', location: 'Hoan Kiem, Hanoi', desc: 'Emerald lake at the heart of Hanoi with a 600-year-old temple on a tiny island', cost: 0, img: 'https://images.unsplash.com/photo-1555351179-11c9680c497b?w=600', booking: false },
      { title: 'Ho Chi Minh Mausoleum', location: 'Ba Dinh Square, Hanoi', desc: 'Mausoleum of Vietnam\'s founding father — free entry, solemn atmosphere', cost: 0, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', tips: 'Open Tue–Thu 7:30–10:30am. No shorts or sleeveless tops allowed', booking: false },
      { title: 'Temple of Literature (Van Mieu)', location: 'Hanoi', desc: 'Founded in 1070 — Vietnam\'s first university and a stunning Confucian temple complex', cost: 30000, booking: false },
    ],
    afternoonAttractions: [
      { title: 'The 36 Streets of the Old Quarter', location: 'Hanoi Old Quarter', desc: 'Each street historically specialised in a different craft — a fascinating living museum', cost: 0, tips: 'Bargain for 50–60% of the asking price — it\'s expected', booking: false },
      { title: 'Vietnam Museum of Ethnology', location: 'Western Hanoi', desc: 'Fascinating outdoor exhibitions showcasing traditional houses of 54 ethnic groups', cost: 40000, booking: false },
    ],
    eveningAttractions: [
      { title: 'Water Puppet Show', location: 'Thang Long Water Puppet Theatre', desc: '1,000-year tradition of water puppetry — a truly unique Vietnamese cultural experience', cost: 100000, tips: 'Arrive 30 min early — popular show. Pre-booking highly recommended', booking: true },
      { title: 'Ta Hien Street (Beer Street)', location: 'Ta Hien, Hanoi', desc: 'Hanoi\'s legendary beer street — 330ml draft beer for just ₫5,000', cost: 50000, booking: false },
    ],
    breakfasts: [
      { title: 'Pho Bo (Beef Pho)', location: 'Pho Bat Dan', desc: 'Legendary Hanoi pho since 1955 — rich broth worth every minute of the queue', cost: 60000, tips: 'Opens at 6am — go early so the broth does not run out' },
      { title: 'Banh Cuon (Steamed Rice Roll)', location: 'Banh Cuon Gia Truyen', desc: 'Silky rice crepes stuffed with pork, wood-ear mushroom and spring onion', cost: 50000 },
    ],
    lunches: [
      { title: 'Bun Cha (Grilled Pork Noodles)', location: 'Bun Cha Huong Lien', desc: 'The famous restaurant visited by Obama and Anthony Bourdain — Hanoi\'s national dish', cost: 70000, tips: 'Obama\'s visit photo is displayed on the 2nd floor', booking: false },
      { title: 'Nem Cuon & Spring Rolls', location: 'Quan An Ngon', desc: 'Traditional Hanoi dishes served in a beautiful open-air courtyard', cost: 200000 },
    ],
    dinners: [
      { title: 'Rooftop Restaurant', location: 'Summit Lounge, Sofitel Legend Metropole', desc: 'Hanoi panorama with refined French-Vietnamese fusion cuisine', cost: 800000, booking: true },
      { title: 'Cha Ca La Vong (Hanoi Grilled Fish)', location: 'Cha Ca La Vong Restaurant', desc: 'A 150-year dining institution — turmeric fish sizzled at the table with dill', cost: 300000 },
    ],
    transports: [
      { title: 'Cyclo Tour of the Old Quarter', location: 'Hanoi Old Quarter', desc: 'Relaxing pedicab ride through the winding lanes of the old quarter — 1 hour', cost: 150000, booking: false },
      { title: 'Grab Bike', location: 'Hanoi city', desc: 'Best way to beat Hanoi\'s notorious traffic — download the Grab app', cost: 30000 },
    ],
    insights: [
      'The Old Quarter is best explored slowly on foot',
      'Hoan Kiem Lake area becomes a pedestrian-only zone on weekend evenings',
      'Grab a numbered ticket before joining the queue at popular bun cha restaurants',
    ],
    warnings: [
      '⚠️ Ho Chi Minh Mausoleum is closed on Mondays and Fridays',
      '⚠️ Always negotiate in the Old Quarter — initial prices are always inflated',
      '⚠️ When crossing the street, walk slowly and steadily — motorbikes will weave around you',
    ],
    budgetPerDay: { budget: 280000, medium: 550000, luxury: 1100000 },
  },
  '호치민': {
    cover: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    weather: ['Hot sunny 34°C ☀️ — Drink plenty of water', 'Blazing hot 35°C ☀️', 'Possible showers 31°C 🌦', 'Sunny 33°C ☀️', 'Overcast 30°C 🌥'],
    dayThemes: ['French Colonial District Sightseeing', 'War History Tour', 'Cholon Chinatown & Ben Thanh Market', 'Mekong Delta Day Trip', 'Shopping & Departure'],
    morningAttractions: [
      { title: 'Reunification Palace', location: '3 Nam Ky Khoi Nghia, District 1', desc: 'Presidential palace preserved exactly as it appeared on Liberation Day, 1975', cost: 40000, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', booking: false },
      { title: 'War Remnants Museum', location: '28 Vo Van Tan, District 3', desc: 'Powerful and thought-provoking museum documenting the Vietnam War', cost: 40000, tips: 'Be aware: content is intense — not suitable for young children', booking: false },
      { title: 'Notre-Dame Cathedral Basilica', location: 'Paris Commune Square, District 1', desc: 'Iconic red brick cathedral built during the French colonial era', cost: 0, booking: false },
    ],
    afternoonAttractions: [
      { title: 'Ben Thanh Market', location: 'Ben Thanh, HCMC', desc: 'Vietnam\'s most famous covered market — clothing, fresh food, and souvenirs in one place', cost: 0, tips: 'No air conditioning — visit early morning or late afternoon', booking: false },
      { title: 'Mekong Delta Day Tour', location: 'HCMC → Mekong Delta', desc: 'Drift through floating villages by sampan and taste fresh coconut sweets and tropical fruit', cost: 500000, tips: 'A full 8-hour day trip — book the day before in peak season', booking: true },
    ],
    eveningAttractions: [
      { title: 'Bui Vien Walking Street', location: 'Bui Vien Street, District 1', desc: 'Vietnam\'s liveliest expat street — pumping music, cold beer, and electric atmosphere all night', cost: 0, booking: false },
      { title: 'Rooftop Sky Bar', location: 'Chill Sky Bar, 26th floor', desc: '360° cocktail bar towering above Ho Chi Minh City\'s neon-lit skyline', cost: 300000, tips: 'Smart casual dress code — no flip flops or shorts allowed', booking: true },
    ],
    breakfasts: [
      { title: 'Banh Mi & Local Coffee', location: 'Banh Mi 37 Nguyen Trai', desc: 'Top-rated banh mi spot in HCMC — fresh, cheap, and delicious', cost: 40000 },
      { title: 'Com Tam (Broken Rice)', location: 'Com Tam Ba Ghien', desc: 'HCMC\'s beloved breakfast staple — broken rice topped with char-grilled pork', cost: 60000 },
    ],
    lunches: [
      { title: 'Bun Bo Nam Bo', location: 'Bun Bo Nam Bo Restaurant', desc: 'Cold beef noodles tossed in a savory-sweet Southern sauce — incredibly addictive', cost: 70000 },
      { title: 'Grilled Ribs & Craft Beer', location: 'Quan Ut Ut BBQ', desc: 'HCMC\'s most popular American-style BBQ restaurant', cost: 350000, booking: true },
    ],
    dinners: [
      { title: 'Open Garden Vietnamese Dinner', location: 'Nha Hang Ngon', desc: 'Open-air garden restaurant serving the full spectrum of Vietnamese classics', cost: 400000 },
      { title: 'Michelin-Recognised Vietnamese', location: 'Anan Saigon', desc: 'Michelin Bib Gourmand — inventive Vietnamese fusion cuisine', cost: 700000, booking: true },
    ],
    transports: [
      { title: 'Grab Taxi', location: 'HCMC city', desc: 'Most convenient transport option — far cheaper than regular metered taxis', cost: 100000 },
      { title: 'Open-Top Hop-On Hop-Off Bus', location: 'Key city landmarks', desc: 'Open-top double-decker bus covering major sights — 1-day pass', cost: 200000 },
    ],
    insights: [
      'Avoid being outside from 12–3pm — it is extremely hot. Plan indoor sightseeing for that window',
      'Mekong Delta tours must be pre-booked in peak season — they fill up fast',
      'Install the Grab app before you arrive — significantly cheaper than street taxis',
    ],
    warnings: [
      '⚠️ Motorbike bag-snatching is common — keep bags in front and phones out of sight',
      '⚠️ Street food hygiene: avoid dishes that have been sitting in the heat for a long time',
      '⚠️ Daytime temperatures regularly exceed 35°C — sunscreen and a hat are essential',
    ],
    budgetPerDay: { budget: 320000, medium: 650000, luxury: 1300000 },
  },
  '푸꾸옥': {
    cover: 'https://images.unsplash.com/photo-1540202404-a2f29b0a8f96?w=800',
    weather: ['Clear sunny 30°C ☀️', 'Sunny 29°C ☀️ — Excellent snorkelling conditions', 'Light breeze 28°C 🌤', 'Sunny 31°C ☀️', 'Brief shower 27°C 🌦'],
    dayThemes: ['Arrival & North Beach Exploration', 'VinWonders Theme Park Day', 'Island Snorkelling & South Beaches', 'Pepper Farm & Temple Tour', 'Leisure Morning & Departure'],
    morningAttractions: [
      { title: 'Sao Beach', location: 'Southern Phu Quoc', desc: 'Powdery white sand and crystal-clear turquoise water — ranked among Vietnam\'s finest beaches', cost: 0, img: 'https://images.unsplash.com/photo-1540202404-a2f29b0a8f96?w=600', booking: false },
      { title: 'VinWonders Theme Park', location: 'Hon Tre Island, Phu Quoc', desc: 'Southeast Asia\'s biggest theme park — exhilarating water rides and roller coasters', cost: 900000, img: 'https://images.unsplash.com/photo-1555351179-11c9680c497b?w=600', tips: 'Get there at opening (9am) for the shortest queues of the day', booking: true },
      { title: 'An Thoi Islands Snorkelling', location: 'An Thoi Archipelago', desc: 'Boat tour visiting 15 islands with stunning coral reefs and tropical fish', cost: 500000, tips: '4-hour trip. January–April offers the best underwater visibility', booking: true },
    ],
    afternoonAttractions: [
      { title: 'Phu Quoc Pepper Farm', location: 'Kien Giang Pepper Farm', desc: 'See the world\'s most prized pepper in its natural environment — and buy some to take home', cost: 50000, booking: false },
      { title: 'Duong Dong Night Market', location: 'Duong Dong, Phu Quoc', desc: 'Phu Quoc\'s main market — grilled seafood, exotic fruits, and handmade souvenirs', cost: 0, booking: false },
    ],
    eveningAttractions: [
      { title: 'Sunset Cocktail on Long Beach', location: 'Long Beach, Phu Quoc', desc: 'Watch the sky blaze crimson over the sea while sipping a chilled island cocktail', cost: 150000, booking: false },
      { title: 'Night Market Seafood BBQ', location: 'Duong Dong Night Market', desc: 'Choose live seafood from the display and have it grilled on the spot — astonishingly fresh', cost: 400000, booking: false },
    ],
    breakfasts: [
      { title: 'Banh Mi & Tropical Fruit Plate', location: 'Near your hotel', desc: 'Start the day with a freshly made baguette sandwich and a colourful tropical fruit platter', cost: 50000 },
      { title: 'Beachside Breakfast', location: 'Beachside café', desc: 'Eggs Benedict served to the soundtrack of gentle waves on the shore', cost: 120000 },
    ],
    lunches: [
      { title: 'Crab Fried Rice (Com Ghe)', location: 'Cua Bien Restaurant', desc: 'Generous heaping of Phu Quoc\'s signature crab fried rice — local favourite', cost: 120000 },
      { title: 'Pho & Banh Xeo', location: 'Local restaurant, Duong Dong', desc: 'Good old Vietnamese food at real local prices', cost: 70000 },
    ],
    dinners: [
      { title: 'Lobster & Seafood Grill', location: 'Ganesh Seafood Restaurant', desc: 'Live lobster, tiger prawns, and squid — grilled to order, outrageously fresh', cost: 600000 },
      { title: 'Resort Fine Dining', location: 'Resort beachfront restaurant', desc: 'Sit on a sea-view terrace and dine in style as the tropical sun sets', cost: 800000, booking: true },
    ],
    transports: [
      { title: 'Electric Scooter Rental', location: 'Duong Dong town center', desc: 'Best way to freely explore the island — available all day for ₫180,000', cost: 180000 },
      { title: 'Grab Taxi', location: 'Duong Dong to Airport', desc: 'Airport transfers and inter-town trips', cost: 120000 },
    ],
    insights: [
      'November–April is the dry season — rainy season (May–Oct) brings poor snorkelling visibility',
      'VinWonders tickets can be bought online at a discount',
      'Duong Dong Night Market operates 6pm–10pm daily',
    ],
    warnings: [
      '⚠️ Never step on coral — it is a protected marine ecosystem',
      '⚠️ Always wear a life jacket during water sports activities',
      '⚠️ Snorkelling tours may be cancelled during the rainy season — build flexibility into your schedule',
    ],
    budgetPerDay: { budget: 350000, medium: 700000, luxury: 1500000 },
  },
  '하롱베이': {
    cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    weather: ['Clear 26°C ☀️ — Ideal cruising weather', 'Misty 24°C 🌫 — Hauntingly beautiful', 'Clear 27°C ☀️', 'Light wind 25°C 🌤', 'Clear 26°C ☀️'],
    dayThemes: ['Hanoi Departure & Ha Long Boarding', 'Kayaking & Cave Adventure', 'Ti Top Island & Pearl Farm', 'Sunrise Cruise & Return to Hanoi'],
    morningAttractions: [
      { title: 'Ha Long Bay Cruise Boarding', location: 'Hanoi → Bai Chay Port', desc: '4-hour bus transfer, then board your cruise ship and sail into Ha Long\'s limestone seascape', cost: 1500000, img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600', tips: 'Choose a minimum 3-star cruise for a comfortable experience', booking: true },
      { title: 'Sung Sot Cave (Surprise Cave)', location: 'Ha Long Bay', desc: 'The bay\'s largest cave — dramatic stalactites lit up in vivid colours deep underground', cost: 0, tips: 'Included in cruise activity programme', booking: false },
      { title: 'Kayaking Through Limestone Cliffs', location: 'Luon Cave Area, Ha Long Bay', desc: 'Paddle your own kayak through narrow passages between towering limestone pillars', cost: 200000, booking: false },
    ],
    afternoonAttractions: [
      { title: 'Ti Top Island Hike & Swimming', location: 'Ti Top Island, Ha Long Bay', desc: 'Climb the steps to the summit viewpoint for a full panorama of the bay, then cool off swimming', cost: 50000, booking: false },
      { title: 'Pearl Farm Visit', location: 'Pearl Island, Ha Long Bay', desc: 'Watch the pearl cultivation process up close and browse the jewellery at the gift shop', cost: 0, booking: false },
    ],
    eveningAttractions: [
      { title: 'Cruise Seafood Dinner Under the Stars', location: 'Cruise dining deck', desc: 'Four-course seafood dinner surrounded by the silhouettes of Ha Long Bay at night', cost: 0, tips: 'Included in cruise package', booking: false },
      { title: 'Squid Fishing from the Deck', location: 'Cruise deck, Ha Long Bay', desc: 'Try catching squid from the boat deck after 9pm — a fun and memorable evening activity', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: 'Cruise Breakfast Buffet', location: 'Cruise dining room', desc: 'Wake up to breakfast on the water — rice porridge, pho, fresh fruit, and an egg station', cost: 0 },
    ],
    lunches: [
      { title: 'Cruise Lunch on Deck', location: 'Cruise deck', desc: 'Five Vietnamese dishes enjoyed with panoramic views of Ha Long Bay', cost: 0 },
    ],
    dinners: [
      { title: 'Cruise Seafood Dinner', location: 'Cruise restaurant', desc: 'Freshly caught prawns, clams, and fish — grilled simply to let the quality speak for itself', cost: 0 },
    ],
    transports: [
      { title: 'Hanoi to Ha Long Bay Bus', location: 'My Dinh Bus Terminal, Hanoi', desc: '4-hour comfortable bus transfer. Check if your cruise package includes this transport', cost: 300000, booking: true },
    ],
    insights: [
      'March–May and September–November have the best weather conditions',
      'Always compare cruise packages carefully and check what\'s actually included',
      'Select a cruise that provides free kayaks — it greatly enhances the experience',
    ],
    warnings: [
      '⚠️ Summer typhoons (June–August) can cause tour cancellations',
      '⚠️ Budget cruises often have poor facilities and food — do your research',
      '⚠️ Pack seasickness tablets just in case',
    ],
    budgetPerDay: { budget: 500000, medium: 900000, luxury: 2000000 },
  },
  '사파': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['Cool 15°C 🌥 — Perfect trekking conditions', 'Misty 12°C 🌫 — Magical terraced rice fields', 'Sunny 18°C ☀️', 'Possible rain 13°C 🌧 — Waterproof jacket essential', 'Cool 14°C 🌤'],
    dayThemes: ['Sapa Arrival & Ta Van Village', 'Fansipan Summit Conquest', 'Y Linh Ho Valley Trekking', 'Ethnic Minority Village Experience', 'Return to Hanoi'],
    morningAttractions: [
      { title: 'Fansipan Cable Car', location: 'Fansipan Viewpoint, Sapa', desc: 'Reach Indochina\'s highest peak (3,143m) by cable car — breathtaking panoramic views', cost: 700000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: 'Best visibility before 10am before cloud cover builds up', booking: true },
      { title: 'Ta Van Village Trek', location: 'Ta Van Village, Sapa', desc: '4-hour guided trek through Muong Hoa Valley with spectacular terraced rice field scenery', cost: 200000, tips: 'A local guide is strongly recommended — the paths are complex', booking: true },
    ],
    afternoonAttractions: [
      { title: 'H\'mong Hill Tribe Market', location: 'Sapa traditional market', desc: 'Browse vibrant traditional costumes and handcrafted goods made by local ethnic minorities', cost: 0, booking: false },
      { title: 'Silver Waterfall (Thac Bac)', location: 'Sapa waterfall area', desc: 'A majestic mountain waterfall — swimming possible in the summer months', cost: 20000, booking: false },
    ],
    eveningAttractions: [
      { title: 'Homestay Dinner Experience', location: 'H\'mong family homestay', desc: 'Share a traditional dinner with an ethnic minority household — the true spirit of Sapa', cost: 200000, booking: true },
    ],
    breakfasts: [
      { title: 'Sapa Egg Bread', location: 'Sapa town lanes', desc: 'Wood-fired egg bun from a street cart — a beloved local morning snack', cost: 20000 },
      { title: 'Rice Porridge (Chao)', location: 'Local restaurant', desc: 'Warming rice porridge to start a crisp mountain morning the right way', cost: 40000 },
    ],
    lunches: [
      { title: 'Trail Bento Box', location: 'Outdoors (prepared by guide)', desc: 'Home-packed lunch eaten amid stunning mountain scenery mid-trek', cost: 100000 },
    ],
    dinners: [
      { title: 'Black Pig BBQ', location: 'Traditional Sapa restaurant', desc: 'Sapa\'s famous black pig roast — a regional speciality that should not be missed', cost: 250000 },
    ],
    transports: [
      { title: 'Hanoi to Sapa Overnight Train', location: 'Hanoi Railway Station', desc: '8-hour sleeper train — travel and sleep simultaneously to save time', cost: 400000, booking: true },
    ],
    insights: [
      'September–November is golden season — terraced fields turn a breathtaking golden hue',
      'Head to Fansipan early to catch clear skies before the clouds roll in',
      'A full waterproof jacket and sturdy hiking boots are absolute essentials',
    ],
    warnings: [
      '⚠️ Trekking paths are steep and often muddy — proper hiking boots required',
      '⚠️ Winter temperatures (Dec–Feb) can drop below 0°C — come very well prepared',
      '⚠️ Altitude sickness can occur at 3,143m — stay hydrated and take it slowly',
    ],
    budgetPerDay: { budget: 280000, medium: 500000, luxury: 900000 },
  },
  '나트랑': {
    cover: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600',
    weather: ['Sunny 32°C ☀️ — Peak beach season', 'Sunny 31°C ☀️', 'Light sea breeze 30°C 🌤', 'Sunny 33°C ☀️', 'Brief shower 29°C 🌦'],
    dayThemes: ['Nha Trang Beach & Mud Spa', 'Island Hopping Adventure', 'Po Nagar Cham Towers & City Tour', 'VinPearl Land & Aquarium', 'Leisure Morning & Departure'],
    morningAttractions: [
      { title: 'Nha Trang City Beach', location: 'Nha Trang beachfront', desc: '6km of golden shoreline — rent a sunbed and swim in the warm clear sea', cost: 0, img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600', booking: false },
      { title: 'Island Hopping Tour (4 Islands)', location: 'Nha Trang Harbour', desc: 'Fun boat day visiting Mot Island, Bamboo Island, and Moon Island with snorkelling', cost: 450000, tips: 'Confirm whether snorkel gear and lunch are included in the price', booking: true },
      { title: 'Po Nagar Cham Towers', location: 'Po Nagar, Nha Trang', desc: '2nd-century Cham Kingdom temple complex — an extraordinary glimpse of ancient history', cost: 22000, booking: false },
    ],
    afternoonAttractions: [
      { title: 'Thap Ba Mud Bath (I-Resort)', location: 'Thap Ba Hot Springs, Nha Trang', desc: 'Soak in natural volcanic mineral mud — great for skin health and deeply relaxing', cost: 250000, tips: 'Weekday mornings are the least crowded time to visit', booking: true },
      { title: 'VinPearl Land', location: 'Hon Tre Island, Nha Trang', desc: 'Take the cable car to VinPearl Island for a full day of theme park, water park, and aquarium', cost: 900000, booking: true },
    ],
    eveningAttractions: [
      { title: 'Nha Trang Night Market', location: 'Le Thanh Tong Night Market', desc: 'Local evening market from 5pm — grilled seafood, tropical fruit, and snacks', cost: 0, booking: false },
      { title: 'Sailing Club Rooftop Bar', location: 'Sailing Club, Nha Trang Beach', desc: 'Cocktails and live music right on the beach under the stars', cost: 200000, booking: false },
    ],
    breakfasts: [
      { title: 'Banh Mi & Coconut Coffee', location: 'Nha Trang city', desc: 'Vietnamese drip coffee poured over silky coconut cream — the Nha Trang way to start the day', cost: 45000 },
      { title: 'Pho & Bun Bo', location: 'Local restaurant', desc: 'Hearty Hue-style beef noodle soup — a robust and satisfying morning fuel', cost: 55000 },
    ],
    lunches: [
      { title: 'Sea-View Seafood Lunch', location: 'Beachside restaurant', desc: 'Grilled tiger prawns and lobster enjoyed with an ocean backdrop', cost: 350000 },
    ],
    dinners: [
      { title: 'Vietnamese Hot Pot (Lau Hai San)', location: 'Nha Trang harbour restaurant', desc: 'Communal bubbling broth loaded with fresh seafood and crisp vegetables — perfect for groups', cost: 300000 },
    ],
    transports: [
      { title: 'Air-Conditioned City Bus', location: 'Nha Trang city routes', desc: 'Affordable and comfortable local buses serving major routes', cost: 20000 },
      { title: 'Grab Taxi', location: 'Nha Trang city', desc: 'Convenient point-to-point travel around the city', cost: 80000 },
    ],
    insights: [
      'January–August is beach season — September to December brings the rainy season',
      'Island hopping tours should ideally be booked the day before',
      'The mud spa is least crowded on weekday mornings before 10am',
    ],
    warnings: [
      '⚠️ Jellyfish alert in July–September — always check the beach warning flags before swimming',
      '⚠️ Only book island boat tours with reputable operators that have proper safety equipment',
      '⚠️ VinPearl Land is a full-day commitment — pace yourself and manage your energy',
    ],
    budgetPerDay: { budget: 300000, medium: 620000, luxury: 1300000 },
  },
  '후에': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['Overcast 27°C 🌥', 'Sunny 29°C ☀️', 'Possible rain 25°C 🌦', 'Sunny 28°C ☀️', 'Overcast 26°C 🌥'],
    dayThemes: ['Hue Citadel & Imperial Palace', 'Royal Tombs Cycling Tour', 'Perfume River Boat & Thien Mu Pagoda', 'Royal Cuisine Food Tour', 'Transfer to Da Nang'],
    morningAttractions: [
      { title: 'Hue Citadel & Imperial City', location: 'Hue Royal Citadel, Central Vietnam', desc: 'The last imperial capital of Vietnam — architecturally dubbed the Vietnamese Forbidden City', cost: 200000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: 'Rent an audio guide at the entrance for a richer historical experience', booking: false },
      { title: 'Minh Mang Royal Tomb', location: '12km south of Hue', desc: 'The most majestic and largest of the royal tombs — beautifully designed and serene', cost: 150000, booking: false },
      { title: 'Thien Mu Pagoda', location: 'West bank of the Perfume River', desc: 'Seven-story tower standing above the Perfume River — the spiritual symbol of Hue', cost: 0, tips: 'Arriving by boat makes the approach even more magical', booking: false },
    ],
    afternoonAttractions: [
      { title: 'Royal Tombs Cycling Tour', location: 'Hue countryside', desc: 'Cycle past three imperial tombs — Khai Dinh, Minh Mang, and Tu Duc — in a single afternoon', cost: 350000, booking: true },
      { title: 'Perfume River Sunset Cruise', location: 'Perfume River Pier, Hue', desc: 'One-hour boat cruise as the river turns golden in the afternoon light', cost: 150000, booking: false },
    ],
    eveningAttractions: [
      { title: 'Hue Night Market', location: 'Tran Hung Dao Street', desc: 'Nightly street market with Hue street food specialities, local crafts, and souvenirs', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: 'Banh Cuon Hue Style', location: 'Local restaurant', desc: 'Hue-style steamed rice crepes served with a fragrant sweet shrimp dipping sauce', cost: 50000 },
      { title: 'Banh Beo & Banh Nam Platter', location: 'Quan Banh Beo Ba Cu', desc: 'A tasting platter of Hue\'s beloved miniature rice cakes — remarkable flavour variety', cost: 60000 },
    ],
    lunches: [
      { title: 'Bun Bo Hue (Spicy Beef Noodle Soup)', location: 'Bun Bo Hue O Hen', desc: 'The original Hue beef noodle soup — spicy, complex, and unlike any version you\'ll find elsewhere', cost: 60000, tips: 'This is the authentic bun bo — far more complex than Hanoi or HCMC interpretations' },
    ],
    dinners: [
      { title: 'Royal Imperial Dinner', location: 'Y Thao Garden Restaurant', desc: 'Nguyen Dynasty imperial recipes recreated with elegance, served with live traditional music', cost: 600000, tips: 'Advance booking is essential. Traditional court costumes can be worn for photos', booking: true },
      { title: 'Ca Ri Ga (Hue Chicken Curry)', location: 'Local restaurant', desc: 'Fragrant coconut milk chicken curry — mildly spiced Hue style', cost: 100000 },
    ],
    transports: [
      { title: 'Cyclo Tour', location: 'Hue city center', desc: 'A gentle pedicab tour through Hue\'s charming old streets and colonial lanes', cost: 100000 },
      { title: 'Bicycle Rental', location: 'Near your accommodation', desc: 'Hue is an exceptionally pleasant city to explore entirely by bicycle', cost: 60000 },
    ],
    insights: [
      'Hue Citadel was designated a UNESCO World Heritage Site in 1993',
      'Bun Bo Hue in its authentic form can only truly be tasted here in Hue itself',
      'The three main royal tombs are close enough together to visit all by bicycle in one day',
    ],
    warnings: [
      '⚠️ October–November is the rainy season in Hue — always carry an umbrella',
      '⚠️ Some areas of the Citadel are still under restoration — check the posted notices on-site',
      '⚠️ Dress modestly when visiting royal tombs — no sleeveless tops or shorts',
    ],
    budgetPerDay: { budget: 250000, medium: 480000, luxury: 950000 },
  },
};
"""

NEW_GET_PROFILE = """function getProfile(destination: string, language: string = 'ko'): DestinationProfile {
  const normalized = destination.toLowerCase().trim();
  const key = (DEST_ALIASES[normalized] ?? destination) as DestKey;
  if (language === 'ko') {
    return DEST_PROFILES[key] ?? DEST_PROFILES['다낭'];
  }
  return DEST_PROFILES_EN[key] ?? DEST_PROFILES_EN['다낭'];
}
"""

NEW_MOCK_ITINERARIES_EN = """
const mockItinerariesEn: Trip[] = [
  {
    id: 'trip-1',
    title: 'Da Nang & Hoi An — Perfect 5-Day Trip',
    destination: 'Da Nang, Hoi An',
    startDate: '2026-04-15',
    endDate: '2026-04-19',
    duration: 5,
    coverImage: 'https://images.unsplash.com/photo-1552201133-08fd8e8c0fd6?w=800',
    status: 'planned',
    totalEstimatedCost: 1500000,
    currency: 'KRW',
    travelStyle: 'cultural',
    travelers: 'couple',
    createdAt: '2026-03-10T08:00:00Z',
    isAIGenerated: true,
    aiInsights: [
      'April is Da Nang\'s dry season — ideal travel weather',
      'Golden Bridge gets very crowded on weekends. Visit on a weekday morning',
      'Hoi An night market is best visited after 7pm',
    ],
    itinerary: [
      {
        day: 1,
        date: '2026-04-15',
        title: 'Arrival & Beach Relaxation',
        weatherNote: 'Sunny 30°C — Apply sunscreen',
        estimatedCost: 200000,
        activities: [
          {
            id: 'act-1-1',
            time: '14:00',
            duration: '1 hr',
            type: 'transport',
            title: 'Airport to Hotel Transfer',
            location: 'Da Nang International Airport → My Khe Beach',
            description: 'Relax in your pre-booked pickup car as you head to the hotel',
            estimatedCost: 350000,
            currency: 'VND',
            bookingRequired: true,
          },
          {
            id: 'act-1-2',
            time: '15:30',
            duration: '2 hrs',
            type: 'attraction',
            title: 'My Khe Beach Stroll',
            location: 'My Khe Beach, Da Nang',
            description: 'Unwind on one of Asia\'s finest beaches — golden sand and clear calm water',
            imageUrl: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600',
            estimatedCost: 0,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-1-3',
            time: '19:00',
            duration: '1.5 hrs',
            type: 'food',
            title: 'Seafood Restaurant Dinner',
            location: 'My Khe Seafood Restaurant',
            description: 'Enjoy fresh Vietnamese seafood at surprisingly affordable local prices',
            estimatedCost: 250000,
            currency: 'VND',
            tips: 'No reservation needed. Choose your seafood live from the tank.',
            bookingRequired: false,
          },
        ],
      },
      {
        day: 2,
        date: '2026-04-16',
        title: 'Ba Na Hills & Golden Bridge',
        weatherNote: 'Partly cloudy 27°C — Cable car operating normally',
        estimatedCost: 1200000,
        activities: [
          {
            id: 'act-2-1',
            time: '08:00',
            duration: '30 min',
            type: 'food',
            title: 'Hotel Breakfast or Banh Mi',
            location: 'Madam Khanh Banh Mi',
            description: 'Start the day with a local banh mi sandwich — a firm favourite with residents',
            estimatedCost: 50000,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-2-2',
            time: '09:00',
            duration: '6 hrs',
            type: 'attraction',
            title: 'Ba Na Hills & Golden Bridge',
            location: 'Ba Na Hills, Da Nang',
            description: 'Explore the world-famous Golden Bridge and the French village at the summit',
            imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
            estimatedCost: 750000,
            currency: 'VND',
            tips: 'Much quieter on weekdays. The summit is cool — bring a light jacket.',
            bookingRequired: true,
          },
        ],
      },
      {
        day: 3,
        date: '2026-04-17',
        title: 'Hoi An Ancient Town',
        weatherNote: 'Sunny 29°C — Perfect photography weather',
        estimatedCost: 500000,
        activities: [
          {
            id: 'act-3-1',
            time: '09:00',
            duration: '30 min',
            type: 'transport',
            title: 'Da Nang → Hoi An Transfer',
            location: 'Da Nang → Hoi An (approx. 30 min)',
            description: 'Travel by private car or Grab taxi — a scenic coastal drive',
            estimatedCost: 300000,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-3-2',
            time: '09:30',
            duration: '4 hrs',
            type: 'attraction',
            title: 'Hoi An Old Town Sightseeing',
            location: 'Hoi An Old Town',
            description: 'Walk the UNESCO World Heritage old town and visit its 5 historic sites',
            imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
            estimatedCost: 120000,
            currency: 'VND',
            tips: 'One ticket covers 5 attractions. Quietest right after sunrise.',
            bookingRequired: false,
          },
          {
            id: 'act-3-3',
            time: '19:30',
            duration: '2 hrs',
            type: 'attraction',
            title: 'Night Market & Lantern Floating',
            location: 'Thu Bon River, Hoi An',
            description: 'Float a glowing lantern on the river and wander the colorful night market',
            estimatedCost: 100000,
            currency: 'VND',
            bookingRequired: false,
          },
        ],
      },
    ],
  },
  {
    id: 'trip-2',
    title: 'Ha Long Bay Cruise — 2 Nights 3 Days',
    destination: 'Ha Long Bay',
    startDate: '2026-05-20',
    endDate: '2026-05-22',
    duration: 3,
    coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    status: 'draft',
    totalEstimatedCost: 800000,
    currency: 'KRW',
    travelStyle: 'adventure',
    travelers: 'friends',
    createdAt: '2026-03-08T10:00:00Z',
    isAIGenerated: true,
    aiInsights: [
      'May is one of Ha Long Bay\'s best months — clear skies and fewer tourists than summer',
      'Always choose a minimum 3-star cruise — budget options often disappoint',
    ],
    itinerary: [
      {
        day: 1,
        date: '2026-05-20',
        title: 'Hanoi Departure → Board the Cruise',
        weatherNote: 'Clear 26°C',
        estimatedCost: 300000,
        activities: [
          {
            id: 'act-a-1',
            time: '08:00',
            duration: '4 hrs',
            type: 'transport',
            title: 'Hanoi → Ha Long Bay Transfer',
            location: 'Hanoi Old Quarter',
            description: 'Comfortable bus transfer arriving at the cruise terminal in Ha Long',
            estimatedCost: 300000,
            currency: 'VND',
            bookingRequired: true,
          },
        ],
      },
    ],
  },
];

export function getMockItineraries(language: string): Trip[] {
  return language === 'ko' ? mockItineraries : mockItinerariesEn;
}
"""

# ── Patch logic ──────────────────────────────────────────────────────────────

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace old getProfile with DEST_ALIASES + DEST_PROFILES_EN + new getProfile
OLD_GET_PROFILE = """function getProfile(destination: string): DestinationProfile {
  const key = destination as DestKey;
  return DEST_PROFILES[key] ?? DEST_PROFILES['다낭'];
}"""

assert OLD_GET_PROFILE in content, "Could not find getProfile function!"
content = content.replace(OLD_GET_PROFILE, DEST_ALIASES_AND_EN + NEW_GET_PROFILE)

# 2. Update mockAIItineraryResponse signature and body
OLD_SIG = "export const mockAIItineraryResponse = (destination: string, duration: number, budget: 'budget' | 'medium' | 'luxury' = 'medium'): Trip => {"
NEW_SIG = "export const mockAIItineraryResponse = (destination: string, duration: number, budget: 'budget' | 'medium' | 'luxury' = 'medium', language: string = 'ko'): Trip => {"
assert OLD_SIG in content, "Could not find mockAIItineraryResponse signature!"
content = content.replace(OLD_SIG, NEW_SIG)

OLD_GET_P = "  const p = getProfile(destination);"
NEW_GET_P = "  const p = getProfile(destination, language);"
assert OLD_GET_P in content, "Could not find getProfile call!"
content = content.replace(OLD_GET_P, NEW_GET_P)

# 3. Replace hardcoded Korean duration strings with locale-aware versions
DURATION_REPLACEMENTS = [
    ("duration: '30분',\n      type: 'transport',", "duration: language === 'ko' ? '30분' : '30 min',\n      type: 'transport',"),
    ("duration: '2시간 30분',\n      type: 'attraction',\n      title: morning.title,", "duration: language === 'ko' ? '2시간 30분' : '2.5 hrs',\n      type: 'attraction',\n      title: morning.title,"),
    ("duration: '1시간',\n      type: 'food',\n      title: lunch.title,", "duration: language === 'ko' ? '1시간' : '1 hr',\n      type: 'food',\n      title: lunch.title,"),
    ("duration: '3시간',\n      type: 'attraction',\n      title: afternoon.title,", "duration: language === 'ko' ? '3시간' : '3 hrs',\n      type: 'attraction',\n      title: afternoon.title,"),
    ("duration: '1시간 30분',\n      type: 'free_time',", "duration: language === 'ko' ? '1시간 30분' : '1.5 hrs',\n      type: 'free_time',"),
    ("duration: '1시간',\n      type: 'attraction',\n      title: evening.title,", "duration: language === 'ko' ? '1시간' : '1 hr',\n      type: 'attraction',\n      title: evening.title,"),
    ("duration: '1시간 30분',\n      type: 'food',\n      title: dinner.title,", "duration: language === 'ko' ? '1시간 30분' : '1.5 hrs',\n      type: 'food',\n      title: dinner.title,"),
    ("duration: '1시간',\n      type: 'food',\n      title: breakfast.title,", "duration: language === 'ko' ? '1시간' : '1 hr',\n      type: 'food',\n      title: breakfast.title,"),
]
for old, new in DURATION_REPLACEMENTS:
    if old in content:
        content = content.replace(old, new)
    else:
        print(f"WARNING: Could not find: {repr(old[:60])}")

# 4. Replace free time activity Korean strings
OLD_FREE = """      title: '자유 시간 & 휴식',
      location: '숙소 또는 인근',
      description: '오후 피로를 풀고 저녁 준비 — 카페에서 현지 커피 한 잔',"""
NEW_FREE = """      title: language === 'ko' ? '자유 시간 & 휴식' : 'Free Time & Rest',
      location: language === 'ko' ? '숙소 또는 인근' : 'Hotel or nearby',
      description: language === 'ko' ? '오후 피로를 풀고 저녁 준비 — 카페에서 현지 커피 한 잔' : 'Relax and recharge before dinner — enjoy a local coffee at a nearby café',"""
if OLD_FREE in content:
    content = content.replace(OLD_FREE, NEW_FREE)
else:
    print(f"WARNING: Could not find free time activity strings")

# 5. Replace trip title generation
OLD_TITLE = "    title: `AI 추천 ${destination} ${duration}박 ${duration + 1}일`,"
NEW_TITLE = "    title: language === 'ko' ? `AI 추천 ${destination} ${duration}박 ${duration + 1}일` : `AI-Planned ${duration}-Day ${destination} Trip`,"
if OLD_TITLE in content:
    content = content.replace(OLD_TITLE, NEW_TITLE)
else:
    print(f"WARNING: Could not find trip title string")

# 6. Add mockItinerariesEn and getMockItineraries before the Rich AI section
RICH_AI_MARKER = "// ── Rich AI Itinerary Engine ──────────────────────────────────────────────────"
assert RICH_AI_MARKER in content, "Could not find Rich AI Engine marker!"
content = content.replace(RICH_AI_MARKER, NEW_MOCK_ITINERARIES_EN + "\n" + RICH_AI_MARKER)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: itineraries.ts patched successfully!")
print(f"New file size: {len(content)} chars, {content.count(chr(10))+1} lines")
