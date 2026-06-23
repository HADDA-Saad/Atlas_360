import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Atlas 360',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, birth_date')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background atlas-grain pb-20">
      {/* Header Banner */}
      <div className="w-full h-[140px] bg-card dark:bg-[#111] relative border-b border-border flex items-end">
        <div className="absolute inset-0 atlas-grain opacity-50"></div>
        <div className="w-full max-w-4xl mx-auto px-6 md:px-12 pb-8 relative z-10">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
            Account Settings
          </h1>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-6 md:px-12 pt-10">
        <SettingsForm 
          initialName={profile?.full_name || null} 
          initialAvatarUrl={profile?.avatar_url || null}
          initialBirthDate={profile?.birth_date || null}
          email={user.email || ''} 
        />
      </div>
    </div>
  )
}
