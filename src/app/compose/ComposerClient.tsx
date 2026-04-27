'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable, useDraggable } from '@dnd-kit/core'

// === SVGs ===
const CategoryIcon = ({ cat, className = "" }: { cat: string | null, className?: string }) => {
  const cls = `text-[#8B7355] ${className}`
  switch (cat?.toLowerCase()) {
    case 'landmark': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 10V21M8 10V21M12 10V21M16 10V21M19 10V21 M12 3L3 10h18L12 3z"/></svg>
    case 'market': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
    case 'museum': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 21V9M15 21V9M3 9l9-6 9 6"/></svg>
    case 'nature': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 014 13c0-4 4-9 8-11 4 2 8 7 8 11a7 7 0 01-7 7z"/><path d="M12 2v20"/></svg>
    case 'food': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15 V2a5 5 0 00-5 5v6h3.5M16 21h5"/></svg>
    case 'viewpoint': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    case 'religious': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M8 22h8M6 12a6 6 0 1012 0V5H6v7z"/></svg>
    default: return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  }
}

const formatDuration = (mins: number | null) => {
  if (mins === null || mins === undefined) return null;
  if (mins < 60) return `${mins} min`;
  if (mins === 60) return '1 hr';
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr ${rem} min`;
};

// === Sortable Stop Item ===
function SortableStop({ 
  id, location, dayNumber, onRemove, customNotes, onNotesChange 
}: { 
  id: string, location: any, dayNumber: number, onRemove: () => void, customNotes: string, onNotesChange: (v: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const [notesOpen, setNotesOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-[#1A1814] border border-white/5 rounded-xl p-3 mb-3 flex flex-col group">
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <div {...attributes} {...listeners} className="cursor-grab text-[#8B7355]/40 hover:text-[#8B7355] p-1 touch-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM20 6a2 2 0 11-4 0 2 2 0 014 0zM20 12a2 2 0 11-4 0 2 2 0 014 0zM20 18a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
        
        <CategoryIcon cat={location.category} />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-medium text-[#F0E6D8] truncate">{location.name}</h4>
        </div>

        <span className="text-[10px] uppercase tracking-wider text-[#8B7355]/60">Day {dayNumber}</span>
        
        <button onClick={onRemove} className="text-[#8B7355]/40 hover:text-red-400 transition-colors p-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="mt-2 pl-9 pr-2">
        <button onClick={() => setNotesOpen(!notesOpen)} className="text-[10px] text-[#8B7355] hover:text-[#C1440E] uppercase tracking-wider mb-2">
          {notesOpen ? '- Hide notes' : '+ Custom notes'}
        </button>
        {notesOpen && (
          <textarea
            value={customNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add your personal notes for this stop..."
            className="w-full bg-[#0F0D0A] border border-white/5 rounded-lg p-2 text-[12px] text-[#F0E6D8] placeholder-[#8B7355]/40 focus:outline-none focus:border-[#C1440E]/50 min-h-[60px] resize-none"
          />
        )}
      </div>
    </div>
  )
}

function DraggableLibraryItem({ loc, isAdded, onAdd }: { loc: any, isAdded: boolean, onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${loc.id}`,
    disabled: isAdded,
    data: { type: 'LibraryItem', loc }
  })

  return (
    <div 
      ref={setNodeRef} 
      {...attributes} 
      {...listeners}
      className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${isAdded ? 'bg-[#C1440E]/5 border-[#C1440E]/20 opacity-60 cursor-not-allowed' : 'bg-[#1A1814] border-white/5 hover:border-white/10 cursor-grab touch-none'} ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="mt-0.5"><CategoryIcon cat={loc.category} /></div>
      <div className="flex-1 min-w-0 pointer-events-none">
        <div className="flex items-center gap-2">
          <h4 className="text-[13px] font-medium text-[#F0E6D8] truncate">{loc.name}</h4>
          {loc.duration_minutes && (
            <span className="px-2 py-0.5 rounded-full bg-[#8B7355]/15 text-[#8B7355] text-[9px] whitespace-nowrap ml-auto">
              {formatDuration(loc.duration_minutes)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#8B7355]/70 truncate mt-1">{loc.description || loc.category}</p>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        disabled={isAdded}
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors z-10 relative pointer-events-auto ${isAdded ? 'bg-[#C1440E] text-white' : 'bg-[#231F18] text-[#8B7355] hover:text-[#F0E6D8] hover:bg-[#C1440E]'}`}
      >
        {isAdded ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
        )}
      </button>
    </div>
  )
}

function DroppableColumn({ day, items, children }: { day: number, items: string[], children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: day.toString() })
  return (
    <SortableContext id={day.toString()} items={items} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="flex-1 rounded-xl bg-[#1A1814]/30 border border-white/5 p-3 min-h-[150px] overflow-y-auto overflow-x-hidden atlas-scrollbar flex flex-col gap-0 pb-12">
        {children}
      </div>
    </SortableContext>
  )
}

// === Main Composer Component ===
export default function ComposerClient({ initialLocations }: { initialLocations: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('My Custom Itinerary')
  const [days, setDays] = useState<number[]>([1, 2, 3])
  const [itemsByDay, setItemsByDay] = useState<Record<number, string[]>>({ 1: [], 2: [], 3: [] })
  const [customNotes, setCustomNotes] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedItineraryId, setSavedItineraryId] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [activeDayForAdd, setActiveDayForAdd] = useState(1)
  
  // DND state
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Filtered locations
  const filteredLocs = useMemo(() => {
    return initialLocations.filter(loc => loc.name.toLowerCase().includes(search.toLowerCase()) || loc.itineraries?.title?.toLowerCase().includes(search.toLowerCase()))
  }, [initialLocations, search])

  const groupedLocs = useMemo(() => {
    const groups: Record<string, any[]> = {}
    filteredLocs.forEach(loc => {
      const itName = loc.itineraries?.title || 'Other'
      if (!groups[itName]) groups[itName] = []
      groups[itName].push(loc)
    })
    return groups
  }, [filteredLocs])

  const allAddedIds = useMemo(() => new Set(Object.values(itemsByDay).flat()), [itemsByDay])

  const handleAddStop = (loc: any) => {
    if (allAddedIds.has(loc.id)) return
    
    // Safety check: if activeDayForAdd isn't in days array, default to first day
    const targetDay = days.includes(activeDayForAdd) ? activeDayForAdd : days[0]

    setItemsByDay(prev => ({
      ...prev,
      [targetDay]: [...prev[targetDay], loc.id]
    }))
  }

  const handleRemoveStop = (id: string, day: number) => {
    setItemsByDay(prev => ({
      ...prev,
      [day]: prev[day].filter(x => x !== id)
    }))
    setCustomNotes(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const handleAddDay = () => {
    setDays(prev => {
      const nextDay = prev.length > 0 ? Math.max(...prev) + 1 : 1
      setItemsByDay(curr => ({ ...curr, [nextDay]: [] }))
      return [...prev, nextDay]
    })
  }

  const handleSave = async () => {
    if (allAddedIds.size === 0) {
      setError("Please add at least one stop to your itinerary.")
      return
    }
    setIsSaving(true)
    setError(null)
    
    try {
      const stops: Array<{
        location_id: string;
        day_number: number;
        order_index: number;
        custom_notes: string;
      }> = []
      for (const day of days) {
        const stopIds = itemsByDay[day] || []
        stopIds.forEach((id, idx) => {
          stops.push({
            location_id: id,
            day_number: day,
            order_index: idx,
            custom_notes: customNotes[id] || ''
          })
        })
      }

      const res = await fetch('/api/user-itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: '', stops })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save itinerary')
      
      setSavedItineraryId(data.id)
      setIsPublic(data.is_public)
      alert('Itinerary saved successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareToggle = async () => {
    if (!savedItineraryId) return
    const newValue = !isPublic
    setIsPublic(newValue)
    try {
      await fetch(`/api/user-itineraries/${savedItineraryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: newValue })
      })
    } catch (err) {
      console.error(err)
      setIsPublic(!newValue)
    }
  }

  const handleCopyLink = () => {
    if (!savedItineraryId) return
    const url = `${window.location.origin}/itinerary/${savedItineraryId}`
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }

  // --- DND Handlers ---
  const findContainer = (id: string) => {
    if (days.includes(Number(id))) return Number(id) // dropped on an empty column
    return Object.keys(itemsByDay).find((key) => itemsByDay[Number(key)].includes(id)) ? Number(Object.keys(itemsByDay).find((key) => itemsByDay[Number(key)].includes(id))) : null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    const overId = over?.id

    if (!overId || active.id === overId) return

    const activeContainer = findContainer(active.id as string)
    const overContainer = findContainer(overId as string)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    setItemsByDay((prev) => {
      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]
      const activeIndex = activeItems.indexOf(active.id as string)
      const overIndex = overItems.indexOf(overId as string)

      let newIndex = overItems.length
      if (!days.includes(Number(overId)) && overIndex >= 0) {
        newIndex = overIndex
      }

      const newOverItems = [...prev[overContainer]]
      newOverItems.splice(newIndex, 0, active.id as string)

      return {
        ...prev,
        [activeContainer]: prev[activeContainer].filter((item) => item !== active.id),
        [overContainer]: newOverItems,
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Check if dragging from library
    if (active.id.toString().startsWith('library-')) {
      setActiveId(null)
      if (!over) return
      
      const locId = active.id.toString().replace('library-', '')
      if (allAddedIds.has(locId)) return
      
      const overContainer = findContainer(over.id as string)
      if (overContainer) {
        const overIndex = itemsByDay[overContainer].indexOf(over.id as string)
        setItemsByDay((prev) => {
          const newItems = [...prev[overContainer]]
          if (overIndex >= 0) {
            newItems.splice(overIndex, 0, locId)
          } else {
            newItems.push(locId)
          }
          return { ...prev, [overContainer]: newItems }
        })
      }
      return
    }

    const activeContainer = findContainer(active.id as string)
    const overContainer = findContainer(over?.id as string)

    if (!activeContainer || !overContainer || activeContainer !== overContainer) {
      setActiveId(null)
      return
    }

    const activeIndex = itemsByDay[activeContainer].indexOf(active.id as string)
    const overIndex = itemsByDay[overContainer].indexOf(over?.id as string)

    if (activeIndex !== overIndex) {
      setItemsByDay((prev) => ({
        ...prev,
        [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
      }))
    }

    setActiveId(null)
  }

  const activeLoc = activeId ? initialLocations.find(l => l.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-[#0F0D0A] pt-[60px]">
        {/* Left Panel: Library */}
        <div className="w-[40%] flex flex-col border-r border-[#E8D5B7]/10 bg-[#0F0D0A]">
        <div className="p-6 border-b border-[#E8D5B7]/5 pb-4">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#F0E6D8] mb-4">Location Library</h2>
          <div className="relative mb-5">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search locations or itineraries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A1814] border border-[#E8D5B7]/10 rounded-full py-2.5 pl-10 pr-4 text-[13px] text-[#F0E6D8] placeholder-[#8B7355]/50 focus:outline-none focus:border-[#C1440E]/50 transition-colors"
            />
          </div>
          <div className="flex items-center justify-between bg-[#1A1814] border border-[#E8D5B7]/5 rounded-lg px-3 py-2">
            <span className="text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold">
              Adding stops to:
            </span>
            <select
              value={activeDayForAdd}
              onChange={(e) => setActiveDayForAdd(Number(e.target.value))}
              className="bg-transparent text-[11px] font-semibold uppercase tracking-widest text-[#C1440E] outline-none cursor-pointer"
            >
              {days.map(d => (
                <option key={d} value={d} className="bg-[#1A1814] text-[#F0E6D8]">Day {d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 atlas-scrollbar">
          {Object.entries(groupedLocs).map(([groupName, locs]) => (
            <div key={groupName}>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8B7355] mb-4 font-semibold">{groupName}</h3>
              <div className="space-y-3">
                {locs.map(loc => {
                  const isAdded = allAddedIds.has(loc.id)
                  return (
                    <DraggableLibraryItem 
                      key={loc.id} 
                      loc={loc} 
                      isAdded={isAdded} 
                      onAdd={() => handleAddStop(loc)} 
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Composer */}
      <div className="w-[60%] flex flex-col bg-[#0F0D0A] relative">
        <div className="p-8 border-b border-[#E8D5B7]/5 bg-[#0F0D0A] z-10 flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] placeholder-[#8B7355]/30 focus:ring-0 p-0"
            placeholder="Name your itinerary..."
          />
          {savedItineraryId && (
            <button onClick={() => router.push(`/itinerary/${savedItineraryId}`)} className="ml-4 flex-shrink-0 text-[#8B7355] hover:text-[#F0E6D8] text-[11px] uppercase tracking-widest font-semibold border border-[#8B7355]/30 px-4 py-2 rounded-full transition-colors">
              View Final →
            </button>
          )}
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex gap-6 pb-[120px] atlas-scrollbar">
            {days.map(day => (
              <div key={day} className="w-[320px] flex-shrink-0 flex flex-col h-full max-h-[calc(100vh-220px)]">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-[13px] uppercase tracking-[0.15em] font-semibold text-[#8B7355]">Day {day}</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#8B7355]/20 to-transparent" />
                </div>
                
                <DroppableColumn day={day} items={itemsByDay[day]}>
                  {itemsByDay[day].length === 0 && (
                    <p className="text-[12px] text-[#8B7355]/40 text-center py-6 border-2 border-dashed border-white/5 rounded-lg">Drop stops here</p>
                  )}
                  {itemsByDay[day].map(id => {
                    const loc = initialLocations.find(l => l.id === id)
                    if (!loc) return null
                    return (
                      <SortableStop
                        key={id}
                        id={id}
                        location={loc}
                        dayNumber={day}
                        onRemove={() => handleRemoveStop(id, day)}
                        customNotes={customNotes[id] || ''}
                        onNotesChange={(val) => setCustomNotes(prev => ({ ...prev, [id]: val }))}
                      />
                    )
                  })}
                </DroppableColumn>
              </div>
            ))}

            <button 
              onClick={handleAddDay}
              className="w-[320px] flex-shrink-0 h-[100px] mt-8 rounded-xl border-2 border-dashed border-[#8B7355]/20 flex items-center justify-center text-[12px] font-semibold uppercase tracking-widest text-[#8B7355] hover:text-[#C1440E] hover:border-[#C1440E]/40 transition-colors"
            >
              + Add Day
            </button>

            <DragOverlay>
              {activeId && activeLoc ? (
                <div className="bg-[#1A1814] border border-[#C1440E]/50 shadow-2xl shadow-black rounded-xl p-3 flex items-center gap-3 w-[290px] opacity-90">
                  <div className="text-[#C1440E] p-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM20 6a2 2 0 11-4 0 2 2 0 014 0zM20 12a2 2 0 11-4 0 2 2 0 014 0zM20 18a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>
                  <CategoryIcon cat={activeLoc.category} />
                  <h4 className="text-[13px] font-medium text-[#F0E6D8] truncate">{activeLoc.name}</h4>
                </div>
              ) : null}
            </DragOverlay>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0F0D0A]/95 backdrop-blur-xl border-t border-[#E8D5B7]/10 p-5 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-6">
            <span className="text-[12px] text-[#8B7355] uppercase tracking-widest font-medium">
              {allAddedIds.size} stops across {days.length} days
            </span>
            {error && (
              <span className="text-[11px] text-red-400 font-medium border border-red-400/20 bg-red-400/10 px-3 py-1 rounded-full">Error: {error}</span>
            )}
            
            {savedItineraryId && (
              <div className="flex items-center gap-4 border-l border-[#8B7355]/20 pl-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={isPublic} onChange={handleShareToggle} />
                    <div className={`w-9 h-5 rounded-full transition-colors ${isPublic ? 'bg-[#C1440E]' : 'bg-[#1A1814] border border-white/10'}`}></div>
                    <div className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8B7355] group-hover:text-[#F0E6D8] transition-colors">
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </label>
                
                {isPublic && (
                  <div className="flex items-center gap-2 bg-[#1A1814] border border-white/5 rounded-lg px-3 py-1.5">
                    <span className="text-[10px] text-[#8B7355] max-w-[150px] truncate select-all">
                      atlas360.ma/itinerary/{savedItineraryId.slice(0, 8)}...
                    </span>
                    <button onClick={handleCopyLink} className="text-[#C1440E] hover:text-[#D4622E] p-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving || allAddedIds.size === 0}
            className="px-8 py-3 rounded-full bg-[#C1440E] hover:bg-[#D4622E] disabled:bg-[#C1440E]/50 disabled:cursor-not-allowed text-white text-[12px] font-semibold uppercase tracking-widest transition-colors shadow-lg shadow-[#C1440E]/20"
          >
            {isSaving ? 'Saving...' : (savedItineraryId ? 'Save Copy' : 'Save Itinerary')}
          </button>
        </div>
      </div>
      </div>
    </DndContext>
  )
}
