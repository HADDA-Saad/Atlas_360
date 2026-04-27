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
      className="text-[10px] uppercase tracking-widest font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-500/20 rounded-md bg-red-500/5 transition-colors disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
