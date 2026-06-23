-- Atlas 360 — Seed Data
-- Inserts 3 itineraries and 15 location stops

-- ============================================
-- Itinerary 1: Marrakech Medina Walk
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Marrakech Medina Walk',
  'Explore the vibrant heart of Marrakech through its historic medina, from the bustling Jemaa el-Fna square to the serene Saadian Tombs. A two-day journey through centuries of Moroccan culture.',
  'Marrakech',
  2
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jemaa el-Fna Square', 'The main square and marketplace in Marrakech''s medina. A UNESCO World Heritage site alive with storytellers, musicians, and food stalls.', 31.6258, -7.9891, 1),
  ('11111111-1111-1111-1111-111111111111', 'Bahia Palace', 'A stunning 19th-century palace with intricate tilework, carved stucco, and lush gardens.', 31.6211, -7.9836, 2),
  ('11111111-1111-1111-1111-111111111111', 'Koutoubia Mosque', 'The largest mosque in Marrakech, with a 77-meter minaret visible across the city.', 31.6245, -7.9942, 3),
  ('11111111-1111-1111-1111-111111111111', 'Souks of Marrakech', 'A labyrinth of covered markets selling spices, leather goods, ceramics, and textiles.', 31.6312, -7.9874, 4),
  ('11111111-1111-1111-1111-111111111111', 'Saadian Tombs', 'A royal necropolis dating to the Saadian dynasty, rediscovered in 1917 and beautifully restored.', 31.6185, -7.9869, 5);

-- ============================================
-- Itinerary 2: Fes el-Bali Heritage
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Fes el-Bali Heritage',
  'Journey through the world''s oldest walled medina. Discover ancient tanneries, the world''s first university, and medieval architecture preserved for over a millennium.',
  'Fes',
  2
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Bab Bou Jeloud', 'The iconic blue gate — the ornate main western entrance to Fes el-Bali, the old medina.', 34.0641, -4.9783, 1),
  ('22222222-2222-2222-2222-222222222222', 'Chouara Tanneries', 'One of the oldest tanneries in the world, where leather is still dyed using traditional methods.', 34.0651, -4.9729, 2),
  ('22222222-2222-2222-2222-222222222222', 'Al-Qarawiyyin Mosque', 'Founded in 859 AD, recognized as the oldest continually operating university in the world.', 34.0645, -4.9741, 3),
  ('22222222-2222-2222-2222-222222222222', 'Nejjarine Fountain', 'An exquisite mosaic fountain at the heart of the woodworkers'' souk, a masterpiece of Moroccan craftsmanship.', 34.0635, -4.9749, 4),
  ('22222222-2222-2222-2222-222222222222', 'Bou Inania Madrasa', 'A 14th-century theological college with spectacular zellige tilework and carved cedar wood.', 34.0637, -4.9780, 5);

-- ============================================
-- Itinerary 3: Chefchaouen Blue City
-- ============================================
INSERT INTO itineraries (id, title, description, region, duration_days)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Chefchaouen Blue City',
  'Wander through the enchanting blue-painted streets of Chefchaouen, nestled in the Rif Mountains. A one-day escape into Morocco''s most photogenic town.',
  'Chefchaouen',
  1
);

INSERT INTO locations (itinerary_id, name, description, lat, lng, order_index) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Place Uta el-Hammam', 'The main square of Chefchaouen, surrounded by cafés and the old kasbah walls.', 35.1688, -5.2685, 1),
  ('33333333-3333-3333-3333-333333333333', 'Kasbah Museum', 'A restored fortress housing a museum of regional ethnography and a beautiful Andalusian garden.', 35.1686, -5.2687, 2),
  ('33333333-3333-3333-3333-333333333333', 'Blue Painted Streets', 'The iconic blue-washed alleyways that give Chefchaouen its world-famous character.', 35.1692, -5.2679, 3),
  ('33333333-3333-3333-3333-333333333333', 'Ras el-Ma Waterfall', 'A small but scenic waterfall at the edge of the medina where locals gather to wash wool.', 35.1710, -5.2645, 4),
  ('33333333-3333-3333-3333-333333333333', 'Spanish Mosque Viewpoint', 'A hilltop mosque offering panoramic views of Chefchaouen''s blue medina and the surrounding mountains.', 35.1703, -5.2720, 5);
