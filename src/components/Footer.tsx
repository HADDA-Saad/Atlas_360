'use client'

import Link from 'next/link'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-secondary border-t border-border relative mt-auto">
      {/* Scroll to Top Button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6">
        <button 
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-secondary border border-primary/30 flex items-center justify-center text-primary hover:bg-muted transition-colors hover:border-primary"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Left Side: Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold tracking-wide text-primary">
                Atlas 360
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              © 2026 Atlas 360. Crafted with heritage and precision.
            </p>
          </div>

          {/* Right Side: Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link href="#" className="text-xs text-foreground/60 hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="text-xs text-foreground/60 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-foreground/60 hover:text-primary transition-colors">Contact Support</Link>
            <Link href="#" className="text-xs text-foreground/60 hover:text-primary transition-colors">Cultural Ethics</Link>
            <Link href="#" className="text-xs text-foreground/60 hover:text-primary transition-colors">Our Story</Link>
          </div>

        </div>
      </div>
    </footer>
  )
}
