import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function runSetup() {
  let skippedFiles: string[] = []
  let unmatchedTitles: string[] = []
  let imagesUploaded = 0
  let rowsUpdated = 0

  console.log('[START] Running setup script...')

  // Step 1: Add column
  console.log('[STEP 1] Checking cover_image_url column...')
  try {
    const { error } = await supabase.from('itineraries').select('cover_image_url').limit(1)
    if (error) {
      if (error.message.includes('column') || error.code === '42703') {
        console.log(`[STEP 1] ERROR: Column does not exist.`)
        console.log(`MANUAL STEP REQUIRED: Please run this SQL manually in the Supabase dashboard SQL editor:`)
        console.log(`ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS cover_image_url text;`)
        console.log(`— then STOP and wait. Exiting script.`)
        process.exit(1)
      } else {
        console.log(`[STEP 1] ERROR checking column:`, error.message)
        console.log(`[STEP 1] SKIP and continue.`)
      }
    } else {
      console.log(`[STEP 1] cover_image_url column already exists — skipping`)
    }
  } catch (err: any) {
    console.log(`[STEP 1] ERROR:`, err.message)
    console.log(`[STEP 1] SKIP and continue.`)
  }

  // Step 2: Create bucket
  console.log('[STEP 2] Creating covers storage bucket...')
  try {
    const { error } = await supabase.storage.createBucket('covers', { public: true })
    if (error) {
      if (error.message.includes('already exists') || (error as any).error === 'Duplicate') {
        console.log(`[STEP 2] covers bucket already exists — skipping`)
      } else {
        console.log(`[STEP 2] ERROR creating bucket:`, error.message)
        console.log(`[STEP 2] SKIP and continue.`)
      }
    } else {
      console.log(`[STEP 2] Created bucket successfully.`)
    }
  } catch (err: any) {
    console.log(`[STEP 2] ERROR:`, err.message)
    console.log(`[STEP 2] SKIP and continue.`)
  }

  // Step 3: Upload images
  console.log('[STEP 3] Uploading images...')
  const images = ['jame3.png', 'camels.png', 'sea.png']
  for (const filename of images) {
    const filePath = path.join(process.cwd(), 'public', 'Images', filename)
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`[STEP 3] WARNING: File does not exist: ${filePath}`)
        skippedFiles.push(filename)
        continue
      }
      
      const fileBuffer = fs.readFileSync(filePath)
      const { error } = await supabase.storage.from('covers').upload(filename, fileBuffer, { contentType: 'image/png', upsert: false })
      
      if (error) {
        if ((error as any).statusCode === '409' || error.message.includes('already exists')) {
          console.log(`[STEP 3] ${filename} already exists — skipping`)
        } else {
          console.log(`[STEP 3] ERROR uploading ${filename}:`, error.message)
          console.log(`[STEP 3] SKIP and continue.`)
        }
      } else {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/covers/${filename}`
        console.log(`[STEP 3] Uploaded ${filename} successfully. Public URL: ${publicUrl}`)
        imagesUploaded++
      }
    } catch (err: any) {
      console.log(`[STEP 3] ERROR processing ${filename}:`, err.message)
      console.log(`[STEP 3] SKIP and continue.`)
    }
  }

  // Step 4: Update itinerary rows
  console.log('[STEP 4] Updating itinerary rows...')
  try {
    const { data: itineraries, error } = await supabase.from('itineraries').select('id, title')
    if (error) {
      console.log(`[STEP 4] ERROR fetching itineraries:`, error.message)
      console.log(`[STEP 4] SKIP and continue.`)
    } else if (itineraries) {
      for (const itinerary of itineraries) {
        const title = itinerary.title.toLowerCase()
        let filename = ''
        
        if (title.includes('marrakech') || title.includes('red city')) {
          filename = 'jame3.png'
        } else if (title.includes('sahara') || title.includes('sand')) {
          filename = 'camels.png'
        } else if (title.includes('coastal') || title.includes('essaouira') || title.includes('whisper')) {
          filename = 'sea.png'
        }
        
        if (!filename) {
          console.log(`[STEP 4] No image match for: ${itinerary.title} — skipping`)
          unmatchedTitles.push(itinerary.title)
          continue
        }
        
        const url = `${supabaseUrl}/storage/v1/object/public/covers/${filename}`
        const { error: updateError } = await supabase.from('itineraries').update({ cover_image_url: url }).eq('id', itinerary.id)
        
        if (updateError) {
          console.log(`[STEP 4] ERROR updating row ${itinerary.id}:`, updateError.message)
          console.log(`[STEP 4] SKIP and continue.`)
        } else {
          rowsUpdated++
        }
      }
    }
  } catch (err: any) {
    console.log(`[STEP 4] ERROR:`, err.message)
    console.log(`[STEP 4] SKIP and continue.`)
  }

  // Step 5: Final summary
  console.log('[STEP 5] Final Summary:')
  console.log(`- Column check: completed`)
  console.log(`- Bucket check: completed`)
  console.log(`- Images uploaded: ${imagesUploaded}`)
  console.log(`- Files skipped: ${skippedFiles.length > 0 ? skippedFiles.join(', ') : 'none'}`)
  console.log(`- Rows updated: ${rowsUpdated}`)
  
  if (skippedFiles.length > 0 || unmatchedTitles.length > 0) {
    console.log('\n=============================')
    console.log('MANUAL STEPS NEEDED')
    console.log('=============================')
    if (skippedFiles.length > 0) {
      console.log('Missing files to add to public/Images/:')
      skippedFiles.forEach(f => console.log(`  - ${f}`))
    }
    if (unmatchedTitles.length > 0) {
      console.log('Itineraries that need cover_image_url set manually (no title match):')
      unmatchedTitles.forEach(t => console.log(`  - ${t}`))
    }
  }
}

runSetup()
