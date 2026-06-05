'use client'

import { useState } from 'react'

interface GuideProfile {
  id: string
  bio: string | null
  languages: string[]
  regions: string[]
  daily_rate_mad: number
  whatsapp_number: string | null
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
}

const AVAILABLE_LANGUAGES = ['Arabic', 'French', 'English', 'Berber', 'Spanish', 'German', 'Italian']
const AVAILABLE_REGIONS = ['Marrakech-Safi', 'High Atlas', 'Sahara-Merzouga', 'Chefchaouen-Rif', 'Rabat-Salé', 'Essaouira-Coast', 'Fes-Meknes']

export default function GuideDashboardClient({
  guide,
  initialBookings,
  initialBlockedDates,
}: GuideDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'availability'>('bookings')

  // Booking states
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)

  // Profile states
  const [bio, setBio] = useState(guide.bio || '')
  const [dailyRate, setDailyRate] = useState(guide.daily_rate_mad)
  const [whatsapp, setWhatsapp] = useState(guide.whatsapp_number || '')
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

  // Handlers
  const handleBookingAction = async (bookingId: string, action: 'accepted' | 'declined') => {
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
          whatsapp_number: whatsapp,
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
      const res = await fetch(`/api/guides/availability?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setBlockedDates(prev => prev.filter(d => d.id !== id))
      } else {
        console.error('Failed to unblock date')
      }
    } catch (err) {
      console.error('Error removing blockout', err)
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
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      case 'accepted':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'paid':
        return 'bg-green-500/10 text-green-400 border border-green-500/20'
      case 'declined':
        return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-400 border border-green-500/20'
      default:
        return 'bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20'
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
                <p className="text-muted-foreground text-sm">No reservations requested yet.</p>
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

                    {booking.status === 'pending' && (
                      <div className="flex gap-3 justify-end mt-2">
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
                    )}

                    {booking.status === 'accepted' && (
                      <p className="text-[11px] text-amber-500/80 italic text-right mt-1">
                        Waiting for traveler payout. These dates have been automatically blocked.
                      </p>
                    )}

                    {booking.status === 'paid' && (
                      <p className="text-[11px] text-green-400 font-semibold text-right mt-1 flex items-center gap-1.5 justify-end">
                        ✓ Booking Paid. Funds held in platform escrow, ready for release post-trip.
                      </p>
                    )}
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

            {/* WhatsApp Number */}
            <div className="space-y-2">
              <label htmlFor="guide-whatsapp" className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                WhatsApp Number (including country code)
              </label>
              <input
                id="guide-whatsapp"
                type="text"
                placeholder="+212600000000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
              />
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
                Availability Blockouts
              </h2>
              <p className="text-xs text-muted-foreground">
                Manually block specific full days from traveler scheduling (e.g. personal holidays, external bookings).
              </p>
            </div>

            {availabilityError && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                {availabilityError}
              </div>
            )}

            {/* Add Date Blockout Form */}
            <form onSubmit={handleAddBlockedDate} className="bg-card/40 border border-border p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Select Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Holiday, Riad tour"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/30"
                />
              </div>

              <button
                type="submit"
                disabled={availabilitySaving}
                className="h-10 w-full bg-primary text-primary-foreground font-semibold text-[11px] uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
              >
                {availabilitySaving ? 'Blocking...' : 'Block Day'}
              </button>
            </form>

            {/* List of Blockouts */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Blocked Calendar Dates</h3>
              {blockedDates.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No manual blockout dates logged.</p>
              ) : (
                <div className="border border-border rounded-xl divide-y divide-border/60 overflow-hidden max-h-[300px] overflow-y-auto bg-card/50">
                  {blockedDates.map(d => (
                    <div key={d.id} className="flex justify-between items-center px-4 py-3 text-sm hover:bg-card/70 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-foreground text-xs font-mono">
                          {new Date(d.blocked_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {d.reason && (
                          <span className="text-[11px] text-muted-foreground">({d.reason})</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveBlockedDate(d.id)}
                        className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
