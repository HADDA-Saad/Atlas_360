'use client'

import { useState, useCallback } from 'react'
import ItineraryPDF, { type ItineraryPDFProps } from './ItineraryPDF'

interface PDFDownloadButtonProps {
  stops: ItineraryPDFProps['stops']
  title: string
  userEmail: string
  tier: string
  coverImageUrl?: string | null
}

export default function PDFDownloadButton({ stops, title, userEmail, tier, coverImageUrl }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Dynamically import pdf() only when user clicks — avoids eager rendering
      const { pdf } = await import('@react-pdf/renderer')

      const generatedDate = new Date().toLocaleDateString('en-GB')
      const filename = `atlas360-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`

      const doc = (
        <ItineraryPDF
          title={title}
          coverImageUrl={coverImageUrl}
          stops={stops}
          userEmail={userEmail}
          generatedDate={generatedDate}
        />
      )

      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Could not generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [title, coverImageUrl, stops, userEmail])

  const buttonIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )

  if (tier === 'explorer') {
    return (
      <button 
        disabled
        title="Available for Nomad and Elite — upgrade at /pricing"
        className="w-full border border-border bg-transparent text-muted-foreground text-xs tracking-widest uppercase px-4 py-2 opacity-50 cursor-not-allowed flex items-center justify-center gap-2 rounded-lg mt-4"
      >
        {buttonIcon}
        Download Travel Book
      </button>
    )
  }

  return (
    <div className="mt-4 w-full">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-xs tracking-widest uppercase px-4 py-2 flex items-center justify-center gap-2 rounded-lg disabled:opacity-60 disabled:cursor-wait"
      >
        {isGenerating ? (
          <>
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            Preparing PDF...
          </>
        ) : (
          <>
            {buttonIcon}
            Download Travel Book
          </>
        )}
      </button>
      {error && (
        <p className="text-[11px] text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
