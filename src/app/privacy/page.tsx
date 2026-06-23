import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Atlas 360',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-28 px-4 atlas-grain">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground tracking-tight">
          Privacy Policy
        </h1>
        <div className="prose prose-sm md:prose-base prose-invert">
          <p className="text-muted-foreground">Last updated: June 2026</p>
          <p className="text-muted-foreground leading-relaxed">
            Your privacy is critically important to us. At Atlas 360, we have a few fundamental principles regarding your privacy:
          </p>
          <ul className="text-muted-foreground list-disc pl-5 space-y-2 mt-4">
            <li>We don't ask you for personal information unless we truly need it.</li>
            <li>We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
            <li>We don't store personal information on our servers unless required for the on-going operation of one of our services.</li>
          </ul>
          <h2 className="text-foreground mt-8 text-xl font-semibold">Information we collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide directly to us, such as your name, email address, and booking preferences to facilitate travel arrangements. 
            Payment information is processed securely through our partners (like Stripe) and is never fully exposed to our servers.
          </p>
          <h2 className="text-foreground mt-8 text-xl font-semibold">How we use it</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the information we collect to connect you with verified guides, improve our itineraries, and ensure a seamless travel experience in Morocco.
          </p>
        </div>
      </div>
    </div>
  )
}
