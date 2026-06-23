'use client'

import { useState } from 'react'
import Link from 'next/link'
import DeleteItineraryButton from './DeleteItineraryButton'

export default function CustomItinerariesList({ itineraries }: { itineraries: any[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Newest first')
  const [visibility, setVisibility] = useState('All')

  const filtered = itineraries
    .filter(it => {
      if (visibility === 'Private' && it.is_public) return false
      if (visibility === 'Public' && !it.is_public) return false
      if (search && !it.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'Newest first') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === 'Oldest first') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sort === 'A → Z') return a.title.localeCompare(b.title)
      if (sort === 'Z → A') return b.title.localeCompare(a.title)
      return 0
    })

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-[family-name:var(--font-cormorant)] text-[28px] font-semibold text-foreground tracking-tight">
            My Itineraries
          </h2>
          <span className="text-[12px] text-muted-foreground pt-1">{filtered.length} {filtered.length === 1 ? 'itinerary' : 'itineraries'}</span>
        </div>
        <Link href="/compose" className="text-[11px] uppercase tracking-widest font-semibold text-primary hover:text-primary/80 transition-colors">
          + Create new
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search your itineraries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-primary/50 outline-none"
          />
        </div>
        
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-card border border-border rounded-xl px-4 pr-8 py-2.5 text-sm appearance-none cursor-pointer focus:border-primary/50 outline-none"
          style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
        >
          <option>Newest first</option>
          <option>Oldest first</option>
          <option>A → Z</option>
          <option>Z → A</option>
        </select>

        <div className="flex bg-card border border-border rounded-xl p-1 shrink-0">
          {['All', 'Private', 'Public'].map(v => (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest rounded-lg transition-colors ${visibility === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((itinerary) => (
            <div key={itinerary.id} className="group relative bg-card border border-border rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden transition-colors hover:border-primary/30">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"></div>
              <div className="pl-2">
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-bold text-foreground mb-2">{itinerary.title}</h3>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm ${itinerary.is_public ? 'bg-blue-500/10 text-blue-400' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                    {itinerary.is_public ? 'Public' : 'Private'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Created {new Date(itinerary.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pl-2">
                <Link 
                  href={`/itinerary/${itinerary.id}`}
                  className="text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View →
                </Link>
                <DeleteItineraryButton id={itinerary.id} title={itinerary.title} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 border border-border rounded-2xl">
          <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <polygon fill="currentColor" stroke="none" points="12,5 14,12 12,10 10,12" />
              <polygon fill="currentColor" stroke="none" opacity="0.5" points="12,19 10,12 12,14 14,12" />
            </svg>
          </div>
          <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-2">No itineraries found</h3>
          <p className="text-sm text-muted-foreground mb-6">You haven't created any custom journeys matching your filters.</p>
          {(search || visibility !== 'All') ? (
            <button onClick={() => { setSearch(''); setVisibility('All') }} className="text-[11px] uppercase tracking-widest font-semibold text-primary hover:text-primary/80 transition-colors">
              Clear filters
            </button>
          ) : (
            <Link href="/compose" className="text-[11px] uppercase tracking-widest font-semibold text-primary hover:text-primary/80 transition-colors">
              Create your first →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
