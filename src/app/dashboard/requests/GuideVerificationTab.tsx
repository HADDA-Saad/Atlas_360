'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, FileText, ExternalLink, ShieldAlert, Loader2 } from 'lucide-react'

export interface GuideVerificationRequest {
  id: string
  guide_id: string
  first_name: string
  last_name: string
  birth_date: string
  id_document_url: string
  license_document_url: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  profile_name: string
  guides: {
    bio: string
    languages: string[]
    regions: string[]
    daily_rate_mad: number
    whatsapp_number: string
    profile_picture_url: string
    is_verified: boolean
  } | null
}

interface GuideVerificationTabProps {
  initialGuides: GuideVerificationRequest[]
}

export default function GuideVerificationTab({ initialGuides }: GuideVerificationTabProps) {
  const [requests, setRequests] = useState<GuideVerificationRequest[]>(initialGuides)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [viewingDoc, setViewingDoc] = useState<{ url: string, loading: boolean } | null>(null)

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const notes = status === 'rejected' ? prompt("Enter rejection reason (required):") : null
    
    if (status === 'rejected' && !notes) return // Cancelled or empty
    
    setUpdatingId(id)
    setError(null)

    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes }),
      })

      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status, admin_notes: notes } : r))
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

  const openDocument = async (bucket: string, path: string) => {
    setViewingDoc({ url: '', loading: true })
    try {
      const res = await fetch(`/api/admin/documents/${bucket}/${path}`)
      if (!res.ok) throw new Error('Failed to get secure link')
      const data = await res.json()
      window.open(data.url, '_blank')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setViewingDoc(null)
    }
  }

  // Sort: Pending first, then by date
  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-[28px] font-semibold text-foreground tracking-tight">
          Guide Verification Queue
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Review documents and personal information to approve local tour guides.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {sortedRequests.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No verification requests found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedRequests.map(req => (
            <div key={req.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col md:flex-row gap-8">
              
              {/* Left Column: Personal & Profile */}
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-muted rounded-full overflow-hidden shrink-0">
                      {req.guides?.profile_picture_url ? (
                        <img src={req.guides.profile_picture_url} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">N/A</div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        {req.first_name} {req.last_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">User ID: {req.guide_id.substring(0,8)}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    req.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Birth Date</p>
                    <p className="text-sm font-mono">{req.birth_date}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">WhatsApp</p>
                    <p className="text-sm font-mono">{req.guides?.whatsapp_number || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3 border border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Bio</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{req.guides?.bio || 'N/A'}</p>
                </div>
              </div>

              {/* Right Column: Documents & Actions */}
              <div className="md:w-80 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/50 pt-6 md:pt-0 md:pl-8">
                
                <div className="space-y-4 mb-8">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">Secure Documents</p>
                  
                  <button 
                    onClick={() => openDocument('guide_documents', req.id_document_url)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">ID / Passport</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <button 
                    onClick={() => openDocument('guide_documents', req.license_document_url)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Guide License</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        disabled={updatingId === req.id}
                        className="flex-1 py-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'approved')}
                        disabled={updatingId === req.id}
                        className="flex-1 py-2.5 rounded-lg border border-green-500/20 bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  )}

                  {req.status === 'rejected' && req.admin_notes && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2">
                      <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1">Rejection Reason</p>
                        <p className="text-xs text-destructive/80">{req.admin_notes}</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
