'use client'

import { useEffect, useRef, useCallback } from 'react'

interface SlideOverPanelProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  /** Title shown in the top bar */
  title?: string
  /** Width class — defaults to 85% on desktop */
  widthClass?: string
}

export default function SlideOverPanel({
  isOpen,
  onClose,
  children,
  title,
  widthClass = 'w-full md:w-[85vw] lg:w-[80vw]',
}: SlideOverPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // ESC key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll while panel is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-[60]
          transition-all duration-500 ease-out
          ${isOpen
            ? 'opacity-100 pointer-events-auto backdrop-blur-sm bg-black/40'
            : 'opacity-0 pointer-events-none'
          }
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          fixed top-0 right-0 bottom-0 z-[61]
          ${widthClass}
          bg-background border-l border-border
          shadow-2xl shadow-black/30
          flex flex-col
          transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 md:px-8 h-16 border-b border-border bg-background/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="
                w-9 h-9 rounded-full
                flex items-center justify-center
                border border-border
                text-muted-foreground hover:text-foreground hover:border-primary/30
                transition-all duration-200
                bg-card
              "
              aria-label="Close panel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            {title && (
              <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground tracking-wide">
                {title}
              </h2>
            )}
          </div>

          <button
            onClick={onClose}
            className="
              text-[10px] font-semibold uppercase tracking-widest
              text-muted-foreground hover:text-foreground
              transition-colors duration-200
              flex items-center gap-1.5
            "
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            Back to Map
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto atlas-scrollbar">
          {children}
        </div>
      </div>
    </>
  )
}
