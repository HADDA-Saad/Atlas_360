'use client'

import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-end">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542384701-c0e46e0eda04?q=80&w=2500&auto=format&fit=crop")' }}
      >
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0A] via-[#0F0D0A]/50 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32 pt-32">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Unveil the Soul <br/> of Morocco
          </h1>
          <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[#F0E6D8] mb-10 max-w-lg">
            Curated itineraries for the modern explorer.
          </p>
          
          <Link 
            href="/explore"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#C1440E] text-[#FFF8F0] font-semibold tracking-wider uppercase text-sm hover:bg-[#D4622E] transition-colors duration-300 shadow-lg shadow-[#C1440E]/20 hover:shadow-[#C1440E]/40"
          >
            Explore Itineraries
          </Link>
        </div>
      </div>
    </section>
  )
}
