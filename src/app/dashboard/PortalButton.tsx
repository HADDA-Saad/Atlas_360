'use client'

import { useState } from 'react'

export default function PortalButton() {
  const [loading, setLoading] = useState(false)

  const handlePortal = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open portal')
      }
    } catch {
      alert('Error opening portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="block w-full text-center px-6 py-2.5 rounded-lg bg-card border border-border text-foreground text-[11px] font-bold uppercase tracking-widest hover:bg-muted transition-colors disabled:opacity-50"
    >
      {loading ? 'Opening...' : 'Manage subscription'}
    </button>
  )
}
