import Link from 'next/link'

export default function HelpCtaStrip() {
  return (
    <section className="border-t border-border bg-card/40 py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12 flex flex-col sm:flex-row
                      items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary mb-2">
            Planning support
          </p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl
                         font-semibold text-foreground tracking-tight">
            Need help planning your Morocco trip?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            Our team helps with route timing, bookings, logistics, and local experiences.
          </p>
        </div>
        <Link
          href="/help"
          className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4
                     bg-primary text-primary-foreground text-[12px] font-semibold
                     uppercase tracking-widest shadow-lg shadow-primary/20
                     hover:bg-primary/90 transition-colors"
        >
          Get planning help →
        </Link>
      </div>
    </section>
  )
}
