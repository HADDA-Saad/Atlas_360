'use client'

import { useState } from 'react'

interface NotesEditorProps {
  requestId: string
  initialNotes: string | null
}

export default function NotesEditor({ requestId, initialNotes }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/assistance-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal_notes: notes || null }),
      })

      if (res.ok) {
        setIsEditing(false)
      } else {
        console.error('Failed to update notes')
      }
    } catch (err) {
      console.error('Failed to update notes', err)
    } finally {
      setSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 w-full min-w-[150px]">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes..."
          disabled={saving}
          className="w-full text-[11px] bg-card border border-border rounded-lg p-2 outline-none resize-none min-h-[50px] text-foreground"
        />
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => {
              setNotes(initialNotes || '')
              setIsEditing(false)
            }}
            disabled={saving}
            className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground font-semibold px-2 py-0.5 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[9px] uppercase tracking-widest text-primary hover:text-primary/80 font-semibold px-2 py-0.5 rounded transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="group cursor-pointer min-w-[150px] max-w-[200px]"
    >
      {notes ? (
        <p className="text-[12px] text-muted-foreground line-clamp-2 hover:text-foreground transition-colors pr-4 relative">
          {notes}
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] opacity-0 group-hover:opacity-100 text-primary transition-opacity">✎</span>
        </p>
      ) : (
        <span className="text-[11px] text-muted-foreground/40 italic hover:text-primary transition-colors flex items-center gap-1">
          + Add notes
        </span>
      )}
    </div>
  )
}
