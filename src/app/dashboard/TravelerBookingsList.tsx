'use client'

import { useState } from 'react'
import BookingChat from '@/components/BookingChat'
import GuideReviewInline from '@/components/reviews/GuideReviewInline'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'

interface Booking {
  id: string
  guide_id: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  created_at: string
  guide_name: string
}

interface TravelerBookingsListProps {
  bookings: Booking[]
  userId: string
}

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  accepted:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  paid:      'bg-green-500/10 text-green-400 border border-green-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  declined:  'bg-red-500/10 text-red-400 border border-red-500/20',
  cancelled: 'bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20',
  expired:   'bg-orange-500/10 text-orange-400 border border-orange-500/20',
}

const TRAVELER_MESSAGE: Record<string, string> = {
  pending:   'Waiting for the guide to accept your request.',
  accepted:  'Accepted! Complete payment to confirm your booking.',
  paid:      'Confirmed. You can now chat with your guide.',
  completed: 'Trip completed. Leave a review!',
  declined:  'The guide declined this request.',
  cancelled: 'This booking was cancelled.',
  expired:   'Request expired — the guide didn\'t respond. You can rebook.',
}

function refundLabel(startDate: string): string {
  const msPerDay  = 1000 * 60 * 60 * 24
  const daysUntil = Math.ceil((new Date(startDate).getTime() - Date.now()) / msPerDay)
  if (daysUntil >= 7) return 'You are eligible for a full refund.'
  if (daysUntil >= 2) return 'You are eligible for a 50% refund (tour is within 7 days).'
  return 'No refund applies — the tour is within 2 days.'
}

function days(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1)
}

export default function TravelerBookingsList({ bookings: initial, userId }: TravelerBookingsListProps) {
  const [bookings, setBookings]               = useState<Booking[]>(initial)
  const [loadingId, setLoadingId]             = useState<string | null>(null)
  const [error, setError]                     = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  // Reschedule state
  const [rescheduleId, setRescheduleId]   = useState<string | null>(null)
  const [newStart, setNewStart]           = useState('')
  const [newEnd, setNewEnd]               = useState('')
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [avail, setAvail]                 = useState<{ blockedDays: string[]; activeRanges: { start: string; end: string }[] }>({ blockedDays: [], activeRanges: [] })
  const [loadingAvail, setLoadingAvail]   = useState(false)

  const openReschedule = async (booking: Booking) => {
    setRescheduleId(booking.id)
    setNewStart(booking.start_date)
    setNewEnd(booking.end_date)
    setRescheduleError(null)
    setLoadingAvail(true)
    try {
      const res  = await fetch(`/api/guides/${booking.guide_id}/availability`)
      const data = await res.json()
      setAvail({ blockedDays: data.blockedDays ?? [], activeRanges: data.activeRanges ?? [] })
    } catch {
      setAvail({ blockedDays: [], activeRanges: [] })
    } finally {
      setLoadingAvail(false)
    }
  }

  const handleReschedule = async (bookingId: string) => {
    if (!newStart || !newEnd) { setRescheduleError('Please select both a start and end date.'); return }
    setLoadingId(bookingId)
    setRescheduleError(null)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: newStart, end_date: newEnd }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reschedule failed')
      setBookings(prev => prev.map(b =>
        b.id === bookingId
          ? { ...b, start_date: data.start_date, end_date: data.end_date, total_price: data.total_price, status: data.status }
          : b
      ))
      setRescheduleId(null)
    } catch (err) {
      setRescheduleError(err instanceof Error ? err.message : 'Failed to reschedule.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleCancel = async (bookingId: string) => {
    setLoadingId(bookingId)
    setError(null)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Cancellation failed')
      }
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      setConfirmCancelId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking.')
    } finally {
      setLoadingId(null)
    }
  }

  const handlePay = async (bookingId: string) => {
    setLoadingId(bookingId)
    setError(null)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pay`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Payment failed')
      }
      const updated = await res.json()
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: updated.status } : b))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm payment.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-t border-border pt-8">
        <h2 className="font-[family-name:var(--font-cormorant)] text-[28px] font-semibold text-foreground tracking-tight">
          My Guide Bookings
        </h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/20">
          <p className="text-muted-foreground text-sm font-medium">No guide bookings yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1.5">
            Browse our verified guides and send a booking request to get started.
          </p>
          <a
            href="/guides"
            className="inline-flex mt-4 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors border border-primary/20"
          >
            Browse Guides →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {bookings.map(booking => {
            const chatLocked      = !['paid', 'completed'].includes(booking.status)
            const canReschedule   = ['pending', 'accepted'].includes(booking.status)
            const canCancel       = ['pending', 'accepted', 'paid'].includes(booking.status)
            const isRescheduling  = rescheduleId === booking.id
            const isConfirmCancel = confirmCancelId === booking.id

            return (
              <div
                key={booking.id}
                className="bg-card/45 hover:bg-card/60 border border-border hover:border-primary/20 rounded-2xl p-5 transition-colors flex flex-col gap-4"
              >
                {/* Header */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_BADGE[booking.status] ?? 'bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20'}`}>
                        {booking.status}
                      </span>
                      <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mt-2">
                        Guide: {booking.guide_name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Price</span>
                      <p className="font-semibold text-foreground text-sm font-mono mt-0.5">{booking.total_price} MAD</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-3 mt-4 text-xs">
                    <div>
                      <span className="text-muted-foreground font-medium">Start Date</span>
                      <p className="text-foreground font-semibold mt-0.5">
                        {new Date(booking.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">End Date</span>
                      <p className="text-foreground font-semibold mt-0.5">
                        {new Date(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status message */}
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  {TRAVELER_MESSAGE[booking.status] ?? ''}
                </p>

                {/* Action area */}
                <div className="flex flex-col gap-3">

                  {/* Pay button */}
                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => handlePay(booking.id)}
                      disabled={loadingId === booking.id}
                      className="self-end px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm shadow-primary/10 disabled:opacity-50"
                    >
                      {loadingId === booking.id ? 'Confirming…' : 'Confirm & Pay →'}
                    </button>
                  )}

                  {/* Review form */}
                  {booking.status === 'completed' && (
                    <GuideReviewInline
                      guideId={booking.guide_id}
                      guideName={booking.guide_name}
                    />
                  )}

                  {/* Reschedule panel */}
                  {canReschedule && (
                    isRescheduling ? (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-semibold text-foreground">Select new dates</p>
                          <button
                            onClick={() => { setRescheduleId(null); setRescheduleError(null) }}
                            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                          >
                            ✕
                          </button>
                        </div>

                        {loadingAvail ? (
                          <p className="text-[11px] text-muted-foreground italic">Loading availability…</p>
                        ) : (
                          <AvailabilityCalendar
                            mode="traveler"
                            blockedDays={avail.blockedDays}
                            activeRanges={avail.activeRanges}
                            startDate={newStart}
                            endDate={newEnd}
                            onStartChange={setNewStart}
                            onEndChange={setNewEnd}
                          />
                        )}

                        {newStart && newEnd && (
                          <p className="text-[11px] text-muted-foreground">
                            {days(newStart, newEnd)} day{days(newStart, newEnd) === 1 ? '' : 's'} selected
                          </p>
                        )}

                        {rescheduleError && (
                          <p className="text-[11px] text-red-400">{rescheduleError}</p>
                        )}

                        {booking.status === 'accepted' && (
                          <p className="text-[10px] text-amber-400/80 italic">
                            Rescheduling will reset this booking to pending — the guide must re-confirm.
                          </p>
                        )}

                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setRescheduleId(null); setRescheduleError(null) }}
                            className="px-4 py-1.5 rounded-lg border border-border text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReschedule(booking.id)}
                            disabled={!newStart || !newEnd || loadingId === booking.id}
                            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                          >
                            {loadingId === booking.id ? 'Saving…' : 'Confirm new dates'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => openReschedule(booking)}
                        className="self-start px-4 py-2 rounded-lg border border-border text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
                      >
                        Change dates
                      </button>
                    )
                  )}

                  {/* Rebook shortcut for expired */}
                  {booking.status === 'expired' && (
                    <a
                      href="/guides"
                      className="self-start px-4 py-2 rounded-lg border border-primary/30 text-primary/80 hover:border-primary hover:text-primary hover:bg-primary/5 text-[10px] font-semibold uppercase tracking-widest transition-all"
                    >
                      Browse guides to rebook →
                    </a>
                  )}

                  {/* Cancel */}
                  {canCancel && (
                    isConfirmCancel ? (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex flex-col gap-3">
                        <p className="text-[12px] text-foreground font-semibold">Cancel this booking?</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {refundLabel(booking.start_date)}
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="px-4 py-1.5 rounded-lg border border-border text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Never mind
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={loadingId === booking.id}
                            className="px-4 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                          >
                            {loadingId === booking.id ? 'Cancelling…' : 'Confirm Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancelId(booking.id)}
                        className="self-start px-4 py-2 rounded-lg border border-red-500/25 text-red-400/80 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 text-[10px] font-semibold uppercase tracking-widest transition-all"
                      >
                        Cancel booking
                      </button>
                    )
                  )}

                  {/* Chat */}
                  <BookingChat
                    bookingId={booking.id}
                    currentUserId={userId}
                    isLocked={chatLocked}
                  />

                  <span className="text-[10px] text-muted-foreground font-mono self-start">
                    ID: {booking.id.substring(0, 8)}…
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
