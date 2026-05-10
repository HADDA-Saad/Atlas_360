'use client'

import dynamic from 'next/dynamic'
import ItineraryPDF, { type ItineraryPDFProps } from './ItineraryPDF'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
)

interface PDFDownloadButtonProps {
  stops: ItineraryPDFProps['stops']
  title: string
  userEmail: string
  tier: string
  coverImageUrl?: string | null
}

export default function PDFDownloadButton({ stops, title, userEmail, tier, coverImageUrl }: PDFDownloadButtonProps) {
  const generatedDate = new Date().toLocaleDateString('en-GB')
  const filename = `atlas360-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`

  if (tier === 'explorer') {
    return (
      <button 
        disabled
        title="Available for Nomad and Elite — upgrade at /pricing"
        className="w-full border border-border bg-transparent text-muted-foreground text-xs tracking-widest uppercase px-4 py-2 opacity-50 cursor-not-allowed flex items-center justify-center gap-2 rounded-lg mt-4"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download Travel Book
      </button>
    )
  }

  return (
    <div className="mt-4 w-full">
      <PDFDownloadLink
        document={<ItineraryPDF title={title} coverImageUrl={coverImageUrl} stops={stops} userEmail={userEmail} generatedDate={generatedDate} />}
        fileName={filename}
        className="w-full border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-xs tracking-widest uppercase px-4 py-2 flex items-center justify-center gap-2 rounded-lg"
      >
        {({ loading }) => (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {loading ? 'Preparing PDF...' : 'Download Travel Book'}
          </>
        )}
      </PDFDownloadLink>
    </div>
  )
}
