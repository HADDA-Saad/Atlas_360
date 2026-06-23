'use client'

import { useState } from 'react'

interface StatusSelectProps {
  requestId: string
  currentStatus: string
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'closed', label: 'Closed', color: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
]

export default function StatusSelect({ requestId, currentStatus }: StatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  const handleChange = async (newStatus: string) => {
    setSaving(true)
    setStatus(newStatus)

    try {
      const res = await fetch(`/api/assistance-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        setStatus(currentStatus) // revert on failure
        console.error('Failed to update status')
      }
    } catch {
      setStatus(currentStatus)
      console.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const currentOption = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0]

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border outline-none cursor-pointer transition-colors appearance-none ${currentOption.color} ${saving ? 'opacity-50' : ''}`}
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 6px center',
        backgroundSize: '12px',
        paddingRight: '24px',
      }}
    >
      {STATUS_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
