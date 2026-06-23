'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteItineraryButton({ id, title }: { id: string, title: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/user-itineraries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to delete itinerary')
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete itinerary"
      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors disabled:opacity-50"
    >
      {isDeleting ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      )}
    </button>
  )
}
