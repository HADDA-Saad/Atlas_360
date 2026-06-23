'use client'

import { useState } from 'react'
import { Play, X, Film, Sparkles, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

export default function VideoPromoSection() {
  const [isOpen, setIsOpen] = useState(false)

  // A beautiful free public stock video of the desert/Moroccan-like landscape for demo purposes
  const videoUrl = '/demo.mp4'
  return (
    <section className="bg-secondary/40 border-y border-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Side: Copy & Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-primary text-[10px] tracking-[0.3em] font-semibold uppercase">
                <Sparkles size={12} className="text-primary animate-pulse" />
                App Walkthrough
              </span>
              <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl lg:text-6xl text-foreground font-semibold leading-tight tracking-tight">
                Explore Atlas 360 <br />
                <span className="italic text-foreground/80">in Action</span>
              </h2>
            </div>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-light">
              Watch our short product demonstration to see how we blend immersive 360° Street View panoramas, intelligent route building, and certified local guides into a seamless travel platform.
            </p>

            <ul className="flex flex-col gap-4 mt-2">
              {[
                { title: 'Interactive Route Builder', desc: 'See how easily itineraries can be browsed, custom-composed, and modified.' },
                { title: '360° Destination Previews', desc: 'Experience the zero-friction transition from maps to Street View imagery.' },
                { title: 'Local Guide Directory', desc: 'Discover how travelers match with vetted experts for their adventures.' },
              ].map((feat, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{feat.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{feat.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Elegant Video Mockup/Placeholder */}
          <div className="lg:col-span-7">
            <div className="relative group rounded-xl overflow-hidden border border-border bg-card shadow-2xl transition-all duration-500 hover:border-primary/30">

              {/* Browser/Player Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/80 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  <Film size={10} className="text-muted-foreground" />
                  Platform Walkthrough
                </div>
                <div className="w-12" /> {/* Spacing */}
              </div>

              {/* Video Thumbnail Area */}
              <div
                className="relative aspect-video w-full bg-black/90 cursor-pointer overflow-hidden group/thumb"
                onClick={() => setIsOpen(true)}
              >
                {/* Background Poster Image */}
                <Image
                  src="/Images/sahara-hero.jpg"
                  alt="Atlas 360 App Walkthrough Thumbnail"
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover opacity-80 transition-all duration-700 scale-100 group-hover/thumb:scale-105 group-hover/thumb:opacity-60"
                  priority
                />

                {/* Glassmorphic overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-500" />

                {/* Animated Pulsing Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform duration-500 scale-100 group-hover/thumb:scale-110 active:scale-95">
                    {/* Ring animations */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-ping opacity-75" />
                    <span className="absolute inline-flex h-[130%] w-[130%] rounded-full bg-primary/20 animate-pulse opacity-40" />
                    <Play size={28} className="fill-current text-primary-foreground relative z-10 translate-x-0.5" />
                  </div>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary-foreground/10 dark:bg-primary/20 px-2 py-1 rounded-sm backdrop-blur-sm">
                      4K Walkthrough
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-white tracking-tight">
                      Morocco Journey Designer
                    </h3>
                  </div>
                  <span className="text-xs text-white/70 font-medium">02:14</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modern Lightbox Video Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl rounded-xl overflow-hidden border border-white/10 bg-black/90 shadow-2xl aspect-video max-h-[85vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 border border-white/10 transition-all focus:outline-none"
            >
              <X size={20} />
            </button>

            {/* Video Player */}
            <video
              src={videoUrl}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </section>
  )
}
