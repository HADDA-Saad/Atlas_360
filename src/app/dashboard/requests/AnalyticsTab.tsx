'use client'

import { Activity, Users, DollarSign, BookOpen, MessageSquare, Briefcase } from 'lucide-react'

interface UserStat {
  tier: string
  created_at: string
}

interface BookingStat {
  total_price: number
  commission_amount: number
  status: string
}

interface AnalyticsTabProps {
  initialData: {
    profiles: UserStat[]
    bookings: BookingStat[]
    itinerariesCount: number
    reviewsCount: number
    assistanceCount: number
  }
}

export default function AnalyticsTab({ initialData }: AnalyticsTabProps) {
  const { profiles, bookings, itinerariesCount, reviewsCount, assistanceCount } = initialData

  // 1. User Distribution Calculations
  const totalUsers = profiles.length || 1
  const explorerCount = profiles.filter(p => p.tier === 'explorer').length
  const nomadCount = profiles.filter(p => p.tier === 'nomad').length
  const eliteCount = profiles.filter(p => p.tier === 'elite').length
  const conciergeCount = profiles.filter(p => p.tier === 'concierge').length

  const explorerPct = (explorerCount / totalUsers) * 100
  const nomadPct = (nomadCount / totalUsers) * 100
  const elitePct = (eliteCount / totalUsers) * 100
  const conciergePct = (conciergeCount / totalUsers) * 100

  // 2. Financial Metrics Calculations
  const validBookings = bookings.filter(b => b.status === 'paid' || b.status === 'completed')
  const grossBookingValue = validBookings.reduce((sum, b) => sum + b.total_price, 0)
  const totalCommissions = validBookings.reduce((sum, b) => sum + b.commission_amount, 0)

  // Estimated subscription revenue
  const monthlySubscriptionRevenue = (nomadCount * 99) + (eliteCount * 199) + (conciergeCount * 1000) // Estimation in MAD

  // 3. User Registration Timeline (Last 6 Months)
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return {
      label: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      month: d.getMonth(),
      year: d.getFullYear(),
      count: 0
    }
  }).reverse()

  profiles.forEach(p => {
    const date = new Date(p.created_at)
    const match = last6Months.find(m => m.month === date.getMonth() && m.year === date.getFullYear())
    if (match) match.count++
  })

  const maxSignupCount = Math.max(...last6Months.map(m => m.count), 1)

  return (
    <div className="space-y-8">
      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gross Bookings Widget */}
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Gross Booking Value</p>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl font-bold text-foreground mt-1">
                {grossBookingValue.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">MAD</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="font-semibold text-emerald-400">{validBookings.length}</span> completed guide bookings
          </p>
        </div>

        {/* Commissions Earned Widget */}
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Platform Commission (10%)</p>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl font-bold text-[#D4622E] mt-1">
                {totalCommissions.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">MAD</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-[#D4622E] border border-primary/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            Estimated commission profits from guide hiring
          </p>
        </div>

        {/* Total Platform Revenue Widget */}
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Est. Monthly Recurring Revenue</p>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl font-bold text-amber-400 mt-1">
                {monthlySubscriptionRevenue.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">MAD/mo</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            From Active Subscriptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution Widget */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground tracking-tight mb-2">
              User Subscription Tiers
            </h4>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-6">
              Total Active Accounts: {totalUsers}
            </p>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden bg-muted flex mb-8">
              <div style={{ width: `${explorerPct}%` }} className="bg-muted-foreground/30 h-full" title="Explorer" />
              <div style={{ width: `${nomadPct}%` }} className="bg-[#D4622E] h-full" title="Nomad" />
              <div style={{ width: `${elitePct}%` }} className="bg-amber-400 h-full" title="Elite" />
              <div style={{ width: `${conciergePct}%` }} className="bg-purple-500 h-full" title="Concierge" />
            </div>

            {/* Tier Lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-border/40 bg-background/50 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Explorer (Free)</span>
                <span className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-foreground mt-2">{explorerCount}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{explorerPct.toFixed(0)}% of members</span>
              </div>
              <div className="p-4 rounded-xl border border-primary/10 bg-[#D4622E]/5 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#D4622E]">Nomad (99 MAD/mo)</span>
                <span className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-[#D4622E] mt-2">{nomadCount}</span>
                <span className="text-[10px] text-[#D4622E]/80 mt-1">{nomadPct.toFixed(0)}% of members</span>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-amber-400">Elite (199 MAD/mo)</span>
                <span className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-amber-400 mt-2">{eliteCount}</span>
                <span className="text-[10px] text-amber-400/80 mt-1">{elitePct.toFixed(0)}% of members</span>
              </div>
              <div className="p-4 rounded-xl border border-purple-500/10 bg-purple-500/5 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-purple-400">Concierge (1000 MAD/mo)</span>
                <span className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-purple-400 mt-2">{conciergeCount}</span>
                <span className="text-[10px] text-purple-400/80 mt-1">{conciergePct.toFixed(0)}% of members</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Widget */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground tracking-tight mb-2">
              User Registration Timeline
            </h4>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-6">
              New Account Registrations over the last 6 months
            </p>

            {/* Custom SVG Bar Chart */}
            <div className="flex items-end justify-between h-48 pt-6 gap-2 border-b border-border/40 pb-2">
              {last6Months.map(m => {
                const heightPct = (m.count / maxSignupCount) * 100
                return (
                  <div key={m.label} className="flex-1 flex flex-col items-center group h-full justify-end">
                    <span className="text-[10px] font-bold text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {m.count}
                    </span>
                    <div
                      className="w-full bg-primary/10 border border-primary/20 hover:bg-[#D4622E]/25 hover:border-[#D4622E]/50 rounded-t-md transition-all duration-300 relative overflow-hidden"
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#D4622E]/20 to-transparent" />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mt-3">
                      {m.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement metrics breakdown */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground tracking-tight mb-2">
          Platform Activity & Content
        </h4>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-6">
          Content volume and user inquiry indicators
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Itineraries Count */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Curated Guides</p>
              <h5 className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-foreground mt-0.5">{itinerariesCount}</h5>
            </div>
          </div>

          {/* Reviews Count */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">User Reviews</p>
              <h5 className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-foreground mt-0.5">{reviewsCount}</h5>
            </div>
          </div>

          {/* Assistance Requests Count */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Assistance Tickets</p>
              <h5 className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-foreground mt-0.5">{assistanceCount}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
