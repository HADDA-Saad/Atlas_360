import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plans & Pricing | Atlas 360',
  description: 'Choose your Atlas 360 plan. Explorer, Nomad, or Elite — unlock Morocco your way from 99 MAD/month.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
