'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WD  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MNS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function pad(n: number) { return String(n).padStart(2, '0') }
function ymd(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}` }
function today() {
  const n = new Date()
  return ymd(n.getFullYear(), n.getMonth(), n.getDate())
}
function inRanges(d: string, ranges: { start: string; end: string }[]) {
  return ranges.some(r => d >= r.start && d <= r.end)
}

type DaySt = 'past' | 'busy' | 'blocked' | 'today' | 'avail'

interface Props {
  mode: 'guide' | 'traveler'
  blockedDays?: string[]
  activeRanges?: { start: string; end: string }[]
  // guide mode
  onBlockDay?: (date: string) => void
  onUnblockDay?: (date: string, id: string) => void
  blockedDayIds?: Record<string, string>
  processingDay?: string | null
  // traveler mode
  startDate?: string
  endDate?: string
  onStartChange?: (date: string) => void
  onEndChange?: (date: string) => void
}

export default function AvailabilityCalendar({
  mode,
  blockedDays = [],
  activeRanges = [],
  onBlockDay,
  onUnblockDay,
  blockedDayIds = {},
  processingDay = null,
  startDate = '',
  endDate = '',
  onStartChange,
  onEndChange,
}: Props) {
  const todayStr = today()
  const now = new Date()

  const [yr, setYr] = useState(now.getFullYear())
  const [mo, setMo] = useState(now.getMonth())
  const [fading, setFading] = useState(false)
  const [pickingEnd, setPickingEnd] = useState(false)

  // Reset step when start is cleared (modal close / reset)
  useEffect(() => { if (!startDate) setPickingEnd(false) }, [startDate])

  function nav(dir: 1 | -1) {
    setFading(true)
    setTimeout(() => {
      const next = mo + dir
      if (next > 11) { setMo(0); setYr(y => y + 1) }
      else if (next < 0) { setMo(11); setYr(y => y - 1) }
      else setMo(next)
      setFading(false)
    }, 110)
  }

  const firstDow   = new Date(yr, mo, 1).getDay()
  const daysInMo   = new Date(yr, mo + 1, 0).getDate()

  function st(d: string): DaySt {
    if (d < todayStr) return 'past'
    if (inRanges(d, activeRanges)) return 'busy'
    if (blockedDays.includes(d)) return 'blocked'
    if (d === todayStr) return 'today'
    return 'avail'
  }

  type RangePos = 'sel-start' | 'sel-end' | 'in-range' | 'single' | null
  function rangePos(d: string): RangePos {
    if (mode !== 'traveler' || !startDate) return null
    const hasEnd = endDate && endDate !== ''
    if (!hasEnd) return d === startDate ? 'single' : null
    if (d === startDate && d === endDate) return 'single'
    if (d === startDate) return 'sel-start'
    if (d === endDate)   return 'sel-end'
    if (d > startDate && d < endDate) return 'in-range'
    return null
  }

  function handleClick(d: string, s: DaySt) {
    if (mode === 'guide') {
      if (s === 'past' || s === 'busy') return
      if (s === 'blocked') {
        const id = blockedDayIds[d]
        if (id) onUnblockDay?.(d, id)
        return
      }
      onBlockDay?.(d)
    } else {
      if (s === 'past' || s === 'busy' || s === 'blocked') return
      if (!pickingEnd || !startDate || d <= startDate) {
        onStartChange?.(d)
        onEndChange?.('')
        setPickingEnd(true)
      } else {
        onEndChange?.(d)
        setPickingEnd(false)
      }
    }
  }

  return (
    <div className="select-none w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => nav(-1)}
          aria-label="Previous month"
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground tracking-tight">
          {MNS[mo]} {yr}
        </span>

        <button
          type="button"
          onClick={() => nav(1)}
          aria-label="Next month"
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors duration-150"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WD.map(w => (
          <div key={w} className="h-7 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground/45">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className={`grid grid-cols-7 transition-opacity duration-[110ms] motion-reduce:transition-none ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Padding cells */}
        {Array.from({ length: firstDow }, (_, i) => <div key={`pad-${i}`} />)}

        {Array.from({ length: daysInMo }, (_, i) => {
          const day = i + 1
          const d   = ymd(yr, mo, day)
          const s   = st(d)
          const rp  = rangePos(d)
          const isSel      = rp === 'sel-start' || rp === 'sel-end' || rp === 'single'
          const isToday    = d === todayStr
          const isProc     = processingDay === d
          const canClick   = mode === 'guide'
            ? (s !== 'past' && s !== 'busy')
            : (s === 'avail' || s === 'today')

          // Range band background (full-width, short strip)
          const band =
            rp === 'in-range'  ? 'bg-primary/10' :
            rp === 'sel-start' ? 'bg-primary/10 rounded-l-full' :
            rp === 'sel-end'   ? 'bg-primary/10 rounded-r-full' :
            ''

          // Day circle
          let circle = 'relative w-9 h-9 flex items-center justify-center rounded-full text-[13px] transition-all duration-150 motion-reduce:transition-none focus:outline-none '
          if (isProc) {
            circle += 'opacity-30 cursor-wait'
          } else if (isSel) {
            circle += 'bg-primary text-white font-semibold shadow-sm shadow-primary/25'
          } else if (s === 'past') {
            circle += 'text-muted-foreground/20 cursor-not-allowed'
          } else if (s === 'busy') {
            circle += 'text-muted-foreground/25 cursor-not-allowed' + (isToday ? ' ring-1 ring-primary/30' : '')
          } else if (s === 'blocked') {
            circle += mode === 'guide'
              ? 'text-muted-foreground/45 cursor-pointer hover:bg-red-500/8 hover:text-red-400' + (isToday ? ' ring-1 ring-primary/30' : '')
              : 'text-muted-foreground/25 cursor-not-allowed' + (isToday ? ' ring-1 ring-primary/30' : '')
          } else if (isToday) {
            circle += 'text-primary ring-1 ring-primary/55 font-semibold cursor-pointer hover:bg-primary/10'
          } else {
            circle += 'text-foreground cursor-pointer hover:bg-card/80 hover:ring-1 hover:ring-primary/18'
          }

          return (
            <div key={day} className={`h-10 flex items-center justify-center ${band}`}>
              <button
                type="button"
                disabled={!canClick || isProc}
                title={
                  s === 'busy'    ? 'Booked' :
                  s === 'blocked' ? (mode === 'guide' ? 'Day off — click to unblock' : 'Unavailable') :
                  undefined
                }
                onClick={() => !isProc && handleClick(d, s)}
                className={circle}
              >
                {day}
                {/* State dot */}
                {(s === 'busy' || s === 'blocked') && !isSel && (
                  <span className={`absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full ${
                    s === 'busy' ? 'bg-muted-foreground/30' : 'bg-muted-foreground/20'
                  }`} />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-border/40 flex items-center flex-wrap gap-x-5 gap-y-2">
        {[
          { label: 'Available',  cls: 'bg-foreground/6 ring-1 ring-border/50' },
          { label: 'Booked',     cls: 'bg-muted-foreground/20' },
          { label: mode === 'guide' ? 'Day off' : 'Unavailable', cls: 'bg-muted-foreground/8 ring-1 ring-muted-foreground/15' },
          ...(mode === 'traveler' ? [{ label: 'Selected', cls: 'bg-primary' }] : []),
        ].map(({ label, cls }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cls}`} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
          </span>
        ))}
      </div>

      {/* Traveler hint */}
      {mode === 'traveler' && (
        <p className="text-[10px] text-muted-foreground/70 mt-2.5 italic">
          {!startDate
            ? 'Tap a day to set the start date.'
            : !endDate || endDate === ''
            ? 'Now tap a day to set the end date.'
            : `${new Date(startDate + 'T00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short' })} → ${new Date(endDate + 'T00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short' })}`}
        </p>
      )}
    </div>
  )
}
