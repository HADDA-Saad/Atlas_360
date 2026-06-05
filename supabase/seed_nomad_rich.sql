-- Atlas 360 — Rich content for Nomad routes
-- Run AFTER seed_nomad_routes.sql
-- Adds rich_description and photo_urls for all 35 new stops

-- ============================================
-- Itinerary 4: Sahara Desert Gateway
-- ============================================

UPDATE locations SET
  rich_description = 'The Todra Gorge is one of Morocco''s most spectacular natural wonders — a slot canyon carved by millennia of river erosion through the eastern High Atlas. The gorge narrows to just 10 meters wide at some points, with sheer rock walls soaring 300 meters above.

The morning is the best time to visit, when golden sunlight pours into the canyon and illuminates the pink and orange rock faces. Rock climbers from around the world come for the challenging routes on the gorge walls, while more casual visitors can walk the flat riverside path deep into the canyon.

Small cafés at the mouth of the gorge serve mint tea with a front-row view of the towering cliffs. The water from the river is fed by mountain springs and is surprisingly cold and clear, even in the heat of summer.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/0/07/Todra_Gorge_Morocco.jpg']
WHERE name = 'Todra Gorge' AND itinerary_id = '44444444-4444-4444-4444-444444444444';

UPDATE locations SET
  rich_description = 'The Erfoud region sits on a geological treasure trove — 350-million-year-old Devonian sea beds filled with perfectly preserved marine fossils. What was once an ancient ocean floor is now a barren, sun-baked landscape dotted with small workshops.

Local artisans extract orthoceras (straight-shelled nautiloids) and ammonite fossils from the limestone, cutting and polishing them into tables, sinks, decorative pieces, and jewelry. Watching the craftsmen work with hand tools to reveal million-year-old creatures from raw rock is mesmerizing.

The region also hosts the annual Date Festival in October, celebrating the local harvest with music, camel races, and enormous quantities of fresh Medjool dates.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/4/4e/Erfoud_Fossils_Morocco.jpg']
WHERE name = 'Erfoud Fossil Beds' AND itinerary_id = '44444444-4444-4444-4444-444444444444';

UPDATE locations SET
  rich_description = 'Rissani was the ancient capital of the Tafilalet oasis and the birthplace of the Alaouite dynasty that still rules Morocco today. Its souk is one of the most authentic in the country — a sprawling, chaotic market where desert nomads, Berber farmers, and local traders converge.

Unlike the tourist-oriented souks of Marrakech, Rissani''s market sells what people actually need: livestock, grain, dates, used clothing, and household goods. The atmosphere is raw and genuine. On market days (Tuesday, Thursday, and Sunday), the energy is electric.

Don''t miss the local specialty: madfouna, a stuffed bread sometimes called "Berber pizza," baked in underground sand ovens. The nearby Moulay Ali Sharif mausoleum, founder of the Alaouite dynasty, is also worth visiting.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/9/98/Rissani_Souk.jpg']
WHERE name = 'Rissani Souk' AND itinerary_id = '44444444-4444-4444-4444-444444444444';

UPDATE locations SET
  rich_description = 'Erg Chebbi is Morocco''s most famous sand sea — a 22-kilometer stretch of wind-sculpted dunes reaching heights of 150 meters. The dunes glow in shades of gold, orange, and red depending on the time of day, creating an ever-changing canvas of light and shadow.

A camel trek at sunset is the quintessential Sahara experience. As you crest the first major dune ridge, the landscape opens into an endless ocean of sand. The silence is profound — broken only by the padding of camel hooves and the whisper of wind across the ridgelines.

The dunes are home to a surprising amount of wildlife: desert foxes, scarab beetles, and even the occasional sand viper. At night, the absence of light pollution makes Erg Chebbi one of the best stargazing locations in North Africa.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/d/d5/Erg_Chebbi_dunes_Morocco.jpg']
WHERE name = 'Erg Chebbi Dunes' AND itinerary_id = '44444444-4444-4444-4444-444444444444';

UPDATE locations SET
  rich_description = 'Spending a night at a desert camp deep in the Erg Chebbi dunes is the crown jewel of any Sahara trip. Traditional Berber camps range from basic tent setups to luxury glamping experiences, but all share the same magic: fire, drums, and an infinite canopy of stars.

After a dinner of traditional tagine and freshly baked bread, Berber hosts gather around the fire for an evening of Gnaoua drumming and storytelling. The rhythm of the music, the warmth of the fire, and the vastness of the surrounding desert create a primal, deeply moving atmosphere.

Wake before dawn and climb the nearest dune to watch the sunrise. As the first light hits the sand, the dunes ignite in layers of pink, gold, and amber — a sight that stays with you long after you leave the desert.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/3/3c/Sahara_Desert_Camp_Morocco.jpg']
WHERE name = 'Merzouga Desert Camp' AND itinerary_id = '44444444-4444-4444-4444-444444444444';

-- ============================================
-- Itinerary 5: Essaouira Coastal Escape
-- ============================================

UPDATE locations SET
  rich_description = 'The Skala du Port is Essaouira''s defining monument — a massive 18th-century sea bastion built by European military engineers for Sultan Sidi Mohammed ben Abdallah. A row of Spanish and Portuguese bronze cannons still point out over the crashing Atlantic waves.

Walking the ramparts at dawn, when fishing boats motor out to sea and seagulls wheel overhead, is one of the most atmospheric experiences on the Moroccan coast. The bastion was famously used as a filming location for Game of Thrones (standing in for Astapor).

Below the walls, the working fishing port is alive with activity. Blue boats line the harbor, fishermen mend nets, and the fresh catch of the day — sardines, sea bream, octopus — is laid out on ice at the port-side grills.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/f/f2/Skala_du_Port_Essaouira.jpg']
WHERE name = 'Skala du Port' AND itinerary_id = '55555555-5555-5555-5555-555555555555';

UPDATE locations SET
  rich_description = 'The medina of Essaouira is a masterpiece of 18th-century military urban planning — a rare example of a North African fortified port designed using European principles. Its grid-like streets, unusual for a Moroccan medina, make it easy to navigate.

White-washed buildings with blue shutters line the alleys, giving the town a distinctly Atlantic feel. Art galleries, Gnaoua music shops, and thuya woodwork ateliers fill the ground floors. Essaouira has long attracted artists — Orson Welles filmed Othello here, and Jimi Hendrix is rumored to have visited in the 1960s.

The medina is significantly calmer than Marrakech or Fes. Shopkeepers are less aggressive, prices are more reasonable, and the overall atmosphere is relaxed and welcoming. The combination of ocean breeze, art culture, and laid-back energy makes it a favorite among repeat Morocco visitors.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/3/3a/Essaouira_Medina_Morocco.jpg']
WHERE name = 'Essaouira Medina' AND itinerary_id = '55555555-5555-5555-5555-555555555555';

UPDATE locations SET
  rich_description = 'Essaouira''s beach is a vast, windswept expanse of golden sand stretching several kilometers south from the medina walls. The consistent Atlantic trade winds (known locally as the alizé) make it one of the world''s premier destinations for windsurfing and kitesurfing.

The beach has a raw, untamed beauty — wide open, rarely crowded, and backed by rolling dunes. Camel rides along the shore are a popular activity, and the beach is dotted with football games, horse riders, and surfers.

At the southern end, the ruins of the Borj el-Berod watchtower rise from the sand — said to have inspired Jimi Hendrix''s "Castles Made of Sand." Whether the legend is true or not, the crumbling tower against the backdrop of ocean and sky is undeniably poetic.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/a/a8/Essaouira_Beach_Morocco.jpg']
WHERE name = 'Essaouira Beach' AND itinerary_id = '55555555-5555-5555-5555-555555555555';

UPDATE locations SET
  rich_description = 'Morocco is the world''s largest producer of argan oil, and the cooperatives between Essaouira and Marrakech are where the magic happens. Women-run cooperatives crack argan nuts by hand, roast the kernels, and cold-press the oil — a labor-intensive process that yields one of the world''s most expensive culinary and cosmetic oils.

Visiting a cooperative provides insight into both the production process and the social impact: many cooperatives provide education, healthcare, and economic independence for rural women. You can watch every step of the process, from cracking the incredibly hard shells to grinding the roasted kernels into a fragrant paste.

The culinary argan oil (made from roasted kernels) has a rich, nutty flavor that transforms salads, couscous, and bread. The cosmetic oil (from raw kernels) is prized worldwide for its moisturizing properties. Buying directly from the cooperative ensures fair prices and genuine product.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/7/7b/Argan_Oil_Cooperative_Morocco.jpg']
WHERE name = 'Argan Oil Cooperative' AND itinerary_id = '55555555-5555-5555-5555-555555555555';

UPDATE locations SET
  rich_description = 'Place Moulay Hassan is the social heart of Essaouira — a broad, sunny square where the medina meets the port. Surrounded by cafés with outdoor terraces, it is the town''s natural gathering point.

The real attraction here is the port-side seafood grills just steps away. Rows of small stalls display the morning''s fresh catch on beds of ice: sardines, shrimp, sea bream, calamari, swordfish, and lobster. You choose your fish, negotiate the price, and it is grilled to order with a squeeze of lemon and served with bread and salad.

In the evening, the square comes alive with street musicians, families strolling, and the golden light of sunset reflecting off the white buildings. The annual Gnaoua World Music Festival transforms the square into an open-air concert venue every June.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/5/55/Place_Moulay_Hassan_Essaouira.jpg']
WHERE name = 'Place Moulay Hassan' AND itinerary_id = '55555555-5555-5555-5555-555555555555';

-- ============================================
-- Itinerary 6: Imperial Rabat (abbreviated rich descriptions)
-- ============================================

UPDATE locations SET
  rich_description = 'The Hassan Tower is the unfinished minaret of a mosque that was meant to be the largest in the world. Construction began in 1195 under the Almohad Sultan Yacoub el-Mansour, but halted upon his death in 1199. The 44-meter tower — intended to reach 86 meters — still stands as a powerful symbol of ambition and impermanence.

The site is an open esplanade of 200 remaining stone columns, marking where the prayer hall''s roof would have stood. The contrast between the massive red sandstone tower and the orderly rows of broken pillars creates a hauntingly beautiful scene.

Adjacent to the tower is the Mohammed V Mausoleum, creating a poignant connection between medieval and modern Moroccan sovereignty.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/d/d6/Hassan_Tower_Rabat.jpg']
WHERE name = 'Hassan Tower' AND itinerary_id = '66666666-6666-6666-6666-666666666666';

UPDATE locations SET
  rich_description = 'Perched on a cliff above the Bouregreg river mouth, the Kasbah des Oudayas is Rabat''s oldest quarter. Its blue-and-white streets — reminiscent of Chefchaouen — hide one of Morocco''s finest hidden gems: the Andalusian Gardens.

Built during the French Protectorate in the style of classic Moorish gardens, the Andalusian Gardens are a tranquil oasis of orange trees, bougainvillea, fountains, and tiled walkways. The kasbah''s main gate, Bab Oudaya, is a masterpiece of Almohad architecture.

From the platform at the river mouth, you can watch the Bouregreg flow into the Atlantic. The view across to the town of Salé is particularly beautiful at sunset.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/8/89/Kasbah_des_Oudayas_Rabat.jpg']
WHERE name = 'Kasbah des Oudayas' AND itinerary_id = '66666666-6666-6666-6666-666666666666';

UPDATE locations SET
  rich_description = 'The Mohammed V Mausoleum is the resting place of King Mohammed V (who led Morocco to independence in 1956) and his two sons, King Hassan II and Prince Moulay Abdallah. The building is a showcase of the finest Moroccan craftsmanship of the 20th century.

The interior is breathtaking: hand-carved white marble walls, gilded cedar ceilings, a floor of green Italian onyx marble, and zellige tilework of extraordinary precision. Royal guards in traditional red-and-green dress stand at each corner.

The mausoleum is open to non-Muslim visitors, making it a rare opportunity to experience the interior of a sacred Moroccan monument. The craftsmanship represents a direct lineage from the artisans who built the medieval madrasas.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/a/a3/Mohammed_V_Mausoleum_Rabat.jpg']
WHERE name = 'Mohammed V Mausoleum' AND itinerary_id = '66666666-6666-6666-6666-666666666666';

UPDATE locations SET
  rich_description = 'Chellah is one of Morocco''s most atmospheric ruins — a medieval Islamic necropolis built atop a Roman settlement called Sala Colonia. Surrounded by crenellated walls, the site is now half-consumed by wild vegetation, creating a hauntingly romantic landscape.

Roman remnants — a forum, bath complex, and decumanus road — underlie the 14th-century Marinid structures above. A beautiful minaret, mosque ruins, and royal tombs sit among fig trees, oleanders, and the nesting colony of white storks that has made the minaret its home.

The sound of storks clacking their beaks from atop the ruined minaret, set against the green overgrowth and crumbling stone, creates one of the most surreal and photogenic scenes in Morocco.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/c/c1/Chellah_Necropolis_Rabat.jpg']
WHERE name = 'Chellah Necropolis' AND itinerary_id = '66666666-6666-6666-6666-666666666666';

UPDATE locations SET
  rich_description = 'Rabat''s medina is a pleasant surprise for travelers who have experienced the overwhelming souks of Fes or Marrakech. Smaller, cleaner, and more orderly, it offers quality goods at fair prices without the aggressive sales tactics found elsewhere.

Rue des Consuls is the main shopping street, named for the European consulates that once lined it. Today it is filled with leather goods, carpets, pottery, and traditional textiles. The quality is high — Rabat has a long tradition of refined craftsmanship — and bargaining is more relaxed.

The medina also offers excellent street food: fresh-squeezed orange juice, msemen (layered flatbread), and harira (tomato and lentil soup). The Almohad city walls and gates surrounding the medina are beautifully preserved and provide a sense of entering a distinct historical quarter.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/5/56/Rabat_Medina_Morocco.jpg']
WHERE name = 'Rabat Medina' AND itinerary_id = '66666666-6666-6666-6666-666666666666';

-- Remaining itineraries (7–10) use the base descriptions from seed_nomad_routes.sql.
-- Rich descriptions can be added progressively as content is verified.
