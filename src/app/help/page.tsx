import type { Metadata } from 'next'
import AssistanceRequestForm from '@/components/assistance/AssistanceRequestForm'

export const metadata: Metadata = {
  title: 'Planning Support | Atlas 360',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-16 md:pt-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-primary md:text-5xl">
          Planning Support
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Our team is here to help you turn inspiration into reality.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_460px] md:items-start">
          {/* Left Column */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              How we can help
            </span>
            <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-cormorant)] text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
              From route timing to local logistics, we provide the human layer.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Atlas 360 helps with route timing, hotel and restaurant booking guidance, local logistics, and special trip requests. 
              Whether you need to know how long it takes to cross the Atlas Mountains or you want us to secure a reservation at a busy riad, our team can assist.
            </p>
            
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {['Route timing', 'Booking guidance', 'Local logistics'].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-card/40 p-4">
                  <p className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-10">
            <AssistanceRequestForm
              requestType="planning"
              title="Request planning help"
              description="Tell us about your itinerary ideas and we'll help refine your route and timing."
              sourcePath="/help"
            />
            
            <div className="border-t border-border"></div>

            <AssistanceRequestForm
              requestType="booking_help"
              title="Need booking assistance?"
              description="Having trouble securing a reservation or need advice on where to stay?"
              sourcePath="/help"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
