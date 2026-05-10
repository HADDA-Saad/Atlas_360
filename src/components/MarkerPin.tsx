'use client'

interface MarkerPinProps {
  isSelected: boolean
  label: string
  index: number
}

export default function MarkerPin({ isSelected, label, index }: MarkerPinProps) {
  return (
    <div className="relative group cursor-pointer" title={label}>
      {/* Pin body */}
      <div
        className={`
          flex items-center justify-center
          rounded-full border-2 border-white shadow-lg
          transition-all duration-300 ease-in-out
          ${isSelected
            ? 'w-10 h-10 bg-primary scale-110 shadow-xl'
            : 'w-7 h-7 bg-slate-500 hover:bg-slate-400 hover:scale-105'
          }
        `}
      >
        <span
          className={`
            font-bold text-foreground
            ${isSelected ? 'text-sm' : 'text-xs'}
          `}
        >
          {index}
        </span>
      </div>

      {/* Pin tail */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2
          w-0 h-0
          border-l-[6px] border-l-transparent
          border-r-[6px] border-r-transparent
          transition-all duration-300 ease-in-out
          ${isSelected
            ? 'border-t-[8px] border-t-[#C1440E]'
            : 'border-t-[6px] border-t-slate-500'
          }
        `}
      />

      {/* Tooltip label on hover (only for non-selected markers) */}
      {!isSelected && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-2 py-1 rounded bg-gray-900 text-foreground text-xs whitespace-nowrap
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none
        ">
          {label}
        </div>
      )}

      {/* Label for selected marker */}
      {isSelected && (
        <div className="
          absolute top-full left-1/2 -translate-x-1/2 mt-2
          px-3 py-1.5 rounded-md bg-primary text-foreground text-xs font-medium
          whitespace-nowrap shadow-lg
        ">
          {label}
        </div>
      )}
    </div>
  )
}
