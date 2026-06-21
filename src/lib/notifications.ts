import { createAdminClient } from '@/lib/supabase/admin'

interface NotificationParams {
  user_id: string
  type: string
  title: string
  body: string
  link?: string
}

export async function createNotification(params: NotificationParams): Promise<void> {
  try {
    await createAdminClient()
      .from('notifications')
      .insert({
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link ?? '/dashboard',
      })
  } catch {
    // Notification failure must never break the calling request
  }
}

export async function notifyAdmins(
  adminEmails: string[],
  params: Omit<NotificationParams, 'user_id'>
): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const adminIds = users
      .filter(u => adminEmails.includes(u.email ?? ''))
      .map(u => u.id)
    if (adminIds.length === 0) return
    await admin.from('notifications').insert(
      adminIds.map(id => ({
        user_id: id,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link ?? '/dashboard',
      }))
    )
  } catch {
    // Notification failure must never break the calling request
  }
}
