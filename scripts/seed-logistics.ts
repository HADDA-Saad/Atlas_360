import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('[STEP 0] Starting seed script...');
  let updatedLocationsCount = 0;
  let itinerariesInserted = 0;
  let itinerariesSkipped = 0;
  let locationsInserted = 0;
  const failedRows: string[] = [];

  try {
    console.log('[STEP 1] Fetching existing itineraries and locations...');
    const { data: itineraries, error: itError } = await supabase.from('itineraries').select('id, title');
    if (itError) throw itError;

    const { data: locations, error: locError } = await supabase.from('locations').select('id, name, itinerary_id');
    if (locError) throw locError;

    console.log('[STEP 1] Updating existing locations with logistics data...');
    for (const loc of locations || []) {
      const it = itineraries?.find((i) => i.id === loc.itinerary_id);
      if (!it) continue;

      let updateData: any = {
        day_number: 1,
        duration: '60', // Note: duration_minutes is not in db schema, it's 'duration' text as per migration 004! Wait, prompt said duration_minutes! Let me check the migration 004.
        transport: 'Walking',
        tips: 'Ask your riad host for local recommendations',
        category: 'landmark',
      };

      const titleLower = it.title.toLowerCase();
      const nameLower = loc.name.toLowerCase();

      if (titleLower.includes('marrakech')) {
        if (nameLower.includes('jemaa el-fna') || nameLower.includes('jemaa')) {
          updateData = { day_number: 1, duration: '90', transport: 'Walking', tips: 'Visit at sunset for the best atmosphere — the square transforms completely after dark', category: 'landmark' };
        } else if (nameLower.includes('koutoubia')) {
          updateData = { day_number: 1, duration: '30', transport: 'Walking', tips: 'Non-Muslims cannot enter but the gardens and exterior are stunning', category: 'landmark' };
        } else if (nameLower.includes('bahia')) {
          updateData = { day_number: 1, duration: '60', transport: 'Walking', tips: 'Hire a local guide inside — the stories behind each room are worth it', category: 'heritage' };
        } else if (nameLower.includes('majorelle')) {
          updateData = { day_number: 2, duration: '75', transport: 'Taxi', tips: 'Arrive right at opening (8am) to avoid the crowds — it gets packed by 10am', category: 'nature' };
        } else if (nameLower.includes('mellah')) {
          updateData = { day_number: 2, duration: '45', transport: 'Walking', tips: 'Look for the star of David motifs still carved above old doorways', category: 'heritage' };
        }
      } else if (titleLower.includes('sahara')) {
        if (nameLower.includes('ouarzazate')) {
          updateData = { day_number: 1, duration: '120', transport: '4x4', tips: 'Stop at Taourirt Kasbah before leaving the city', category: 'heritage' };
        } else if (nameLower.includes('dades')) {
          updateData = { day_number: 1, duration: '60', transport: '4x4', tips: 'The gorge road is narrow — best light for photos is early morning', category: 'nature' };
        } else if (nameLower.includes('merzouga') || nameLower.includes('erg chebbi')) {
          updateData = { day_number: 2, duration: '180', transport: 'Camel', tips: 'Book a night in a desert camp — waking up to the dunes at sunrise is unmissable', category: 'nature' };
        }
      }

      const { error: upError } = await supabase.from('locations').update(updateData).eq('id', loc.id);
      if (upError) {
        console.error(`[STEP 1 ERROR] Failed to update location ${loc.name}:`, upError.message);
        failedRows.push(`Location Update: ${loc.name}`);
      } else {
        updatedLocationsCount++;
      }
    }

    console.log('[STEP 2] Seeding 7 new itineraries...');
    
    const newItineraries = [
      {
        title: 'Sahara Grand Circuit',
        description: 'An epic journey from Marrakech through the High Atlas, Draa Valley, and into the golden dunes of Erg Chebbi',
        duration_days: 6,
        tier: 'nomad',
        region: 'Morocco',
        locations: [
          { name: "Tizi n'Tichka Pass", lat: 31.2167, lng: -7.3667, transport: '4x4', duration: '90', day_number: 1, tips: 'Enjoy the stunning mountain views.', category: 'nature' },
          { name: 'Ouarzazate', lat: 30.9189, lng: -6.8934, transport: '4x4', duration: '90', day_number: 2, tips: 'Explore the gateway to the Sahara.', category: 'heritage' },
          { name: 'Draa Valley', lat: 30.5000, lng: -6.6667, transport: '4x4', duration: '90', day_number: 3, tips: 'Walk among the ancient palm groves.', category: 'nature' },
          { name: 'Zagora', lat: 30.3286, lng: -5.8378, transport: '4x4', duration: '90', day_number: 4, tips: 'Experience the desert city vibes.', category: 'landmark' },
          { name: 'Erg Chebbi Dunes', lat: 31.1500, lng: -3.9667, transport: 'Camel', duration: '90', day_number: 5, tips: 'Unforgettable sunset on the dunes.', category: 'nature' },
          { name: 'Merzouga Camp', lat: 31.0800, lng: -3.9780, transport: 'Camel', duration: '90', day_number: 6, tips: 'Sleep under a blanket of stars.', category: 'heritage' },
        ]
      },
      {
        title: 'Essaouira Coastal Escape',
        description: 'Wind, waves, and whitewashed walls — the Atlantic jewel of Morocco',
        duration_days: 3,
        tier: 'explorer',
        region: 'Morocco',
        locations: [
          { name: 'Essaouira Medina', lat: 31.5085, lng: -9.7595, transport: 'Walking', duration: '60', day_number: 1, tips: 'Get lost in the vibrant blue alleys.', category: 'landmark' },
          { name: 'Skala de la Ville', lat: 31.5125, lng: -9.7712, transport: 'Walking', duration: '60', day_number: 1, tips: 'Great spot for ocean photography.', category: 'landmark' },
          { name: 'Moulay Hassan Square', lat: 31.5080, lng: -9.7590, transport: 'Walking', duration: '60', day_number: 2, tips: 'Enjoy fresh seafood at the stalls.', category: 'landmark' },
          { name: 'Essaouira Beach', lat: 31.4900, lng: -9.7500, transport: 'Walking', duration: '60', day_number: 2, tips: 'Perfect for kite surfing watching.', category: 'nature' },
          { name: 'Diabat Village', lat: 31.4667, lng: -9.7500, transport: 'Walking', duration: '60', day_number: 3, tips: 'Visit the ruined palace in the sand.', category: 'heritage' },
        ]
      },
      {
        title: 'Casablanca Modern Morocco',
        description: 'Art Deco architecture, the Hassan II Mosque, and the pulse of Morocco\'s economic capital',
        duration_days: 2,
        tier: 'explorer',
        region: 'Morocco',
        locations: [
          { name: 'Hassan II Mosque', lat: 33.6086, lng: -7.6326, transport: 'Taxi', duration: '75', day_number: 1, tips: 'Check tour times in advance.', category: 'landmark' },
          { name: 'Corniche Ain Diab', lat: 33.5950, lng: -7.6720, transport: 'Taxi', duration: '75', day_number: 1, tips: 'A lovely sunset walk by the ocean.', category: 'nature' },
          { name: 'Old Medina Casablanca', lat: 33.5950, lng: -7.6190, transport: 'Taxi', duration: '75', day_number: 1, tips: 'A more localized market experience.', category: 'heritage' },
          { name: 'Villa des Arts', lat: 33.5867, lng: -7.6200, transport: 'Taxi', duration: '75', day_number: 2, tips: 'Great contemporary art exhibitions.', category: 'heritage' },
          { name: 'Morocco Mall', lat: 33.5600, lng: -7.6900, transport: 'Taxi', duration: '75', day_number: 2, tips: 'Massive mall with a giant aquarium.', category: 'landmark' },
        ]
      },
      {
        title: 'Rabat Imperial Capital',
        description: 'UNESCO heritage sites, the Royal Palace, and a medina frozen in time',
        duration_days: 2,
        tier: 'explorer',
        region: 'Morocco',
        locations: [
          { name: 'Chellah Necropolis', lat: 33.9867, lng: -6.8400, transport: 'Walking', duration: '60', day_number: 1, tips: 'Beautiful Roman and Islamic ruins.', category: 'heritage' },
          { name: 'Kasbah of the Udayas', lat: 34.0333, lng: -6.8333, transport: 'Walking', duration: '60', day_number: 1, tips: 'Blue and white streets like Chefchaouen.', category: 'landmark' },
          { name: 'Hassan Tower', lat: 34.0244, lng: -6.8206, transport: 'Walking', duration: '60', day_number: 1, tips: 'An iconic unfinished minaret.', category: 'landmark' },
          { name: 'Rabat Medina', lat: 34.0200, lng: -6.8300, transport: 'Walking', duration: '60', day_number: 2, tips: 'Much calmer than other medinas.', category: 'landmark' },
          { name: 'Mohammed VI Museum', lat: 33.9950, lng: -6.8550, transport: 'Taxi', duration: '60', day_number: 2, tips: 'Modern and contemporary art collections.', category: 'heritage' },
        ]
      },
      {
        title: 'Ouarzazate — Gateway to the Sahara',
        description: 'The Hollywood of Africa — ancient kasbahs, film studios, and desert landscapes',
        duration_days: 3,
        tier: 'nomad',
        region: 'Morocco',
        locations: [
          { name: 'Taourirt Kasbah', lat: 30.9200, lng: -6.8900, transport: '4x4', duration: '90', day_number: 1, tips: 'Intricate architecture, partially restored.', category: 'heritage' },
          { name: 'Atlas Film Studios', lat: 30.9300, lng: -6.9200, transport: '4x4', duration: '90', day_number: 1, tips: 'See sets from famous movies.', category: 'landmark' },
          { name: 'Fint Oasis', lat: 30.8700, lng: -6.8500, transport: '4x4', duration: '90', day_number: 2, tips: 'A hidden lush green paradise.', category: 'nature' },
          { name: 'Draa Valley Palmery', lat: 30.7500, lng: -6.7500, transport: '4x4', duration: '90', day_number: 3, tips: 'Millions of palm trees.', category: 'nature' },
          { name: 'Skoura Oasis', lat: 31.0667, lng: -6.5500, transport: '4x4', duration: '90', day_number: 3, tips: 'Known as the oasis of 1000 palms.', category: 'nature' },
        ]
      },
      {
        title: 'Aït Benhaddou & High Atlas',
        description: 'A UNESCO ksar that has starred in Game of Thrones, Gladiator, and Lawrence of Arabia',
        duration_days: 2,
        tier: 'elite',
        region: 'Morocco',
        locations: [
          { name: 'Aït Benhaddou Ksar', lat: 31.0472, lng: -7.1294, transport: '4x4', duration: '120', day_number: 1, tips: 'Climb to the granary at the top for views.', category: 'heritage' },
          { name: 'Telouet Kasbah', lat: 31.3667, lng: -7.2333, transport: '4x4', duration: '120', day_number: 1, tips: 'Once home to the powerful Glaoui family.', category: 'heritage' },
          { name: 'Tizi n\'Tichka Summit', lat: 31.2167, lng: -7.3667, transport: '4x4', duration: '120', day_number: 2, tips: 'Highest major mountain pass in North Africa.', category: 'nature' },
          { name: 'Ounila Valley', lat: 31.1000, lng: -7.1500, transport: '4x4', duration: '120', day_number: 2, tips: 'Salt mines and incredible red rock formations.', category: 'nature' },
        ]
      },
      {
        title: 'Northern Circuit — Chefchaouen & Fes',
        description: 'The Blue Pearl of the Rif mountains and the medieval maze of Fes el-Bali',
        duration_days: 5,
        tier: 'elite',
        region: 'Morocco',
        locations: [
          { name: 'Chefchaouen Medina', lat: 35.1688, lng: -5.2636, transport: 'Walking', duration: '90', day_number: 1, tips: 'Every alley is a photo opportunity.', category: 'landmark' },
          { name: 'Ras el-Maa Waterfall', lat: 35.1750, lng: -5.2550, transport: 'Walking', duration: '60', day_number: 2, tips: 'Locals gather here to wash clothes and cool off.', category: 'nature' },
          { name: 'Fes el-Bali', lat: 34.0647, lng: -4.9731, transport: 'Bus', duration: '90', day_number: 3, tips: 'Hire a guide to navigate the 9000 streets.', category: 'heritage' },
          { name: 'Al-Qarawiyyin University', lat: 34.0644, lng: -4.9739, transport: 'Walking', duration: '60', day_number: 4, tips: 'Oldest continuously operating university.', category: 'heritage' },
          { name: 'Chouara Tannery', lat: 34.0658, lng: -4.9697, transport: 'Walking', duration: '60', day_number: 4, tips: 'Take the offered mint sprig for the smell.', category: 'landmark' },
          { name: 'Meknès Medina', lat: 33.8953, lng: -5.5547, transport: 'Walking', duration: '90', day_number: 5, tips: 'More laid back than Fes.', category: 'heritage' },
        ]
      }
    ];

    for (const it of newItineraries) {
      // Check if exists
      const { data: existing, error: findErr } = await supabase
        .from('itineraries')
        .select('id')
        .ilike('title', `%${it.title}%`)
        .maybeSingle();

      let itineraryId = existing?.id;

      if (findErr) {
        console.error(`[STEP 2 ERROR] Error finding itinerary ${it.title}:`, findErr.message);
        failedRows.push(`Find Itinerary: ${it.title}`);
        continue;
      }

      if (existing) {
        console.log(`[STEP 2] Itinerary "${it.title}" exists. Skipping insert, proceeding to locations.`);
        itinerariesSkipped++;
      } else {
        const { data: insertedIt, error: insErr } = await supabase
          .from('itineraries')
          .insert({
            title: it.title,
            description: it.description,
            duration_days: it.duration_days,
            tier: it.tier,
            region: it.region
          })
          .select('id')
          .single();

        if (insErr) {
          console.error(`[STEP 2 ERROR] Failed to insert itinerary ${it.title}:`, insErr.message);
          failedRows.push(`Insert Itinerary: ${it.title}`);
          continue;
        }
        itineraryId = insertedIt.id;
        itinerariesInserted++;
      }

      // Upsert locations
      for (let i = 0; i < it.locations.length; i++) {
        const loc = it.locations[i];
        
        // Find if location already exists for this itinerary to upsert properly without ID if not using a unique constraint
        const { data: existingLoc } = await supabase
          .from('locations')
          .select('id')
          .eq('itinerary_id', itineraryId)
          .eq('name', loc.name)
          .maybeSingle();

        const locData = {
          itinerary_id: itineraryId,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          order_index: i + 1,
          day_number: loc.day_number,
          duration: loc.duration,
          transport: loc.transport,
          tips: loc.tips,
          category: loc.category,
          image_url: null,
          description: null
        };

        if (existingLoc) {
          const { error: updErr } = await supabase
            .from('locations')
            .update(locData)
            .eq('id', existingLoc.id);
            
          if (updErr) {
             console.error(`[STEP 2 ERROR] Failed to update location ${loc.name}:`, updErr.message);
             failedRows.push(`Update Location: ${loc.name}`);
          }
        } else {
          const { error: locInsErr } = await supabase
            .from('locations')
            .insert(locData);
            
          if (locInsErr) {
            console.error(`[STEP 2 ERROR] Failed to insert location ${loc.name}:`, locInsErr.message);
            failedRows.push(`Insert Location: ${loc.name}`);
          } else {
            locationsInserted++;
          }
        }
      }
    }

  } catch (err: any) {
    console.error('[FATAL ERROR]', err.message);
  } finally {
    console.log('\n[STEP 3] --- FINAL SUMMARY ---');
    console.log(`Itineraries Inserted: ${itinerariesInserted}`);
    console.log(`Itineraries Skipped: ${itinerariesSkipped}`);
    console.log(`New Locations Inserted: ${locationsInserted}`);
    console.log(`Existing Locations Updated: ${updatedLocationsCount}`);
    if (failedRows.length > 0) {
      console.log('Failed Rows:', failedRows);
    } else {
      console.log('Zero failures!');
    }
  }
}

main();
