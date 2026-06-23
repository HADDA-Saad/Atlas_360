'use client'

import { useState } from 'react'

export interface GuideBookingWithDetails {
  id: string
  traveler_id: string
  guide_id: string
  start_date: string
  end_date: string
  total_price: number
  commission_amount: number
  status: string
  created_at: string
  traveler_name: string
  guide_name: string
}

interface GuidePayoutsTabProps {
  initialBookings: GuideBookingWithDetails[]
}

const STATUS_LABELS: Record<string, string> = {
  accepted:  'Awaiting Payment',
  paid:      'Held In Escrow',
  completed: 'Payout Released',
}

const STATUS_BADGE: Record<string, string> = {
  accepted:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  paid:      'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
}

export default function GuidePayoutsTab({ initialBookings }: GuidePayoutsTabProps) {
  const [bookings, setBookings] = useState<GuideBookingWithDetails[]>(initialBookings)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (bookingId: string, nextStatus: 'paid' | 'completed') => {
    setUpdatingId(bookingId)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/payout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: updated.status } : b))
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update status.')
      }
    } catch {
      setError('Network error occurred.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-[28px] font-semibold text-foreground tracking-tight">
          Guide Payouts & Escrow Queue
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Confirm payments, track escrow deposits, and release guide payouts after tour completion.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No bookings in the queue yet.</p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Booking ID</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Traveler</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Guide</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Dates</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Commission (10%)</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Guide Net</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => {
                  const netEarnings = booking.total_price - booking.commission_amount
                  return (
                    <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-card/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-[11px] font-mono">
                        {booking.id.substring(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-foreground text-[12.5px] font-medium">
                        {booking.traveler_name}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground text-[12.5px] font-medium">{booking.guide_name}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11.5px] whitespace-nowrap">
                        {new Date(booking.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px] font-mono">
                        {booking.commission_amount} MAD
                      </td>
                      <td className="px-4 py-3 text-green-400 text-[12.5px] font-semibold font-mono">
                        {netEarnings} MAD
                      </td>
                      <td className="px-4 py-3 text-foreground text-[12.5px] font-mono">
                        {booking.total_price} MAD
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${STATUS_BADGE[booking.status] ?? ''}`}>
                          {STATUS_LABELS[booking.status] ?? booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {booking.status === 'accepted' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'paid')}
                            disabled={updatingId === booking.id}
                            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm shadow-primary/10 disabled:opacity-50"
                          >
                            {updatingId === booking.id ? 'Processing…' : 'Mark as Paid'}
                          </button>
                        )}
                        {booking.status === 'paid' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'completed')}
                            disabled={updatingId === booking.id}
                            className="px-3 py-1.5 bg-green-600/80 text-white hover:bg-green-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                          >
                            {updatingId === booking.id ? 'Processing…' : 'Release Payout'}
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <span className="text-[10px] text-green-400 font-semibold">✓ Paid Out</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
