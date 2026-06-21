import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cancellation Policy | Atlas 360',
}

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-background atlas-grain py-28 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/guides"
          className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← Back to Guides
        </Link>

        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground tracking-tight mb-2">
          Cancellation Policy
        </h1>
        <p className="text-[13px] text-muted-foreground mb-10">
          Last updated: June 2026. These terms apply to all guide bookings made on Atlas 360.
        </p>

        <div className="prose prose-sm max-w-none space-y-8 text-[14px] leading-relaxed text-foreground/80">

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-3">
              1. Refund Schedule
            </h2>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Cancellation timing</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Refund</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['More than 14 days before start date', 'Full refund'],
                    ['7 – 14 days before start date', '50% refund'],
                    ['Less than 7 days before start date', 'No refund'],
                    ['No-show on the day', 'No refund'],
                  ].map(([timing, refund]) => (
                    <tr key={timing} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-[13px] text-foreground/80">{timing}</td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-foreground">{refund}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-3">
              2. How to Cancel
            </h2>
            <p>
              To cancel a confirmed booking, contact Atlas 360 support through the Help page before the applicable window closes. Cancellations are not accepted via direct message to the guide.
            </p>
            <p className="mt-3">
              The cancellation date is the date Atlas 360 receives and confirms your cancellation request — not the date you send it.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-3">
              3. Guide Cancellations
            </h2>
            <p>
              If a verified guide cancels a confirmed booking for any reason, you will receive a full refund regardless of timing. Atlas 360 will also attempt to match you with an equivalent guide at no extra cost.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-3">
              4. Force Majeure
            </h2>
            <p>
              In the event of natural disasters, civil unrest, government-imposed travel bans, or other circumstances outside either party's control, Atlas 360 will issue a full credit or refund at its discretion.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-3">
              5. Payment & Escrow
            </h2>
            <p>
              Payment is collected by Atlas 360 and held in escrow until the tour is marked complete. The guide receives their net earnings (total minus the 10% platform fee) only after the tour is confirmed completed by both parties or by an administrator.
            </p>
            <p className="mt-3">
              No funds are released to the guide during the cancellation window — cancellation refunds are processed from escrow directly back to your original payment method within 5–10 business days.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-3">
              6. Disputes
            </h2>
            <p>
              If you believe a refund was incorrectly calculated or denied, contact <a href="/help" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">Atlas 360 support</a>. All disputes are reviewed by an administrator within 72 hours.
            </p>
          </section>

          <section className="pt-4 border-t border-border">
            <p className="text-[12px] text-muted-foreground">
              By submitting a guide booking request on Atlas 360, you confirm that you have read, understood, and agreed to this cancellation policy in full. This policy forms part of the booking contract between you, the guide, and Atlas 360.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
