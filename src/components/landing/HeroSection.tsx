'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-end overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        className="absolute -inset-[5%] bg-cover bg-center bg-no-repeat z-0 will-change-transform"
        style={{ 
          backgroundImage: 'url("/Images/sunset backfground.png")',
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      >
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="absolute inset-0 bg-background/10 dark:bg-background/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-32 pt-32">
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-cormorant)] text-6xl md:text-7xl lg:text-8xl font-medium text-foreground mb-6 leading-[1.05] tracking-tighter">
            <span className="block animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
              Unveil the Soul
            </span>
            <span className="block animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both italic text-foreground/80 pr-4">
              of Morocco
            </span>
          </h1>
          <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-muted-foreground mb-10 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both leading-relaxed">
            Curated itineraries for the modern explorer.
          </p>
          
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 fill-mode-both">
            <Link 
              href="/explore"
              className="inline-flex items-center justify-center px-10 py-4 bg-primary text-primary-foreground font-semibold tracking-[0.2em] uppercase text-xs transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 relative overflow-hidden group"
            >
              <span className="relative z-10">Explore Itineraries</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
        <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-foreground/50">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-foreground/50 to-transparent animate-pulse overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-foreground animate-[slide-down_2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />
    </section>
  )
}
