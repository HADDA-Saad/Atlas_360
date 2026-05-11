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
          border transition-all duration-300 ease-out font-bold
          shadow-lg
          ${isSelected
            ? 'w-10 h-10 bg-primary border-primary text-primary-foreground shadow-primary/30 scale-110 z-20'
            : 'w-8 h-8 bg-card border-border text-muted-foreground hover:bg-primary/5 hover:border-primary/50 hover:text-primary hover:scale-110 hover:shadow-xl z-10'
          }
        `}
      >
        <span
          className={`
            -rotate-45 
            ${isSelected ? 'text-[13px]' : 'text-[11px]'}
          `}
        >
          {index}
        </span>
      </div>

      {/* Pulse effect for selected marker */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping z-0 pointer-events-none" style={{ animationDuration: '3s' }} />
      )}

      {/* Tooltip label on hover (only for non-selected markers) */}
      {!isSelected && (
        <div className="
          absolute bottom-[120%] left-1/2 -translate-x-1/2 mb-2
          px-3 py-1.5 rounded-lg bg-popover/90 backdrop-blur-sm border border-border text-popover-foreground text-[11px] font-semibold whitespace-nowrap shadow-xl
          opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0
          pointer-events-none z-50
        ">
          {label}
        </div>
      )}

      {/* Label for selected marker */}
      {isSelected && (
        <div className="
          absolute top-[120%] left-1/2 -translate-x-1/2 mt-2
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
