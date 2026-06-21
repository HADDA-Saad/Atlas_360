import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { bucket, path } = await params
    const filePath = path.join('/')

    const admin = createAdminClient()
    
    // Create a short-lived signed URL for the admin to view the document
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrl(filePath, 60) // valid for 60 seconds

    if (error || !data?.signedUrl) {
      throw error || new Error('Could not generate signed URL')
    }

    return NextResponse.json({ url: data.signedUrl })
  } catch (error: any) {
    console.error('Signed URL generation error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
