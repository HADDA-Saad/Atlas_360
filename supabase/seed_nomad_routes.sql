-- Atlas 360 — Nomad Tier Seed Data
-- 7 new itineraries (routes 4–10) with 5 stops each = 35 location rows
-- All itineraries have tier = 'nomad' (gated behind paywall)
-- Run this in the Supabase SQL Editor AFTER the existing seed.sql

-- ============================================
-- Itinerary 4: Sahara Desert Gateway
-- Region: Merzouga | Duration: 3 days
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days, tier)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Sahara Desert Gateway',
  'Journey from dramatic gorges to golden dunes. Cross the fossil-rich badlands of Erfoud, explore the last Saharan trading post of Rissani, and spend a night under the stars at a desert camp in Erg Chebbi.',
  'Merzouga',
  3,
  'nomad'
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index, day_number, duration_minutes, transport_to_next, transport_duration_minutes, best_time, tips, category) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Todra Gorge', 'A dramatic 300-meter canyon carved through the eastern High Atlas, popular with hikers and rock climbers.', 31.5893, -5.5956, 1, 1, 120, 'Taxi / shared minivan', 90, 'Morning', 'Wear sturdy shoes. The gorge is narrowest and most photogenic in the morning when sunlight hits the canyon walls.', 'nature'),
  ('44444444-4444-4444-4444-444444444444', 'Erfoud Fossil Beds', 'A fossil-rich region where 350-million-year-old marine fossils are polished into art and furniture.', 31.4311, -4.2281, 2, 1, 90, 'Taxi', 60, 'Afternoon', 'Visit a local fossil workshop to see artisans cut and polish orthoceras and ammonite fossils.', 'museum'),
  ('44444444-4444-4444-4444-444444444444', 'Rissani Souk', 'The last major trading post before the Sahara, with an authentic market selling dates, spices, and livestock.', 31.2819, -4.2750, 3, 2, 90, 'Taxi', 45, 'Morning (market day: Tue/Thu/Sun)', 'The souk is busiest on market days. Try the local madfouna — Berber pizza baked in sand ovens.', 'market'),
  ('44444444-4444-4444-4444-444444444444', 'Erg Chebbi Dunes', 'Towering orange sand dunes reaching up to 150 meters, the most iconic Saharan landscape in Morocco.', 31.1499, -3.9672, 4, 2, 180, 'Camel trek', 60, 'Sunset', 'Book a camel trek for sunset — the dunes glow brilliant orange. Bring a scarf to cover your face from sand.', 'nature'),
  ('44444444-4444-4444-4444-444444444444', 'Merzouga Desert Camp', 'Traditional Berber camp in the dunes offering stargazing, drum circles, and sunrise views.', 31.0982, -3.9932, 5, 3, 600, NULL, NULL, 'Sunrise', 'Wake before dawn to climb a nearby dune for sunrise — the silence of the Sahara at dawn is unforgettable.', 'landmark');

-- ============================================
-- Itinerary 5: Essaouira Coastal Escape
-- Region: Essaouira | Duration: 2 days
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days, tier)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Essaouira Coastal Escape',
  'A two-day wind-swept adventure along Morocco''s Atlantic coast. Explore the fortified port town of Essaouira, walk its long golden beach, discover argan oil traditions, and enjoy some of the freshest seafood in the country.',
  'Essaouira',
  2,
  'nomad'
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index, day_number, duration_minutes, transport_to_next, transport_duration_minutes, best_time, tips, category) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Skala du Port', 'The 18th-century sea bastion with bronze cannons overlooking the Atlantic and the Mogador islands.', 31.5085, -9.7700, 1, 1, 60, 'Walk', 10, 'Morning', 'The ramparts offer the best ocean views in the city. Arrive early for fewer crowds and dramatic light.', 'landmark'),
  ('55555555-5555-5555-5555-555555555555', 'Essaouira Medina', 'A UNESCO-listed walled medina with whitewashed buildings, blue shutters, and art galleries on every corner.', 31.5130, -9.7700, 2, 1, 120, 'Walk', 5, 'Late morning', 'The medina is compact and hard to get truly lost in. Look for Gnaoua music shops and local thuya woodwork.', 'landmark'),
  ('55555555-5555-5555-5555-555555555555', 'Essaouira Beach', 'A vast sweep of golden sand stretching south of the medina, famous for wind and kite surfing.', 31.5050, -9.7650, 3, 1, 120, 'Walk', 20, 'Afternoon', 'The wind picks up by afternoon — perfect for surfing but bring layers. Camel rides along the shore are available.', 'nature'),
  ('55555555-5555-5555-5555-555555555555', 'Argan Oil Cooperative', 'A women-run cooperative where argan nuts are hand-cracked and cold-pressed into culinary and cosmetic oil.', 31.4543, -9.7063, 4, 2, 60, 'Taxi', 25, 'Morning', 'Buy directly from the cooperative to support local women. The culinary oil is nutty and incredible on salads.', 'market'),
  ('55555555-5555-5555-5555-555555555555', 'Place Moulay Hassan', 'The main square of Essaouira, surrounded by cafes and the fresh-catch seafood grills of the port.', 31.5120, -9.7695, 5, 2, 90, NULL, NULL, 'Evening', 'Choose your fish at the port grills and have it cooked to order. Sardines and prawns are the local specialty.', 'food');

-- ============================================
-- Itinerary 6: Imperial Rabat
-- Region: Rabat | Duration: 2 days
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days, tier)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'Imperial Rabat',
  'Discover Morocco''s elegant capital. From the iconic Hassan Tower to the cliff-top Kasbah des Oudayas, Rabat blends French colonial grandeur with deep Moorish heritage along the banks of the Bouregreg river.',
  'Rabat',
  2,
  'nomad'
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index, day_number, duration_minutes, transport_to_next, transport_duration_minutes, best_time, tips, category) VALUES
  ('66666666-6666-6666-6666-666666666666', 'Hassan Tower', 'The unfinished 12th-century minaret of an incomplete mosque, standing as a symbol of Rabat alongside 200 remaining columns.', 34.0243, -6.8221, 1, 1, 60, 'Walk', 15, 'Morning', 'The site is free to enter. The contrast of the red sandstone tower against the white columns is most photogenic in morning light.', 'landmark'),
  ('66666666-6666-6666-6666-666666666666', 'Kasbah des Oudayas', 'A 12th-century fortified kasbah perched on a cliff above the Atlantic, with narrow blue-and-white streets and the Andalusian Gardens.', 34.0326, -6.8373, 2, 1, 90, 'Walk', 20, 'Late morning', 'Don''t miss the Andalusian Garden inside the kasbah walls — a tranquil oasis with fountains and citrus trees.', 'landmark'),
  ('66666666-6666-6666-6666-666666666666', 'Mohammed V Mausoleum', 'The ornate resting place of King Mohammed V and his sons, guarded by royal horsemen in traditional dress.', 34.0239, -6.8225, 3, 1, 45, 'Walk', 10, 'Afternoon', 'Visitors must dress modestly. The carved marble and zellige interior is among the finest craftsmanship in Morocco.', 'religious'),
  ('66666666-6666-6666-6666-666666666666', 'Chellah Necropolis', 'A medieval fortified necropolis built over Roman ruins, now peacefully overgrown and inhabited by nesting storks.', 33.9922, -6.8156, 4, 2, 90, 'Taxi', 15, 'Morning', 'Explore the Roman ruins beneath the Islamic necropolis. The resident stork colony nests atop the minaret — a surreal sight.', 'landmark'),
  ('66666666-6666-6666-6666-666666666666', 'Rabat Medina', 'A calmer, more manageable medina than Fes or Marrakech, offering quality leather goods, textiles, and local produce.', 34.0271, -6.8352, 5, 2, 120, NULL, NULL, 'Late morning', 'Prices are more reasonable here than in tourist-heavy medinas. Rue des Consuls is the main artisan shopping street.', 'market');

-- ============================================
-- Itinerary 7: Tangier Crossroads
-- Region: Tangier | Duration: 2 days
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days, tier)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'Tangier Crossroads',
  'Where Africa meets Europe. Tangier has drawn artists, writers, and spies for centuries. Explore the mythical caves, the bustling medina, and the café culture that inspired the Beats and the Rolling Stones.',
  'Tangier',
  2,
  'nomad'
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index, day_number, duration_minutes, transport_to_next, transport_duration_minutes, best_time, tips, category) VALUES
  ('77777777-7777-7777-7777-777777777777', 'Cap Spartel', 'The northwestern-most point of Africa, where the Atlantic Ocean meets the Mediterranean Sea at a dramatic lighthouse.', 35.7928, -5.9200, 1, 1, 60, 'Taxi', 15, 'Morning', 'On clear days you can see the coast of Spain. Combine with the Hercules Caves visit since they are nearby.', 'viewpoint'),
  ('77777777-7777-7777-7777-777777777777', 'Hercules Caves', 'Legendary sea caves with a map-of-Africa-shaped opening to the ocean, linked to Greek mythology.', 35.7614, -5.9381, 2, 1, 45, 'Taxi', 25, 'Late morning', 'The famous opening is best photographed when the tide is mid-level. Avoid the busiest midday tourist rush.', 'nature'),
  ('77777777-7777-7777-7777-777777777777', 'Tangier Medina', 'A chaotic, colorful maze of streets dropping steeply toward the port, filled with history and literary ghosts.', 35.7850, -5.8120, 3, 1, 120, 'Walk', 5, 'Afternoon', 'Visit the American Legation Museum — the first property the U.S. government ever owned abroad.', 'landmark'),
  ('77777777-7777-7777-7777-777777777777', 'Petit Socco', 'A tiny square in the heart of the medina, once a hub for Beat writers like Kerouac and Burroughs.', 35.7870, -5.8119, 4, 2, 60, 'Walk', 5, 'Morning', 'Sit at Café Central where the Beats used to gather. The people-watching here is unmatched.', 'landmark'),
  ('77777777-7777-7777-7777-777777777777', 'Grand Socco', 'The large square connecting the medina to the ville nouvelle, surrounded by cinemas, markets, and the Mendoubia gardens.', 35.7838, -5.8148, 5, 2, 60, NULL, NULL, 'Late afternoon', 'The nearby Mendoubia gardens have 800-year-old trees. The Thursday/Sunday produce market on the square is worth exploring.', 'market');

-- ============================================
-- Itinerary 8: High Atlas Peaks
-- Region: Imlil / Toubkal | Duration: 3 days
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days, tier)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'High Atlas Peaks',
  'Trek through North Africa''s highest mountains. Start from the Berber village of Imlil, hike through walnut groves and terraced farms, and ascend toward the Toubkal summit — the rooftop of Morocco at 4,167 meters.',
  'Imlil',
  3,
  'nomad'
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index, day_number, duration_minutes, transport_to_next, transport_duration_minutes, best_time, tips, category) VALUES
  ('88888888-8888-8888-8888-888888888888', 'Imlil Village', 'The main gateway to Toubkal National Park, a traditional Berber village at 1,740m surrounded by walnut and apple orchards.', 31.1361, -7.9192, 1, 1, 120, 'Walk / mule', 90, 'Morning', 'Hire a local guide and mule for your pack. Stay at a traditional gîte for the authentic mountain experience.', 'nature'),
  ('88888888-8888-8888-8888-888888888888', 'Aroumd Berber Village', 'A remote hilltop Berber village at 1,940m with terraced gardens and panoramic Atlas views.', 31.1250, -7.9333, 2, 1, 90, 'Walk', 120, 'Late morning', 'The village has a community cooperative selling handmade crafts. Tea with locals is a cherished custom here.', 'landmark'),
  ('88888888-8888-8888-8888-888888888888', 'Toubkal Refuge', 'A mountain refuge at 3,207m serving as base camp for the Toubkal summit attempt.', 31.0644, -7.9147, 3, 2, 180, 'Walk', 180, 'Afternoon arrival', 'Book a bed in advance during peak season (April–June, September–October). Bring warm layers — nights drop below freezing.', 'landmark'),
  ('88888888-8888-8888-8888-888888888888', 'Sidi Chamharouch', 'A sacred shrine at 2,310m beside a river, where Berber pilgrims gather year-round.', 31.1028, -7.9181, 4, 3, 45, 'Walk', 90, 'Morning', 'This is a sacred site — photographs of the shrine itself may not be welcome. Respect local customs.', 'religious'),
  ('88888888-8888-8888-8888-888888888888', 'Azzaden Valley', 'A stunning parallel valley with fewer trekkers, offering isolation, Berber villages, and wildflower meadows.', 31.1000, -7.9700, 5, 3, 180, NULL, NULL, 'All day', 'This alternative descent avoids retracing your steps. Arrange a mule to meet you at the trailhead for the ride back to Imlil.', 'nature');

-- ============================================
-- Itinerary 9: Ouarzazate & Kasbahs
-- Region: Ouarzazate | Duration: 2 days
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days, tier)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Ouarzazate & Kasbahs',
  'The Hollywood of Africa. Explore the mud-brick fortresses of the Draa Valley, walk through the UNESCO-listed Ait Benhaddou, and visit the film studios where Gladiator and Game of Thrones were shot.',
  'Ouarzazate',
  2,
  'nomad'
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index, day_number, duration_minutes, transport_to_next, transport_duration_minutes, best_time, tips, category) VALUES
  ('99999999-9999-9999-9999-999999999999', 'Ait Benhaddou', 'A UNESCO World Heritage ksar (fortified village) of red clay, used as a filming location for dozens of major films.', 31.0472, -7.1300, 1, 1, 120, 'Taxi', 30, 'Morning', 'Cross the river on foot and climb to the top of the ksar for panoramic views. Morning light brings out the warm red tones.', 'landmark'),
  ('99999999-9999-9999-9999-999999999999', 'Atlas Film Studios', 'One of the world''s largest film studios, with standing sets from Gladiator, Kingdom of Heaven, and Game of Thrones.', 30.9389, -6.9056, 2, 1, 90, 'Taxi', 10, 'Late morning', 'Guided tours explain the film history. Some sets are in various stages of decay — which adds to the cinematic atmosphere.', 'museum'),
  ('99999999-9999-9999-9999-999999999999', 'Kasbah Taourirt', 'A 19th-century clay fortress in central Ouarzazate, once home to the powerful Glaoui family.', 30.9200, -6.8936, 3, 1, 60, 'Walk', 10, 'Afternoon', 'The kasbah is being restored room by room. The carved plasterwork and painted cedar ceilings are remarkable.', 'landmark'),
  ('99999999-9999-9999-9999-999999999999', 'Fint Oasis', 'A hidden palm-filled oasis just 15 km from Ouarzazate, surrounded by barren desert hills — a secret paradise.', 30.8600, -6.8122, 4, 2, 90, 'Taxi / 4x4', 45, 'Morning', 'The contrast between the lush green palms and the red desert hills is striking. Bring water — there are no shops.', 'nature'),
  ('99999999-9999-9999-9999-999999999999', 'Draa Valley', 'Morocco''s longest river valley, lined with date palms, ancient kasbahs, and Berber villages stretching south toward the Sahara.', 30.4500, -6.3500, 5, 2, 180, NULL, NULL, 'All day', 'Drive the N9 road south through the valley. Stop at Agdz and Tamnougalt for lesser-known but stunning kasbahs.', 'nature');

-- ============================================
-- Itinerary 10: Northern Circuit
-- Region: Asilah–Tétouan | Duration: 2 days
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days, tier)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Northern Circuit: Asilah to Tétouan',
  'Discover Morocco''s Mediterranean face. From the whitewashed art town of Asilah to the Spanish-influenced medina of Tétouan, the north offers a quieter, culturally distinct side of the country with beautiful coastal landscapes.',
  'Asilah',
  2,
  'nomad'
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index, day_number, duration_minutes, transport_to_next, transport_duration_minutes, best_time, tips, category) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Asilah Murals', 'A seaside town famous for its annual arts festival and the vibrant murals painted on the medina walls.', 35.4653, -6.0335, 1, 1, 90, 'Walk', 10, 'Morning', 'The murals change every year during the Asilah Cultural Festival (August). Off-season, many older murals remain.', 'landmark'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Asilah Ramparts', 'Portuguese-built 15th-century sea walls offering views over the Atlantic and the medina rooftops.', 35.4648, -6.0360, 2, 1, 60, 'Bus / shared taxi', 90, 'Late morning', 'Walk the ramparts at high tide when waves crash dramatically against the walls. Great for photography.', 'landmark'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tétouan Medina', 'A UNESCO World Heritage medina with strong Andalusian influence, white-washed buildings, and artisan quarters.', 35.5713, -5.3683, 3, 2, 120, 'Walk', 15, 'Morning', 'The medina is less touristic than Fes or Marrakech — prices are lower and interactions feel more genuine.', 'landmark'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Martil Beach', 'A popular local beach town east of Tétouan with a long promenade and seafood restaurants.', 35.6168, -5.2747, 4, 2, 120, 'Taxi', 20, 'Afternoon', 'A favorite beach for Moroccan families. The seafood restaurants along the promenade serve excellent fried fish.', 'nature'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cabo Negro', 'An upscale coastal resort area with pine forests, golf courses, and calm Mediterranean coves.', 35.6417, -5.2750, 5, 2, 90, NULL, NULL, 'Late afternoon', 'The area is quieter and more upscale than Martil. The pine-backed beaches are beautiful for a sunset swim.', 'nature');
