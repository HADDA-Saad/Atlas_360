import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      first_name, last_name, birth_date,
      id_document_url, license_document_url,
      bio, languages, regions, daily_rate_mad, whatsapp_number, profile_picture_url
    } = body

    const admin = createAdminClient()

    // 1. Update the guides table (bio, languages, regions, daily_rate, whatsapp, profile_picture)
    const { error: guideError } = await admin
      .from('guides')
      .update({
        bio,
        languages,
        regions,
        daily_rate_mad: Number(daily_rate_mad),
        whatsapp_number,
        profile_picture_url
      })
      .eq('id', user.id)

    if (guideError) throw guideError

    // 2. Upsert the verification request (admin bypasses triggers)
    const { error: verifyError } = await admin
      .from('guide_verifications')
      .upsert({
        guide_id: user.id,
        first_name,
        last_name,
        birth_date,
        id_document_url,
        license_document_url,
        status: 'pending',
        admin_notes: null
      }, { onConflict: 'guide_id' })

    if (verifyError) throw verifyError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Guide Verification error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
