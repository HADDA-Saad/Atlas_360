import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface AIItineraryRequestBody {
  prompt?: unknown
}

interface LocationInventoryItem {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  category: string | null
  best_time: string | null
  tips: string | null
  region: string | null
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Retrieve user profile to check tier and ai_generations_count
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tier, ai_generations_count')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const tier = profile.tier || 'explorer'
    const genCount = profile.ai_generations_count || 0

    // Enforce free tier (explorer) hard limit
    if (tier === 'explorer' && genCount >= 1) {
      return NextResponse.json({
        error: 'LIMIT_EXCEEDED',
        message: 'You have reached the limit of 1 free AI generation. Upgrade to Nomad or Elite for more!'
      }, { status: 403 })
    }

    // Enforce Nomad limit
    if (tier === 'nomad' && genCount >= 6) {
      return NextResponse.json({
        error: 'LIMIT_EXCEEDED',
        message: 'You have reached the limit of 6 AI generations on the Nomad plan. Upgrade to Elite for unlimited trips!'
      }, { status: 403 })
    }

    const body = await request.json() as AIItineraryRequestBody
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Retrieve location inventory to pass to Gemini
    const { data: dbLocationsRaw, error: dbLocationsError } = await supabase
      .from('locations')
      .select(`
        id,
        name,
        description,
        lat,
        lng,
        category,
        best_time,
        tips,
        itineraries (
          region
        )
      `)

    if (dbLocationsError) {
      console.error('Error fetching locations inventory:', dbLocationsError)
    }

    // Map database locations into a clean context format
    const dbLocations: LocationInventoryItem[] = (dbLocationsRaw || []).map((loc: any) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      lat: loc.lat,
      lng: loc.lng,
      category: loc.category,
      best_time: loc.best_time,
      tips: loc.tips,
      region: loc.itineraries?.region || null
    }))

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error: GEMINI_API_KEY is missing' }, { status: 500 })
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

    // System prompt setting the context and instructions
    const systemInstruction = `You are a luxury editorial travel planner for Atlas 360, specializing in Morocco.
You are given a traveler's natural language request and a list of existing locations in our database.
Your goal is to construct a tailored day-by-day itinerary.

Rules:
1. Parse the traveler's request to identify constraints: start city, duration (number of days, defaulting to 2-3 if not specified), pace (relaxed, moderate, active), and interests.
2. Build a coherent sequence of stops (day-by-day).
3. Try to select stops from the provided database locations first. If you select an existing location from the inventory, you MUST use its exact name, description, lat, lng, category, and set 'existing_location_id' to its exact UUID.
4. If there are no database locations that fit the route, duration, or interests, you may generate new custom locations. For generated locations, set 'existing_location_id' to null (or omit it), and supply realistic coordinates (lat/lng) in Morocco, a short descriptive name, and a rich luxury travel description.
5. Order stops logically. The 'order_index' field must be sequential across the whole itinerary, starting at 1 for the first stop on Day 1 and incrementing continuously (e.g. 1, 2, 3, 4, 5).
6. Return your response in the requested structured JSON format.`

    const apiBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Here is the locations inventory: ${JSON.stringify(dbLocations)}

Traveler Request: "${prompt}"`
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: systemInstruction
          }
        ]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            description: { type: 'STRING' },
            stops: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  description: { type: 'STRING' },
                  day_number: { type: 'INTEGER' },
                  order_index: { type: 'INTEGER' },
                  category: {
                    type: 'STRING',
                    enum: ['landmark', 'market', 'museum', 'nature', 'food', 'viewpoint', 'religious', 'other']
                  },
                  duration_minutes: { type: 'INTEGER' },
                  tips: { type: 'STRING' },
                  lat: { type: 'NUMBER' },
                  lng: { type: 'NUMBER' },
                  existing_location_id: { type: 'STRING' }
                },
                required: ['name', 'description', 'day_number', 'order_index', 'category', 'lat', 'lng']
              }
            }
          },
          required: ['title', 'description', 'stops']
        }
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiBody)
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API call failed:', response.status, errText)
      return NextResponse.json({ error: 'Gemini request failed' }, { status: 502 })
    }

    const data = await response.json()
    
    // Extract the text content from Gemini's response structure
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!candidateText) {
      console.error('Unexpected Gemini API response structure:', data)
      return NextResponse.json({ error: 'Failed to generate itinerary content' }, { status: 500 })
    }

    let generatedItinerary
    try {
      generatedItinerary = JSON.parse(candidateText)
    } catch (parseError) {
      console.error('Failed to parse Gemini output text as JSON:', candidateText, parseError)
      return NextResponse.json({ error: 'Invalid JSON structure returned from model' }, { status: 500 })
    }

    // Increment generations count in the profiles table using service role client
    const adminSupabase = createAdminClient()
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ ai_generations_count: genCount + 1 })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profiles generations count:', updateError)
    }

    return NextResponse.json({
      itinerary: generatedItinerary,
      newGenerationsCount: genCount + 1
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    console.error('AI itinerary error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
