'use client'

import { useState, useMemo } from 'react'
import BookingChat from '@/components/BookingChat'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'

interface GuideProfile {
  id: string
  bio: string | null
  languages: string[]
  regions: string[]
  daily_rate_mad: number
  is_verified: boolean
  rating: number | null
}

interface Booking {
  id: string
  traveler_id: string
  start_date: string
  end_date: string
  total_price: number
  commission_amount: number
  status: string
  created_at: string
  traveler_email?: string
  traveler_name?: string
  itineraries?: {
    title: string
  } | null
}

interface BlockedDate {
  id: string
  blocked_date: string
  reason: string | null
}

interface GuideDashboardClientProps {
  guide: GuideProfile
  initialBookings: Booking[]
  initialBlockedDates: BlockedDate[]
  userId: string
}

const AVAILABLE_LANGUAGES = ['Arabic', 'French', 'English', 'Berber', 'Spanish', 'German', 'Italian']
const AVAILABLE_REGIONS = ['Marrakech-Safi', 'High Atlas', 'Sahara-Merzouga', 'Chefchaouen-Rif', 'Rabat-Salé', 'Essaouira-Coast', 'Fes-Meknes']

export default function GuideDashboardClient({
  guide,
  initialBookings,
  initialBlockedDates,
  userId,
}: GuideDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'availability'>('bookings')

  // Booking states
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)

  // Profile states
  const [bio, setBio] = useState(guide.bio || '')
  const [dailyRate, setDailyRate] = useState(guide.daily_rate_mad)
  const [languages, setLanguages] = useState<string[]>(guide.languages || [])
  const [regions, setRegions] = useState<string[]>(guide.regions || [])
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Availability states
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [processingDay, setProcessingDay] = useState<string | null>(null)

  // Derived availability data for the calendar
  const activeRanges = useMemo(() =>
    bookings
      .filter(b => b.status === 'accepted' || b.status === 'paid')
      .map(b => ({ start: b.start_date, end: b.end_date })),
    [bookings]
  )
  const blockedDayList = useMemo(() => blockedDates.map(d => d.blocked_date), [blockedDates])
  const blockedDayIds  = useMemo(() =>
    Object.fromEntries(blockedDates.map(d => [d.blocked_date, d.id])),
    [blockedDates]
  )

  // Handlers
  const handleBookingAction = async (bookingId: string, action: 'accepted' | 'declined' | 'completed') => {
    setUpdatingBookingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })

      if (res.ok) {
        const updated = await res.json() as Booking
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: updated.status } : b))
        
        // If accepted, we need to refresh blocked dates list since backend auto-blocks them
        if (action === 'accepted') {
          // Re-fetch blocked dates from API
          const response = await fetch(`/api/guides/availability`)
          // In real client environment, let's just add it locally to avoid fetch delays
          window.location.reload()
        }
      } else {
        console.error('Failed to update booking status')
      }
    } catch (err) {
      console.error('Error updating booking', err)
    } finally {
      setUpdatingBookingId(null)
    }
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)

    try {
      const res = await fetch('/api/guides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          languages,
          regions,
          daily_rate_mad: Number(dailyRate),
        }),
      })

      if (res.ok) {
        setProfileMsg({ text: 'Profile updated successfully!', type: 'success' })
      } else {
        const data = await res.json() as { error?: string }
        setProfileMsg({ text: data.error || 'Failed to update profile.', type: 'error' })
      }
    } catch {
      setProfileMsg({ text: 'Network error occurred.', type: 'error' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate) return
    setAvailabilitySaving(true)
    setAvailabilityError(null)

    try {
      const res = await fetch('/api/guides/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocked_date: newDate,
          reason: newReason || null,
        }),
      })

      if (res.ok) {
        const added = await res.json() as BlockedDate
        setBlockedDates(prev => [...prev, added].sort((a, b) => a.blocked_date.localeCompare(b.blocked_date)))
        setNewDate('')
        setNewReason('')
      } else {
        const data = await res.json() as { error?: string }
        setAvailabilityError(data.error || 'Failed to block date.')
      }
    } catch {
      setAvailabilityError('Network error occurred.')
    } finally {
      setAvailabilitySaving(false)
    }
  }

  const handleRemoveBlockedDate = async (id: string) => {
    try {
      const res = await fetch(`/api/guides/availability?id=${id}`, { method: 'DELETE' })
      if (res.ok) setBlockedDates(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      console.error('Error removing blockout', err)
    }
  }

  // Calendar quick-block (no reason)
  const handleBlockDay = async (date: string) => {
    setProcessingDay(date)
    setAvailabilityError(null)
    try {
      const res = await fetch('/api/guides/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_date: date, reason: null }),
      })
      if (res.ok) {
        const added = await res.json() as BlockedDate
        setBlockedDates(prev => [...prev, added].sort((a, b) => a.blocked_date.localeCompare(b.blocked_date)))
      } else {
        const data = await res.json() as { error?: string }
        setAvailabilityError(data.error || 'Failed to block date.')
      }
    } catch {
      setAvailabilityError('Network error occurred.')
    } finally {
      setProcessingDay(null)
    }
  }

  // Calendar quick-unblock
  const handleUnblockDay = async (date: string, id: string) => {
    setProcessingDay(date)
    try {
      const res = await fetch(`/api/guides/availability?id=${id}`, { method: 'DELETE' })
      if (res.ok) setBlockedDates(prev => prev.filter(d => d.id !== id))
    } catch {
      // fail silently; list still reflects truth
    } finally {
      setProcessingDay(null)
    }
  }

  const toggleLanguage = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
  }

  const toggleRegion = (reg: string) => {
    setRegions(prev =>
      prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]
    )
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':   return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      case 'accepted':  return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'paid':      return 'bg-green-500/10 text-green-400 border border-green-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'declined':  return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'cancelled': return 'bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20'
      case 'expired':   return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
      default:          return 'bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20'
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-6">
      {/* Sidebar Nav */}
      <nav className="w-full md:w-[240px] flex-shrink-0 flex flex-col gap-1.5">
        {[
          { id: 'bookings', label: 'Reservations', icon: '📅' },
          { id: 'profile', label: 'Profile Settings', icon: '👤' },
          { id: 'availability', label: 'Availability Calendar', icon: '🔒' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest text-left border transition-all ${
              activeTab === tab.id
                ? 'bg-card border-primary text-foreground shadow-lg shadow-black/5'
                : 'border-border bg-card/40 hover:bg-card hover:border-primary/20 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Workspace Area */}
      <div className="flex-1 bg-card border border-border rounded-2xl p-6 md:p-8 min-h-[500px]">
        {/* Reservations Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground tracking-tight mb-2">
              Guide Reservations
            </h2>
            <p className="text-xs text-muted-foreground mb-8">
              Review incoming travel assignments, select accept to block your calendar dates, or manage schedules.
            </p>

            {bookings.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground text-sm font-medium">No reservations yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1.5">
                  Complete your profile so travelers can find and book you.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map(booking => (
                  <div
                    key={booking.id}
                    className="border border-border rounded-xl p-5 hover:border-primary/20 transition-colors bg-card/50 flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                        <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mt-2">
                          Client: {booking.traveler_name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Route: <span className="text-foreground">{booking.itineraries?.title || 'Custom Client Itinerary'}</span>
                        </p>
                      </div>

                      <div className="text-right md:self-end">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Total Price</p>
                        <p className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-primary">{booking.total_price} MAD</p>
                        <p className="text-[10.5px] text-muted-foreground italic mt-0.5">
                          Net earnings: {booking.total_price - booking.commission_amount} MAD (10% platform fee)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-y border-border/60 py-3 text-xs">
                      <div>
                        <p className="text-muted-foreground font-medium">Start Date</p>
                        <p className="text-foreground font-semibold mt-0.5">
                          {new Date(booking.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">End Date</p>
                        <p className="text-foreground font-semibold mt-0.5">
                          {new Date(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-muted-foreground font-medium">Requested On</p>
                        <p className="text-muted-foreground mt-0.5">
                          {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>

                    {/* Status message row */}
                    {booking.status === 'pending' && (
                      <div className="flex flex-col gap-3">
                        <p className="text-[11px] text-blue-400/90 font-medium">
                          New request — accept or decline.
                        </p>
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => handleBookingAction(booking.id, 'declined')}
                            disabled={updatingBookingId !== null}
                            className="px-4 py-2 border border-border rounded-lg text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'accepted')}
                            disabled={updatingBookingId !== null}
                            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[11px] font-semibold uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                          >
                            {updatingBookingId === booking.id ? 'Processing...' : 'Accept Booking'}
                          </button>
                        </div>
                      </div>
                    )}

                    {booking.status === 'accepted' && (
                      <p className="text-[11px] text-amber-400/90 font-medium">
                        Accepted. Waiting for traveler payment.
                      </p>
                    )}

                    {booking.status === 'paid' && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px] text-green-400 font-medium">
                          Paid. Chat unlocked — coordinate the trip.
                        </p>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'completed')}
                          disabled={updatingBookingId !== null}
                          className="self-end px-4 py-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                          {updatingBookingId === booking.id ? 'Updating…' : 'Mark Tour Complete'}
                        </button>
                      </div>
                    )}

                    {booking.status === 'completed' && (
                      <p className="text-[11px] text-emerald-400/80 font-medium">
                        Completed. Awaiting payout / review.
                      </p>
                    )}

                    {booking.status === 'declined' && (
                      <p className="text-[11px] text-muted-foreground italic">
                        You declined this request.
                      </p>
                    )}

                    {booking.status === 'cancelled' && (
                      <p className="text-[11px] text-muted-foreground italic">
                        Cancelled.
                      </p>
                    )}

                    {booking.status === 'expired' && (
                      <p className="text-[11px] text-orange-400/80 italic">
                        Expired request.
                      </p>
                    )}

                    {/* Chat — unlocked when paid or completed */}
                    <BookingChat
                      bookingId={booking.id}
                      currentUserId={userId}
                      isLocked={!['paid', 'completed'].includes(booking.status)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground tracking-tight mb-2">
                Guide Profile Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Set up your rates, contact numbers, and travel coverage details for public listing.
              </p>
            </div>

            {profileMsg && (
              <div className={`p-4 rounded-xl border text-sm ${
                profileMsg.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {profileMsg.text}
              </div>
            )}

            {/* Daily Rate */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Daily Rate (MAD): <span className="text-primary font-bold">{dailyRate} MAD</span>
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>100 MAD</span>
                <span>1,000 MAD</span>
                <span>2,000 MAD</span>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <label htmlFor="guide-bio" className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Biography / Professional Experience
              </label>
              <textarea
                id="guide-bio"
                placeholder="Tell travelers about your guiding style, history expertise, desert trekking skills..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full min-h-[120px] px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 resize-none"
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map(lang => {
                  const selected = languages.includes(lang)
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selected 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-background hover:bg-card border-border text-muted-foreground'
                      }`}
                    >
                      {lang}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Regions */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                Guiding Regions Covered
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_REGIONS.map(reg => {
                  const selected = regions.includes(reg)
                  return (
                    <button
                      type="button"
                      key={reg}
                      onClick={() => toggleRegion(reg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selected 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-background hover:bg-card border-border text-muted-foreground'
                      }`}
                    >
                      {reg}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 text-right">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {profileSaving ? 'Saving Updates...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground tracking-tight mb-2">
                Availability Calendar
              </h2>
              <p className="text-xs text-muted-foreground">
                Click any available day to mark it as a day off. Click a grey day to unblock it.
                Booked dates (accepted / paid) cannot be changed here.
              </p>
            </div>

            {availabilityError && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                {availabilityError}
              </div>
            )}

            {/* Calendar */}
            <div className="bg-card/30 border border-border rounded-2xl p-5">
              <AvailabilityCalendar
                mode="guide"
                blockedDays={blockedDayList}
                activeRanges={activeRanges}
                blockedDayIds={blockedDayIds}
                processingDay={processingDay}
                onBlockDay={handleBlockDay}
                onUnblockDay={handleUnblockDay}
              />
            </div>

            {/* Optional: block a date with a reason */}
            <details className="group">
              <summary className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-2">
                <span className="group-open:rotate-90 transition-transform duration-150 inline-block">▶</span>
                Block a specific date with a note
              </summary>
              <form onSubmit={handleAddBlockedDate} className="mt-4 bg-card/40 border border-border p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Note (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Holiday, External booking"
                    value={newReason}
                    onChange={e => setNewReason(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={availabilitySaving}
                  className="h-10 w-full bg-primary text-primary-foreground font-semibold text-[11px] uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {availabilitySaving ? 'Saving…' : 'Block Day'}
                </button>
              </form>
            </details>

            {/* Blocked dates list */}
            {blockedDates.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Blocked Days ({blockedDates.length})
                </h3>
                <div className="border border-border rounded-xl divide-y divide-border/50 overflow-hidden max-h-[260px] overflow-y-auto bg-card/40">
                  {blockedDates.map(d => (
                    <div key={d.id} className="flex justify-between items-center px-4 py-2.5 hover:bg-card/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-foreground text-xs font-mono font-semibold">
                          {new Date(d.blocked_date + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {d.reason && <span className="text-[11px] text-muted-foreground">— {d.reason}</span>}
                      </div>
                      <button
                        onClick={() => handleRemoveBlockedDate(d.id)}
                        className="text-[10px] uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
