'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface WeatherData {
  main: {
    temp: number
  }
  weather: Array<{
    description: string
    icon: string
  }>
}

export default function WeatherWidget({ city }: { city: string }) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(!!apiKey)

  useEffect(() => {
    if (!apiKey) return

    let active = true
    Promise.resolve().then(() => {
      if (active) setIsLoading(true)
    })

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},MA&units=metric&appid=${apiKey}`
        )
        if (!response.ok) {
          if (active) setIsLoading(false)
          return
        }
        const data = await response.json()
        if (active) setWeather(data)
      } catch {
        // Network failure — stay silent, widget will return null
      } finally {
        if (active) setIsLoading(false)
      }
    }

    fetchWeather()
    return () => {
      active = false
    }
  }, [city, apiKey])

  // If no key or fetch failed, silently return null
  if (!isLoading && !weather) return null

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse bg-muted/30 px-2 py-1 rounded-md border border-border/50">
        <div className="w-6 h-6 bg-muted-foreground/20 rounded-full" />
        <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
      </div>
    )
  }

  const { temp } = weather!.main
  const { description, icon } = weather!.weather[0]

  return (
    <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/50 shadow-sm" title={description}>
      <Image
        src={`https://openweathermap.org/img/wn/${icon}.png`}
        alt={description}
        width={24}
        height={24}
        className="drop-shadow-sm"
      />
      <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">
        {Math.round(temp)}°C
      </span>
      <span className="text-[10px] uppercase text-muted-foreground/70 hidden sm:inline-block ml-0.5 max-w-[80px] truncate">
        {description}
      </span>
    </div>
  )
}
