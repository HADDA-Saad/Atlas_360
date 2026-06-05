'use client'

import { useState } from 'react'

export interface GuideWithProfile {
  id: string
  bio: string | null
  languages: string[]
  regions: string[]
  daily_rate_mad: number
  whatsapp_number: string | null
  is_verified: boolean
  rating: number | null
  created_at: string
  full_name: string | null
}

interface GuideVerificationTabProps {
  initialGuides: GuideWithProfile[]
}

export default function GuideVerificationTab({ initialGuides }: GuideVerificationTabProps) {
  const [guides, setGuides] = useState<GuideWithProfile[]>(initialGuides)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggleVerify = async (guideId: string, currentStatus: boolean) => {
    setUpdatingId(guideId)
    setError(null)

    try {
      const res = await fetch(`/api/admin/guides/${guideId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_verified: !currentStatus }),
      })

      if (res.ok) {
        const updated = await res.json()
        setGuides(prev =>
          prev.map(g => (g.id === guideId ? { ...g, is_verified: updated.is_verified } : g))
        )
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update verification status.')
      }
    } catch {
      setError('Network error occurred.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-[28px] font-semibold text-foreground tracking-tight">
          Guide Verification Queue
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Review and approve registered local tour guides to list them in the traveler index.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {guides.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No registered guides found.</p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Biography</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Languages</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Regions</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Daily Rate</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">WhatsApp</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {guides.map(guide => (
                  <tr key={guide.id} className="border-b border-border last:border-0 hover:bg-card/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-foreground text-[13px] font-medium">{guide.full_name || 'Unnamed Guide'}</p>
                      <p className="text-[10px] text-muted-foreground">ID: {guide.id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-muted-foreground text-[12px] line-clamp-2" title={guide.bio || ''}>
                        {guide.bio || <span className="italic text-muted-foreground/45">No bio written</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground italic">—</span>
                        ) : (
                          guide.languages.map(lang => (
                            <span key={lang} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                              {lang}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {guide.regions.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground italic">—</span>
                        ) : (
                          guide.regions.map(reg => (
                            <span key={reg} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                              {reg}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground text-[12px] font-mono whitespace-nowrap">
                      {guide.daily_rate_mad} MAD
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px]">
                      {guide.whatsapp_number || <span className="italic text-muted-foreground/45">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        guide.is_verified
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {guide.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleVerify(guide.id, guide.is_verified)}
                        disabled={updatingId === guide.id}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          guide.is_verified
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                            : 'bg-primary text-primary-foreground hover:bg-primary/95 border border-primary shadow-sm shadow-primary/10'
                        } disabled:opacity-50`}
                      >
                        {updatingId === guide.id ? 'Saving...' : guide.is_verified ? 'Unverify' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
