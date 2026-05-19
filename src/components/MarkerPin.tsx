'use client'

interface MarkerPinProps {
  isSelected: boolean
  label: string
  index: number
}

export default function MarkerPin({ isSelected, label, index }: MarkerPinProps) {
  return (
    <div className="relative group cursor-pointer flex flex-col items-center" title={label}>
      {/* Premium Teardrop Marker */}
      <div
        className={`
          flex items-center justify-center
          rounded-t-full rounded-bl-full rounded-br-sm rotate-45
          border-2 transition-all duration-300 ease-out font-semibold
          ${isSelected
            ? 'w-10 h-10 bg-primary border-background text-primary-foreground shadow-[0_4px_16px_rgba(193,68,14,0.4)] scale-110 z-20'
            : 'w-8 h-8 bg-[#F3EDE2] dark:bg-[#1E1912] border-primary/45 dark:border-primary/60 text-[#C1440E] dark:text-[#E8D5B7] hover:bg-primary hover:border-background hover:text-primary-foreground hover:scale-115 shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_12px_rgba(193,68,14,0.25)] z-10'
          }
        `}
      >
        <span
          className={`
            -rotate-45 
            ${isSelected ? 'text-[13px] font-bold' : 'text-[11px] font-semibold'}
          `}
        >
          {index}
        </span>
      </div>

      {/* Pulse effect for selected marker */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping z-0 pointer-events-none" style={{ animationDuration: '2.5s' }} />
      )}

      {/* Tooltip label on hover (only for non-selected markers) */}
      {!isSelected && (
        <div className="
          absolute bottom-[130%] left-1/2 -translate-x-1/2 mb-2
          px-3 py-1.5 rounded-lg bg-popover/95 backdrop-blur-md border border-border text-popover-foreground text-[11px] font-semibold whitespace-nowrap shadow-xl
          opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0
          pointer-events-none z-50
        ">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">
              {index}
            </span>
            {label}
          </div>
        </div>
      )}

      {/* Label for selected marker */}
      {isSelected && (
        <div className="
          absolute top-[125%] left-1/2 -translate-x-1/2 mt-2
          px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase
          whitespace-nowrap shadow-xl shadow-primary/20 z-50
          animate-in slide-in-from-top-2 fade-in duration-300
        ">
          {label}
        </div>
      )}
    </div>
  )
}
