'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function FooterWrapper() {
  const pathname = usePathname()

  // Do not show footer on the explore (map) page
  if (pathname === '/explore' || pathname?.startsWith('/explore/')) {
    return null
  }

  return <Footer />
}
