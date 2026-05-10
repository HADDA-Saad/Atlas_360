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
}

export default function PDFDownloadButton({ stops, title, userEmail, tier }: PDFDownloadButtonProps) {
  const generatedDate = new Date().toLocaleDateString('en-GB')
  const filename = `atlas360-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`

  if (tier === 'explorer') {
    return (
      <button 
        disabled
        title="Available for Nomad and Elite — upgrade at /pricing"
        className="w-full border border-white/10 bg-transparent text-[#8B7355] text-xs tracking-widest uppercase px-4 py-2 opacity-50 cursor-not-allowed flex items-center justify-center gap-2 rounded-lg mt-4"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download Itinerary PDF
      </button>
    )
  }

  return (
    <div className="mt-4 w-full">
      <PDFDownloadLink
        document={<ItineraryPDF title={title} stops={stops} userEmail={userEmail} generatedDate={generatedDate} />}
        fileName={filename}
        className="w-full border border-white/10 bg-transparent text-[#8B7355] hover:text-white hover:border-white/30 transition-colors text-xs tracking-widest uppercase px-4 py-2 flex items-center justify-center gap-2 rounded-lg"
      >
        {({ loading }) => (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {loading ? 'Preparing PDF...' : 'Download Itinerary PDF'}
          </>
        )}
      </PDFDownloadLink>
    </div>
  )
}
