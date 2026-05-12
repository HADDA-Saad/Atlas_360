'use client'

import { useState, useEffect } from 'react'

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
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    if (!apiKey) {
      setIsLoading(false)
      return
    }

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},MA&units=metric&appid=${apiKey}`
        )
        if (!response.ok) {
          // Silently discard non-OK responses (e.g. 401 invalid key, 404 city not found)
          setIsLoading(false)
          return
        }
        const data = await response.json()
        setWeather(data)
      } catch {
        // Network failure — stay silent, widget will return null
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeather()
  }, [city])

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
      <img
        src={`https://openweathermap.org/img/wn/${icon}.png`}
        alt={description}
        className="w-6 h-6 drop-shadow-sm"
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
