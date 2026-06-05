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
  guide_whatsapp: string | null
}

interface GuidePayoutsTabProps {
  initialBookings: GuideBookingWithDetails[]
}

export default function GuidePayoutsTab({ initialBookings }: GuidePayoutsTabProps) {
  const [bookings, setBookings] = useState<GuideBookingWithDetails[]>(initialBookings)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTogglePayout = async (bookingId: string, currentStatus: string) => {
    setUpdatingId(bookingId)
    setError(null)

    const nextStatus = currentStatus === 'paid' ? 'completed' : 'paid'

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/payout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (res.ok) {
        const updated = await res.json()
        setBookings(prev =>
          prev.map(b => (b.id === bookingId ? { ...b, status: updated.status } : b))
        )
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update payout status.')
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
          Track escrow deposits from travelers and mark guide payouts completed after bank transfer verification.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No bookings in escrow queue.</p>
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
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Platform Fee (10%)</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Guide Net Earnings</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total Escrow</th>
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
                        {booking.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-foreground text-[12.5px] font-medium">
                        {booking.traveler_name}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground text-[12.5px] font-medium">{booking.guide_name}</p>
                        {booking.guide_whatsapp && (
                          <p className="text-[10px] text-muted-foreground">WA: {booking.guide_whatsapp}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11.5px] whitespace-nowrap">
                        {new Date(booking.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
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
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                          booking.status === 'completed'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {booking.status === 'completed' ? 'Payout Resolved' : 'Held In Escrow'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {booking.status === 'paid' ? (
                          <button
                            onClick={() => handleTogglePayout(booking.id, booking.status)}
                            disabled={updatingId === booking.id}
                            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm shadow-primary/10 disabled:opacity-50"
                          >
                            {updatingId === booking.id ? 'Processing...' : 'Mark Paid Out'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTogglePayout(booking.id, booking.status)}
                            disabled={updatingId === booking.id}
                            className="px-3 py-1.5 border border-border rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:border-amber-500/30 hover:text-amber-400 transition-colors disabled:opacity-50"
                          >
                            {updatingId === booking.id ? 'Reverting...' : 'Revert to Escrow'}
                          </button>
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
