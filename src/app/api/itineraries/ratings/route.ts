import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Using raw SQL query via rpc if possible, or just fetch all ratings and group
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('itinerary_id, rating')
      .eq('target_type', 'itinerary')

    if (error) {
      console.error('Error fetching ratings:', error)
      return NextResponse.json([])
    }

    // Group and average client side since Supabase JS client doesn't support GROUP BY natively yet
    // Alternatively, we could create an RPC, but doing it in JS is fine for small datasets.
    const grouped = (reviews || []).reduce((acc: Record<string, { sum: number, count: number }>, review) => {
      if (review.itinerary_id) {
        if (!acc[review.itinerary_id]) acc[review.itinerary_id] = { sum: 0, count: 0 }
        acc[review.itinerary_id].sum += review.rating
        acc[review.itinerary_id].count += 1
      }
      return acc
    }, {})

    const ratings = Object.entries(grouped).map(([itinerary_id, { sum, count }]) => ({
      itinerary_id,
      average: sum / count,
    }))

    return NextResponse.json(ratings)
  } catch (error) {
    console.error('API /api/itineraries/ratings error:', error)
    return NextResponse.json([])
  }
}
