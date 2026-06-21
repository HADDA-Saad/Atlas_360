import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id: verificationId } = await params
    const { status, admin_notes } = await request.json()

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const admin = createAdminClient()

    // 1. Update the verification request
    const { data: verification, error: verifyError } = await admin
      .from('guide_verifications')
      .update({ status, admin_notes })
      .eq('id', verificationId)
      .select('guide_id')
      .single()

    if (verifyError || !verification) {
      throw verifyError || new Error('Verification not found')
    }

    // 2. If approved, update the guides table to set is_verified = true
    if (status === 'approved') {
      const { error: guideError } = await admin
        .from('guides')
        .update({ is_verified: true })
        .eq('id', verification.guide_id)
        
      if (guideError) throw guideError
    } else if (status === 'rejected') {
      const { error: guideError } = await admin
        .from('guides')
        .update({ is_verified: false })
        .eq('id', verification.guide_id)
        
      if (guideError) throw guideError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Verification update error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
