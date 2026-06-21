import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, UserCheck, Image, Banknote, Users, BarChart2 } from 'lucide-react'
import StatusSelect from './StatusSelect'
import TeamMemberSelect from './TeamMemberSelect'
import NotesEditor from './NotesEditor'
import GuideVerificationTab from './GuideVerificationTab'
import PhotoModerationTab from './PhotoModerationTab'
import GuidePayoutsTab from './GuidePayoutsTab'
import { isAdmin } from '@/lib/auth/roles'
import UserManagementTab from './UserManagementTab'
import AnalyticsTab from './AnalyticsTab'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Operations Dashboard | Atlas 360 Admin',
}

interface AssistanceRequest {
  id: string
  request_type: string
  contact_name: string | null
  contact_email: string
  message: string
  status: string
  itinerary_id: string | null
  place_id: string | null
  place_name: string | null
  place_type: string | null
  source_path: string | null
  assigned_team_member: string | null
  internal_notes: string | null
  created_at: string
}

export default async function RequestsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !await isAdmin()) {
    redirect('/dashboard')
  }

  const { type, status, tab = 'requests' } = await searchParams
  const adminSupabase = createAdminClient()

  // Fetch profiles to map names client-side
  const { data: profilesData } = await adminSupabase
    .from('profiles')
    .select('id, full_name')
  const profiles = profilesData || []

  // Load data depending on active tab
  let requests: AssistanceRequest[] = []
  let statusCounts = { new: 0, in_progress: 0, completed: 0, closed: 0 }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let guidesList: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reviewsList: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payoutsList: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let usersList: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let analyticsData: any = null

  if (tab === 'requests') {
    let query = supabase
      .from('assistance_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      query = query.eq('request_type', type)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: requestsData } = await query
    requests = (requestsData || []) as AssistanceRequest[]

    const { data: countData } = await supabase
      .from('assistance_requests')
      .select('status')
    
    const rawRequests = countData || []
    statusCounts = {
      new: rawRequests.filter(r => r.status === 'new').length,
      in_progress: rawRequests.filter(r => r.status === 'in_progress').length,
      completed: rawRequests.filter(r => r.status === 'completed').length,
      closed: rawRequests.filter(r => r.status === 'closed').length,
    }
  } else if (tab === 'guides') {
    const { data: guidesData } = await adminSupabase
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false })

    guidesList = (guidesData || []).map(g => {
      const p = profiles.find(prof => prof.id === g.id)
      return {
        ...g,
        full_name: p ? p.full_name : 'Unnamed Guide'
      }
    })
  } else if (tab === 'photos') {
    const { data: reviewsData } = await adminSupabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    reviewsList = (reviewsData || [])
      .filter(r => r.photo_urls && r.photo_urls.length > 0)
      .map(r => {
        const p = profiles.find(prof => prof.id === r.user_id)
        return {
          ...r,
          full_name: p ? p.full_name : 'Anonymous Traveler'
        }
      })
  } else if (tab === 'payouts') {
    const { data: bookingsData } = await adminSupabase
      .from('guide_bookings')
      .select('*')
      .in('status', ['accepted', 'paid', 'completed'])
      .order('created_at', { ascending: false })

    payoutsList = (bookingsData || []).map(b => {
      const traveler = profiles.find(prof => prof.id === b.traveler_id)
      const guide = profiles.find(prof => prof.id === b.guide_id)
      return {
        ...b,
        traveler_name: traveler ? traveler.full_name : 'Unknown Traveler',
        guide_name: guide ? guide.full_name : 'Local Guide',
      }
    })
  } else if (tab === 'users') {
    const { data: profilesData } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: authData } = await adminSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    const authUsers = authData?.users || []
    usersList = (profilesData || []).map(p => {
      const authUser = authUsers.find(u => u.id === p.id)
      return {
        ...p,
        email: authUser?.email || 'Unknown email'
      }
    })
  } else if (tab === 'analytics') {
    const { data: profilesData } = await adminSupabase
      .from('profiles')
      .select('tier, created_at')

    const { data: bookingsData } = await adminSupabase
      .from('guide_bookings')
      .select('total_price, commission_amount, status')

    const { count: itinerariesCount } = await adminSupabase
      .from('itineraries')
      .select('*', { count: 'exact', head: true })

    const { count: reviewsCount } = await adminSupabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })

    const { count: assistanceCount } = await adminSupabase
      .from('assistance_requests')
      .select('*', { count: 'exact', head: true })

    analyticsData = {
      profiles: profilesData || [],
      bookings: bookingsData || [],
      itinerariesCount: itinerariesCount || 0,
      reviewsCount: reviewsCount || 0,
      assistanceCount: assistanceCount || 0
    }
  }

  return (
    <div className="min-h-screen bg-background py-28 px-4 atlas-grain">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-3 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground tracking-tight">
              Operations & Moderation
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Manage requests, verify guides, and moderate uploaded review media
            </p>
          </div>
        </div>

        {/* Tab Selector Navbar */}
        <div className="flex border-b border-border mb-8 overflow-x-auto gap-2">
          {[
            { id: 'requests', label: 'Assistance Requests', icon: <ClipboardList size={14} /> },
            { id: 'users', label: 'User Management', icon: <Users size={14} /> },
            { id: 'guides', label: 'Guide Verification', icon: <UserCheck size={14} /> },
            { id: 'photos', label: 'Review Photos', icon: <Image size={14} /> },
            { id: 'payouts', label: 'Guide Payouts', icon: <Banknote size={14} /> },
            { id: 'analytics', label: 'Analytics & KPIs', icon: <BarChart2 size={14} /> },
          ].map(t => {
            const isActive = tab === t.id
            return (
              <Link
                key={t.id}
                href={`/dashboard/requests?tab=${t.id}`}
                className={`pb-4 px-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-foreground font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {t.icon}
                  {t.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Tab Workspace */}
        {tab === 'requests' && (
          <div className="space-y-6">
            {/* Status summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'New', count: statusCounts.new, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                { label: 'In Progress', count: statusCounts.in_progress, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                { label: 'Completed', count: statusCounts.completed, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
                { label: 'Closed', count: statusCounts.closed, color: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                  <span className="text-2xl font-[family-name:var(--font-cormorant)] font-semibold">{s.count}</span>
                  <p className="text-[10px] uppercase tracking-widest font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-card/40 border border-border p-4 rounded-xl">
              <div className="flex items-center gap-6">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Type:</span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Planning', value: 'planning' },
                    { label: 'Booking', value: 'booking_help' },
                  ].map(t => {
                    const isActive = (type || 'all') === t.value
                    return (
                      <Link
                        key={t.value}
                        href={`/dashboard/requests?tab=requests&type=${t.value}${status ? `&status=${status}` : ''}`}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wide border transition-all ${
                          isActive 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20' 
                            : 'bg-background hover:border-primary/30 border-border text-muted-foreground'
                        }`}
                      >
                        {t.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Status:</span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'New', value: 'new' },
                    { label: 'In Progress', value: 'in_progress' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Closed', value: 'closed' },
                  ].map(s => {
                    const isActive = (status || 'all') === s.value
                    return (
                      <Link
                        key={s.value}
                        href={`/dashboard/requests?tab=requests&status=${s.value}${type ? `&type=${type}` : ''}`}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wide border transition-all ${
                          isActive 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20' 
                            : 'bg-background hover:border-primary/30 border-border text-muted-foreground'
                        }`}
                      >
                        {s.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Requests table */}
            {requests.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                <p className="text-muted-foreground text-sm">No requests match the current filters.</p>
              </div>
            ) : (
              <div className="border border-border rounded-2xl overflow-hidden bg-card/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card/50">
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Date</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Type</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Contact</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Message</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Place</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Assignee</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Internal Notes</th>
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(request => (
                        <tr key={request.id} className="border-b border-border last:border-0 hover:bg-card/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground text-[12px] whitespace-nowrap">
                            {new Date(request.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              request.request_type === 'booking_help'
                                ? 'bg-primary/10 text-[#D4622E] border border-primary/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {request.request_type === 'booking_help' ? 'Booking' : 'Planning'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-foreground text-[13px] font-medium">{request.contact_name || '—'}</p>
                            <p className="text-muted-foreground text-[11px]">{request.contact_email}</p>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="text-muted-foreground text-[12px] line-clamp-2" title={request.message}>{request.message}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-[12px] max-w-[120px] truncate">
                            {request.place_name || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <TeamMemberSelect requestId={request.id} currentAssignee={request.assigned_team_member} />
                          </td>
                          <td className="px-4 py-3">
                            <NotesEditor requestId={request.id} initialNotes={request.internal_notes} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusSelect requestId={request.id} currentStatus={request.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <UserManagementTab initialUsers={usersList} />
        )}

        {tab === 'guides' && (
          <GuideVerificationTab initialGuides={guidesList} />
        )}

        {tab === 'photos' && (
          <PhotoModerationTab initialReviews={reviewsList} />
        )}

        {tab === 'payouts' && (
          <GuidePayoutsTab initialBookings={payoutsList} />
        )}

        {tab === 'analytics' && analyticsData && (
          <AnalyticsTab initialData={analyticsData} />
        )}
      </div>
    </div>
  )
}
