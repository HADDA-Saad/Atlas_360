'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react'

interface Guide {
  id: string
  full_name: string
  daily_rate_mad: number
}

interface BookingModalProps {
  guide: Guide
  onClose: () => void
  itineraryId?: string
}

export default function BookingModal({ guide, onClose, itineraryId }: BookingModalProps) {
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Calendar display state
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Fetch unavailable dates on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch(`/api/guides/${guide.id}/availability`)
        if (res.ok) {
          const data = await res.json()
          setUnavailableDates(data)
        }
      } catch (err) {
        console.error('Failed to load availability:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAvailability()
  }, [guide.id])

  // Helper: Format date as YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Calendar calculations
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Handle day click for range selection
  const handleDayClick = (dayNum: number) => {
    const clickedDate = new Date(currentYear, currentMonth, dayNum)
    const clickedDateStr = formatDateString(clickedDate)

    // Check if clicked date is in the past or unavailable
    if (clickedDate < new Date(new Date().setHours(0, 0, 0, 0)) || unavailableDates.includes(clickedDateStr)) {
      return
    }

    if (!startDate || (startDate && endDate) || clickedDate < startDate) {
      setStartDate(clickedDate)
      setEndDate(null)
    } else {
      // Check if there are any unavailable dates in the selected range
      let hasConflict = false
      const checkDate = new Date(startDate)
      while (checkDate <= clickedDate) {
        if (unavailableDates.includes(formatDateString(checkDate))) {
          hasConflict = true
          break
        }
        checkDate.setDate(checkDate.getDate() + 1)
      }

      if (hasConflict) {
        // If conflict exists, reset selection to start at the clicked date
        setStartDate(clickedDate)
        setEndDate(null)
        setMessage({ type: 'error', text: 'Selected range contains days where the guide is unavailable.' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setEndDate(clickedDate)
        setMessage(null)
      }
    }
  }

  // Booking calculations
  const totalDays = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
    : 0

  const totalPrice = totalDays * guide.daily_rate_mad
  const deposit = Math.round(totalPrice * 0.15) // 15% booking reservation commission

  // Submit request
  const handleSubmitBooking = async () => {
    if (!startDate || !endDate) return
    setSubmitting(true)
    setMessage(null)

    const payload = {
      guide_id: guide.id,
      start_date: formatDateString(startDate),
      end_date: formatDateString(endDate),
      itinerary_id: itineraryId || null
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to submit booking')
      }

      setMessage({ type: 'success', text: 'Booking request sent successfully! The guide will review your request.' })
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Calendar rendering helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const calendarDays = []
  // Empty slots for days of previous month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10" />)
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(currentYear, currentMonth, d)
    const dayDateStr = formatDateString(dayDate)
    const isPast = dayDate < new Date(new Date().setHours(0, 0, 0, 0))
    const isUnavailable = unavailableDates.includes(dayDateStr)
    const isDisabled = isPast || isUnavailable

    let isSelected = false
    let isBetween = false

    if (startDate) {
      if (formatDateString(startDate) === dayDateStr) {
        isSelected = true
      } else if (endDate) {
        if (formatDateString(endDate) === dayDateStr) {
          isSelected = true
        } else if (dayDate > startDate && dayDate < endDate) {
          isBetween = true
        }
      }
    }

    calendarDays.push(
      <button
        key={`day-${d}`}
        type="button"
        disabled={isDisabled}
        onClick={() => handleDayClick(d)}
        className={`h-10 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative ${
          isDisabled
            ? 'text-muted-foreground/30 line-through cursor-not-allowed bg-muted/10'
            : isSelected
            ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20'
            : isBetween
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-foreground hover:bg-muted border border-transparent hover:border-border'
        }`}
      >
        {d}
        {isUnavailable && !isPast && (
          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-400" />
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Dialog container */}
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Book Local Guide
          </p>
          <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground tracking-tight">
            Hire {guide.full_name}
          </h3>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Custom Interactive Calendar */}
            <div className="bg-background border border-border/60 rounded-xl p-4">
              {/* Month Selector header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {monthNames[currentMonth]} {currentYear}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-muted rounded-lg transition-colors border border-border/40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-muted rounded-lg transition-colors border border-border/40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays}
              </div>
            </div>

            {/* Dates Selection Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background border border-border/40 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Start Date</span>
                <span className="text-xs font-semibold text-foreground mt-1">
                  {startDate ? startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date...'}
                </span>
              </div>
              <div className="bg-background border border-border/40 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">End Date</span>
                <span className="text-xs font-semibold text-foreground mt-1">
                  {endDate ? endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date...'}
                </span>
              </div>
            </div>

            {/* Price Estimator Summary */}
            {startDate && endDate && (
              <div className="bg-[#D4622E]/5 border border-[#D4622E]/20 p-4 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">Total Duration:</span>
                  <span className="text-foreground font-bold">{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">Daily Rate:</span>
                  <span className="text-foreground font-bold">{guide.daily_rate_mad} MAD/day</span>
                </div>
                <div className="border-t border-border/40 my-2 pt-2 flex justify-between items-center text-sm">
                  <span className="text-foreground font-bold">Total Estimated Cost:</span>
                  <span className="text-lg font-bold text-[#D4622E]">{totalPrice.toLocaleString()} MAD</span>
                </div>
                <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground leading-normal mt-2 bg-background/50 p-2 rounded-lg border border-border/40">
                  <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <p>
                    A reservation deposit of <span className="font-bold text-[#D4622E]">{deposit} MAD</span> (15%) is required upon booking approval.
                  </p>
                </div>
              </div>
            )}

            {/* Error/Success alerts */}
            {message && (
              <div className={`p-3 rounded-lg text-xs font-semibold tracking-wide border ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {message.text}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background hover:bg-muted transition-colors text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={!startDate || !endDate || submitting}
                className="flex-1 py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-primary-foreground disabled:opacity-50 transition-colors rounded-lg text-center shadow-md cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Request Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
