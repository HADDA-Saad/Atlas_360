import AssistanceRequestForm from '@/components/assistance/AssistanceRequestForm'

export default function PlanningSupportSection() {
  return (
    <section id="planning-help" className="border-y border-border bg-secondary py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1fr_460px] md:items-start md:px-12">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            Logistics and collaboration
          </span>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-cormorant)] text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            When the route needs a human layer, travelers can ask Atlas 360 for help.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            This first request flow captures planning needs for transport, timing, stays, meals, local experiences, and special trip details. It is ready to become an internal operations queue.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {['Route timing', 'Booking guidance', 'Local logistics'].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-background p-4">
                <p className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <AssistanceRequestForm
          requestType="planning"
          title="Request planning help"
          description="Tell us what you are trying to arrange and Atlas 360 can follow up from the assistance queue."
          sourcePath="/"
        />
      </div>
    </section>
  )
}
