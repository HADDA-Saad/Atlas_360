-- Itinerary 1: Marrakech Medina Walk
UPDATE locations SET
  description = 'The vibrant and chaotic main square of Marrakech, filled with food stalls, performers, and history.',
  rich_description = 'Stepping into Jemaa el-Fna is like walking onto a theater stage where the performance has been running for a thousand years. As the sun sets, the square transforms from a quiet plaza into a sensory explosion of smoke from food stalls, the rhythmic pulse of Gnaoua music, and the calls of merchants.\n\nIt''s the historic heart of Marrakech, where locals and travelers alike gather. The energy is palpable, and while it can feel overwhelming at first, finding a rhythm amidst the snake charmers and juice vendors is part of the magic. For the best view, head to one of the rooftop cafes surrounding the square just before sunset.\n\nThis is a place best experienced with an open mind and a spirit of adventure. Don''t be afraid to try the local street food—especially the merguez sausages or fresh orange juice—but always ask for prices upfront.',
  best_time = 'Sunset',
  tips = 'Keep small change handy for photos and street food. Secure your belongings in crowded areas.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/2/27/Jemaa_el-Fnaa%2C_Marrakesh_04.jpg', 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Jemaa_el-Fna_at_night_1.jpg']
WHERE name = 'Jemaa el-Fna Square' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Marrakech Medina Walk');

UPDATE locations SET
  description = 'A stunning 19th-century palace showcasing intricate Moroccan architecture, zellige tilework, and lush courtyards.',
  rich_description = 'The Bahia Palace, meaning "brilliance," is a masterpiece of late 19th-century Moroccan architecture. Built by the Grand Vizier Si Moussa, the palace was designed to be the greatest of its time, capturing the essence of Islamic and Moroccan style.\n\nWandering through its 160 rooms, courtyards, and gardens, you are treated to a visual feast of carved cedarwood ceilings, intricate zellige tilework, and wrought-iron detailing. The grand courtyard, bathed in sunlight and surrounded by arched colonnades, is particularly breathtaking and offers a quiet respite from the city''s hustle.\n\nThough empty of furniture today, the intricate craftsmanship speaks volumes about the opulence of the era. Arrive early to experience the tranquil beauty of the gardens before the larger crowds descend.',
  best_time = 'Early morning',
  tips = 'Hire a local guide at the entrance to fully appreciate the historical context and architectural details.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/c/cb/Bahia_Palace_Marrakech_Morocco.jpg', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Courtyard_of_the_Bahia_Palace.jpg']
WHERE name = 'Bahia Palace' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Marrakech Medina Walk');

UPDATE locations SET
  description = 'The largest mosque in Marrakech, featuring a magnificent minaret that is a masterpiece of Almohad architecture.',
  rich_description = 'The Koutoubia Mosque stands as the spiritual and architectural anchor of Marrakech. Its towering 77-meter minaret, completed in the 12th century under the Almohad dynasty, served as the blueprint for the Giralda in Seville and the Hassan Tower in Rabat.\n\nWhile non-Muslims cannot enter the mosque itself, the exterior and the surrounding rose gardens offer plenty of beauty. The call to prayer echoing from the minaret five times a day is a powerful reminder of the city''s living faith. The mosque gets its name from the Arabic word for bookseller, as the area was once filled with manuscript vendors.\n\nWalking the grounds at dusk, when the minaret is softly illuminated against the twilight sky, is one of the most serene experiences in the city.',
  best_time = 'Late afternoon',
  tips = 'Dress modestly when walking around the perimeter. The gardens offer great photo opportunities of the minaret.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/b/b3/Koutoubia_Mosque_-_Marrakech.jpg', 'https://upload.wikimedia.org/wikipedia/commons/1/14/Koutoubia_minaret.jpg']
WHERE name = 'Koutoubia Mosque' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Marrakech Medina Walk');

UPDATE locations SET
  description = 'A labyrinthine network of traditional markets offering everything from spices and textiles to handcrafted leather goods.',
  rich_description = 'Diving into the Souks of Marrakech is like entering a vibrant, chaotic labyrinth where every sense is stimulated. Sunlight filters through slatted roofs, illuminating dust motes and colorful displays of spices, silk threads, and brass lamps.\n\nThe souks are loosely organized by trade: Souk Smarine for textiles, Souk Haddadine for metalwork, and Souk Cherratine for leather. Getting lost here is part of the fun, and eventually, every alley seems to lead back to Jemaa el-Fna. Haggling is expected—approach it as a friendly game rather than a battle.\n\nBeyond the shopping, it’s fascinating to watch artisans at work, continuing traditions that have been passed down for centuries. Take your time, sip some mint tea, and enjoy the theater of commerce.',
  best_time = 'Mid-morning',
  tips = 'Bargaining is expected; start at about a third of the initial asking price. Don''t use Google Maps; ask shopkeepers for directions if lost.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/0/07/Souks_of_Marrakesh.jpg', 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Marrakech_Souk_2.jpg']
WHERE name = 'Souks of Marrakech' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Marrakech Medina Walk');

UPDATE locations SET
  description = 'An ornate 16th-century necropolis featuring breathtaking cedarwood domes and Carrara marble columns.',
  rich_description = 'Hidden away for centuries and only rediscovered in 1917, the Saadian Tombs are a spectacular testament to the wealth of the Saadian dynasty. Sultan Ahmad al-Mansur spared no expense in constructing this resting place, importing Italian Carrara marble and using pure gold leaf.\n\nThe highlight is the Chamber of the Twelve Columns, a breathtaking room with a soaring vaulted ceiling carved from cedarwood. The meticulous zellige tilework and intricate stucco carving create an atmosphere of serene reverence.\n\nThe contrast between the quiet elegance of the tombs and the busy streets outside is striking. Because the site is small and highly popular, the line to view the main chamber can get long, making it essential to visit early.',
  best_time = 'Early morning',
  tips = 'Arrive right at opening time to avoid the long queue to look into the Chamber of the Twelve Columns.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/e/ec/Saadian_Tombs_Marrakesh.jpg', 'https://upload.wikimedia.org/wikipedia/commons/1/15/Saadian_tombs_interior.jpg']
WHERE name = 'Saadian Tombs' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Marrakech Medina Walk');

-- Itinerary 2: Fes el-Bali Heritage
UPDATE locations SET
  description = 'The iconic blue and green tiled gate that serves as the main entrance to the ancient medina of Fes.',
  rich_description = 'Bab Bou Jeloud, often called the Blue Gate, is the grand entrance to Fes el-Bali, the world''s largest car-free urban area. Built in 1913, the gate is famously decorated with blue tiles on the outside (representing the color of Fes) and green tiles on the inside (representing Islam).\n\nPassing through its monumental arches feels like stepping through a portal back in time. Immediately, the wide plaza gives way to the narrow, bustling arteries of Talaa Kebira and Talaa Seghira. The air fills with the scent of fresh bread, mint, and donkey exhaust.\n\nThe cafes just inside the gate offer excellent vantage points. Grabbing a mint tea here and watching the endless parade of locals, tourists, and loaded mules is the perfect introduction to the city.',
  best_time = 'Late afternoon',
  tips = 'A great meeting point if you get lost. Enjoy a mint tea at a nearby rooftop cafe for the best views of the gate.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/9/91/Bab_Bou_Jeloud_Fez.jpg', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Fes_Bab_Boujeloud.jpg']
WHERE name = 'Bab Bou Jeloud' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Fes el-Bali Heritage');

UPDATE locations SET
  description = 'One of the oldest operating leather tanneries in the world, known for its vibrant dye pits and pungent smell.',
  rich_description = 'The Chouara Tanneries offer one of Fes’s most iconic and unforgettable sights. Here, men have been treating and dyeing leather using the same methods since the 11th century. The view from the surrounding terraces reveals a honeycomb of stone vats filled with natural dyes like saffron, henna, and indigo.\n\nThe process is labor-intensive and completely manual. Workers wade waist-deep into the pits, kneading the skins to soften them and infuse the vibrant colors. The pungent smell—a mix of pigeon guano used for softening the leather, and various dyes—is intense, but terrace owners provide sprigs of fresh mint to hold under your nose.\n\nWhile you must pass through a leather shop to reach the viewing terraces, there is no obligation to buy, though the quality of the goods is excellent.',
  best_time = 'Morning',
  tips = 'Accept the sprig of mint offered at the entrance to help mask the strong smell of the tanning pits. Morning light is best for photos.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/4/44/Chouara_Tannery_Fes.jpg', 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Tanneries_of_Fez.jpg']
WHERE name = 'Chouara Tanneries' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Fes el-Bali Heritage');

UPDATE locations SET
  description = 'Founded in 859 AD, this historic mosque also houses what is considered the oldest continuously operating university in the world.',
  rich_description = 'Founded by Fatima al-Fihri in 859 AD, the Al-Qarawiyyin Mosque and University is the intellectual and spiritual heart of Fes. It holds the Guinness World Record as the oldest existing, and continually operating educational institution in the world.\n\nThough non-Muslims cannot enter the prayer hall, you can admire the magnificent courtyard from the doorways. The vast space can accommodate up to 20,000 worshippers, and its architecture—with Andalusian-style pavilions, intricate zellige, and carved stucco—is breathtaking.\n\nThe surrounding alleys are deeply intertwined with the mosque, forming the historic center of the medina. It’s a profound experience to stand at its threshold and consider the centuries of scholarship that have taken place within.',
  best_time = 'Midday',
  tips = 'Non-Muslims cannot enter, but the open doors provide a fantastic view into the main courtyard. Respect worshippers passing through.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/c/cc/Mosqu%C3%A9e_Al_Qarawiyyin.jpg', 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Al-Qarawiyyin_courtyard.jpg']
WHERE name = 'Al-Qarawiyyin Mosque' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Fes el-Bali Heritage');

UPDATE locations SET
  description = 'A beautifully restored 18th-century fondouk (inn) that now houses the Museum of Wooden Arts and Crafts.',
  rich_description = 'Located in a small, picturesque square, the Nejjarine Fountain is one of the most beautiful public fountains in Fes, adorned with exquisite mosaic tiles. Right next to it stands the Fondouk el-Nejjarine, an 18th-century inn used by traveling merchants, now flawlessly restored.\n\nThe building itself is a masterpiece of traditional architecture, featuring a stunning central courtyard surrounded by intricately carved wooden galleries. Today, it houses the Museum of Wooden Arts and Crafts, showcasing the incredible woodworking heritage of the region.\n\nDon''t miss the rooftop cafe. It offers a surprisingly peaceful retreat from the bustling medina below, along with panoramic views over the sprawling ancient city.',
  best_time = 'Early afternoon',
  tips = 'Don''t miss the rooftop cafe of the museum for a quiet tea break and excellent panoramic views of the medina.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/a/af/Nejjarine_Fountain.jpg', 'https://upload.wikimedia.org/wikipedia/commons/7/77/Fondouk_el-Nejjarine_courtyard.jpg']
WHERE name = 'Nejjarine Fountain' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Fes el-Bali Heritage');

UPDATE locations SET
  description = 'An architectural jewel of the 14th century, featuring some of the finest Marinid craftsmanship in Morocco.',
  rich_description = 'The Bou Inania Madrasa is arguably the finest theological college built by the Marinid sultans. Constructed in the 1350s, it is unusual because it also functions as a congregational mosque, complete with its own beautiful green-tiled minaret.\n\nThe interior courtyard is a staggering display of Moroccan craftsmanship. Every inch is covered in decoration: from the delicate cedarwood carvings and precise geometric zellige tilework to the elaborate stucco calligraphy. The central marble fountain still provides a tranquil soundtrack to the space.\n\nIt is one of the few religious buildings in Fes open to non-Muslims, making it an essential visit for anyone interested in Islamic architecture.',
  best_time = 'Morning',
  tips = 'Dress respectfully. The intricate courtyard details are best appreciated early in the day when the light is soft and crowds are smaller.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/5/5f/Bou_Inania_Madrasa_Fez.jpg', 'https://upload.wikimedia.org/wikipedia/commons/9/90/Medersa_Bou_Inania.jpg']
WHERE name = 'Bou Inania Madrasa' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Fes el-Bali Heritage');

-- Itinerary 3: Chefchaouen Blue City
UPDATE locations SET
  description = 'The lively central square of Chefchaouen, lined with cafes and dominated by the red walls of the Kasbah.',
  rich_description = 'Place Uta el-Hammam is the beating heart of Chefchaouen. Unlike the narrow, blue-washed alleys that define the rest of the medina, this spacious plaza is dominated by the imposing red-ochre walls of the 15th-century Kasbah and the striking octagonal minaret of the Grand Mosque.\n\nThe square is perpetually buzzing. It''s the perfect place to sit at an outdoor cafe, order a sweet mint tea, and watch the world go by. Locals mingle with travelers beneath the shade of old trees, creating a relaxed, welcoming atmosphere.\n\nWhile the restaurants here cater heavily to tourists, the ambiance makes it worth stopping for a drink. It’s the central hub from which all explorations of the blue city begin and end.',
  best_time = 'Late afternoon',
  tips = 'A great spot for people-watching. The cafes are slightly more expensive here, but you are paying for the fantastic atmosphere.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/f/fe/Place_Uta_el-Hammam.jpg', 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Chefchaouen_square.jpg']
WHERE name = 'Place Uta el-Hammam' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Chefchaouen Blue City');

UPDATE locations SET
  description = 'A restored 15th-century fortress offering Andalusian gardens and panoramic views from its ancient towers.',
  rich_description = 'Built in 1471 by the city''s founder, Moulay Ali Ben Moussa Ben Rached El Alami, the Kasbah is a heavily restored walled fortress that served as a defense against Portuguese and Spanish invasions. Its sturdy red walls stand in stark contrast to the surrounding blue buildings.\n\nInside, you''ll find a peaceful Andalusian-style garden filled with ancient trees and a small ethnographic museum detailing the region''s history, traditional dress, and pottery. The old prison cells are also open for viewing.\n\nThe highlight is climbing to the top of the main tower. From there, you are rewarded with sweeping 360-degree views over the medina''s blue rooftops and the rugged Rif Mountains beyond.',
  best_time = 'Mid-morning',
  tips = 'Climb the main tower for one of the best vantage points over the city and the surrounding Rif Mountains.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/8/87/Kasbah_of_Chefchaouen.jpg', 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Chefchaouen_Kasbah_Garden.jpg']
WHERE name = 'Kasbah Museum' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Chefchaouen Blue City');

UPDATE locations SET
  description = 'The iconic, endlessly photogenic winding alleys washed in varying shades of striking blue.',
  rich_description = 'The Blue Painted Streets are the soul of Chefchaouen and the reason travelers from around the world flock to this mountain town. The tradition of painting the buildings blue is said to have been introduced by Jewish refugees in the 1930s, symbolizing the sky and heaven.\n\nWandering aimlessly is the best approach. Every turn reveals a new shade—from pale powder blue to deep indigo—accented by colorful woven blankets, bright brass teapots, and potted plants lining the stairs. The light changes dramatically throughout the day, altering the mood of the alleys.\n\nWhile the main thoroughfares can get busy, straying just a few streets away often leads to completely deserted, deeply atmospheric corners perfect for quiet photography.',
  best_time = 'Early morning',
  tips = 'Wake up early if you want photos without crowds. Respect the locals'' privacy and ask before photographing people or their open doorways.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/1/1a/Chefchaouen_blue_streets.jpg', 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Chefchaouen_Morocco_Blue_City.jpg']
WHERE name = 'Blue Painted Streets' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Chefchaouen Blue City');

UPDATE locations SET
  description = 'A refreshing natural spring where locals gather to wash clothes and cool off, located just outside the medina walls.',
  rich_description = 'Just beyond the eastern gate of the medina lies Ras el-Ma, the natural spring that provides Chefchaouen with its fresh water. It’s a lively, communal spot where the sound of rushing water replaces the hum of the medina.\n\nLocals have gathered here for generations to wash clothes and carpets in the communal public washhouses, a practice that continues today. Small cafes line the cascading water, offering freshly squeezed orange juice with your feet dangling just inches from the cool stream.\n\nIt’s a fantastic place to observe daily life and escape the heat of the afternoon. The water is crisp and clean, originating high up in the Rif Mountains.',
  best_time = 'Mid-afternoon',
  tips = 'Enjoy a fresh orange juice at one of the cafes set right by the water. A great place to cool off on a hot day.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/c/cd/Ras_el-Maa_Chefchaouen.jpg', 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Source_Ras_El_Maa.jpg']
WHERE name = 'Ras el-Ma Waterfall' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Chefchaouen Blue City');

UPDATE locations SET
  description = 'An abandoned mosque situated on a hill, offering the most spectacular sunset views over the entire blue city.',
  rich_description = 'A short, scenic hike up the hill from Ras el-Ma leads to the Spanish Mosque. Built by the Spanish in the 1920s during their occupation, the mosque was never actually used by the local population and eventually fell into ruin, though it has been recently restored.\n\nThe mosque itself is modest, but the real reason to visit is the view. The terrace offers an unobstructed, panoramic vista of the entire blue medina nestled between the twin peaks of the mountains (Chefchaouen translates to "look at the horns").\n\nIt is the undisputed best spot in town to watch the sunset. As the light fades, the blue city glows softly, and the evening call to prayer echoes up the valley—a truly magical Moroccan moment.',
  best_time = 'Sunset',
  tips = 'The walk takes about 20-30 minutes uphill from Ras el-Ma. Bring water and arrive 45 minutes before sunset to secure a good spot.',
  photo_urls = ARRAY['https://upload.wikimedia.org/wikipedia/commons/5/52/Spanish_Mosque_Chefchaouen.jpg', 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Chefchaouen_view_from_Spanish_Mosque.jpg']
WHERE name = 'Spanish Mosque Viewpoint' AND itinerary_id = (SELECT id FROM itineraries WHERE title = 'Chefchaouen Blue City');
