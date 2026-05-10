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
      className="inline-block px-6 py-2.5 rounded-lg bg-[#231F18] border border-[#E8D5B7]/10 text-[#F0E6D8] text-[11px] font-bold uppercase tracking-widest hover:bg-[#2A251E] transition-colors disabled:opacity-50"
    >
      {loading ? 'Opening...' : 'Manage subscription'}
    </button>
  )
}
