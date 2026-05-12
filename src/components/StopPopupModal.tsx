'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Star, Clock, Info, Navigation, MapPin } from 'lucide-react'
import type { Location } from '@/types'

// Simple media query hook
export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false)

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}

interface StopPopupModalProps {
  location: Location | null
  isOpen: boolean
  onClose: () => void
  onOpenPanorama: () => void
  onFindPlaces: () => void
  totalStops?: number
}

export default function StopPopupModal({
  location,
  isOpen,
  onClose,
  onOpenPanorama,
  onFindPlaces,
  totalStops = 0,
}: StopPopupModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [rating, setRating] = useState<number | null>(null)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)

  useEffect(() => {
    if (isOpen && location) {
      setIsLoadingReviews(true)
      fetch(`/api/reviews?target_type=location&location_id=${location.id}`)
        .then((res) => res.json())
        .then((data) => {
          setRating(data.averageRating)
        })
        .catch((err) => console.error('Failed to fetch rating', err))
        .finally(() => setIsLoadingReviews(false))
    }
  }, [isOpen, location])

  if (!location) return null

  const content = (
    <div className="flex flex-col gap-4 mt-4">
      {location.image_url && (
        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-2">
          <Image
            src={location.image_url}
            alt={location.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Day {location.day_number || 1} · Stop {location.order_index} {totalStops > 0 && `of ${totalStops}`}
        </div>
        {rating !== null && !isLoadingReviews && (
          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-semibold">
            <Star className="w-4 h-4 fill-primary" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {location.best_time && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Best time
            </div>
            <div className="text-sm font-medium">{location.best_time}</div>
          </div>
        )}
        
        {location.duration_minutes && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Duration
            </div>
            <div className="text-sm font-medium">~{location.duration_minutes} min</div>
          </div>
        )}
      </div>

      {location.tips && (
        <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3 mt-2 border border-border">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground/90 leading-relaxed italic">{location.tips}</p>
        </div>
      )}

      {location.transport_to_next && (
        <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg mt-2">
          <div className="bg-muted p-2 rounded-full">
            <Navigation className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Getting to next stop</div>
            <div className="text-sm font-semibold">
              {location.transport_to_next}
              {location.transport_duration_minutes && ` · ${location.transport_duration_minutes} min`}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button onClick={onOpenPanorama} className="flex-1 font-semibold tracking-wide">
          Open 360° View
        </Button>
        <Button onClick={onFindPlaces} variant="outline" className="flex-1 font-semibold tracking-wide">
          Find Nearby Places
        </Button>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-[family-name:var(--font-cormorant)] text-primary">
              {location.name}
            </DialogTitle>
            <DialogDescription className="sr-only">Details about {location.name}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-[20px] max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-[family-name:var(--font-cormorant)] text-primary text-left">
            {location.name}
          </SheetTitle>
          <SheetDescription className="sr-only">Details about {location.name}</SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  )
}
