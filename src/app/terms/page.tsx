import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Atlas 360',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-28 px-4 atlas-grain">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground tracking-tight">
          Terms of Service
        </h1>
        <div className="prose prose-sm md:prose-base prose-invert">
          <p className="text-muted-foreground">Last updated: June 2026</p>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Atlas 360. By accessing or using our platform, you agree to be bound by these Terms of Service.
            Atlas 360 acts as a travel discovery and booking facilitation platform connecting travelers with verified local guides.
          </p>
          <h2 className="text-foreground mt-8 text-xl font-semibold">1. Account and Booking Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users must provide accurate information when creating an account or requesting bookings. You are responsible for maintaining the confidentiality of your account credentials.
          </p>
          <h2 className="text-foreground mt-8 text-xl font-semibold">2. Cancellations and Refunds</h2>
          <p className="text-muted-foreground leading-relaxed">
            Please refer to our <a href="/cancellation-policy" className="text-primary hover:underline">Cancellation Policy</a> for detailed rules regarding refunds and guide compensation for canceled bookings.
          </p>
          <h2 className="text-foreground mt-8 text-xl font-semibold">3. Platform Rules</h2>
          <p className="text-muted-foreground leading-relaxed">
            Any misuse of the platform, including fraudulent bookings, harassment of guides, or violation of our cultural ethics guidelines, may result in immediate account termination.
          </p>
        </div>
      </div>
    </div>
  )
}
