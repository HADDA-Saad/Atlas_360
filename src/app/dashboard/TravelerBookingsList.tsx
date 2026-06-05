'use client'

import { useState } from 'react'

interface Booking {
  id: string
  guide_id: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  created_at: string
  guide_name: string
  guides?: {
    whatsapp_number: string | null
  } | null
}

interface TravelerBookingsListProps {
  bookings: Booking[]
}

export default function TravelerBookingsList({ bookings }: TravelerBookingsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async (bookingId: string) => {
    setLoadingId(bookingId)
    setError(null)

    try {
      const res = await fetch(`/api/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned from Stripe session.')
      }
    } catch (err) {
      console.error('Payment redirect error:', err)
      setError(err instanceof Error ? err.message : 'Failed to redirect to checkout.')
    } finally {
      setLoadingId(null)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      case 'accepted':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'paid':
        return 'bg-green-500/10 text-green-400 border border-green-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-400 border border-green-500/20'
      case 'declined':
        return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border border-red-500/20'
      default:
        return 'bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20'
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
        <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card/20">
          <p className="text-muted-foreground text-sm">No guide bookings requested yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Browse our verified guides to request assistance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="bg-card/45 hover:bg-card/60 border border-border hover:border-primary/20 rounded-2xl p-5 transition-colors flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(booking.status)}`}>
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

              <div className="flex justify-between items-center gap-3 mt-2">
                <span className="text-[10px] text-muted-foreground font-mono">
                  ID: {booking.id.substring(0, 8)}...
                </span>

                {booking.status === 'accepted' && (
                  <button
                    onClick={() => handlePay(booking.id)}
                    disabled={loadingId === booking.id}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm shadow-primary/10 disabled:opacity-50"
                  >
                    {loadingId === booking.id ? 'Processing...' : 'Pay & Secure Guide 💳'}
                  </button>
                )}

                {(booking.status === 'paid' || booking.status === 'completed') && booking.guides?.whatsapp_number && (
                  <a
                    href={`https://wa.me/${booking.guides.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                  >
                    Chat on WhatsApp 💬
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
