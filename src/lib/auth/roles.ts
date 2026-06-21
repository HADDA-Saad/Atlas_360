import { createClient } from '@/lib/supabase/server'

export type UserRole = 'member' | 'moderator' | 'admin'

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return (data?.role as UserRole) ?? null
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentUserRole()) === 'admin'
}

export async function isStaff(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'admin' || role === 'moderator'
}
