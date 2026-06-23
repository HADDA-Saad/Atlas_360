'use client'

import { useState } from 'react'

interface TeamMemberSelectProps {
  requestId: string
  currentAssignee: string | null
}

const TEAM_MEMBERS = ['Unassigned', 'Zac', 'Jaz', 'Hamza', 'Layla']

export default function TeamMemberSelect({ requestId, currentAssignee }: TeamMemberSelectProps) {
  const [assignee, setAssignee] = useState(currentAssignee || 'Unassigned')
  const [saving, setSaving] = useState(false)

  const handleChange = async (newAssignee: string) => {
    setSaving(true)
    setAssignee(newAssignee)

    try {
      const valueToSend = newAssignee === 'Unassigned' ? null : newAssignee
      const res = await fetch(`/api/assistance-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_team_member: valueToSend }),
      })

      if (!res.ok) {
        setAssignee(currentAssignee || 'Unassigned') // Revert
        console.error('Failed to update team member')
      }
    } catch {
      setAssignee(currentAssignee || 'Unassigned')
      console.error('Failed to update team member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative inline-block w-32">
      <select
        value={assignee}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className={`w-full bg-card border border-border rounded-lg px-2.5 py-1 text-[11px] font-medium text-muted-foreground outline-none cursor-pointer hover:border-primary/30 transition-colors appearance-none ${saving ? 'opacity-50' : ''}`}
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 6px center',
          backgroundSize: '10px',
          paddingRight: '20px',
        }}
      >
        {TEAM_MEMBERS.map(member => (
          <option key={member} value={member} className="bg-background text-foreground">{member}</option>
        ))}
      </select>
    </div>
  )
}
