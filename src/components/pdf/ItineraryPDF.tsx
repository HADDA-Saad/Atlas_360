import React from 'react'
import { Document, Image, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Cormorant',
  src: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86GnM.ttf'
})
Font.register({
  family: 'Outfit',  
  src: 'https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf'
})

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0F0D0A',
    padding: 40,
    flexDirection: 'column',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F0D0A',
    opacity: 0.72,
  },
  coverContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoText: {
    position: 'absolute',
    top: 40,
    left: 40,
    color: '#C1440E',
    fontFamily: 'Cormorant',
    fontSize: 12,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Cormorant',
    fontSize: 42,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 40,
  },
  coverRule: {
    width: 60,
    height: 1,
    backgroundColor: '#C1440E',
    marginBottom: 14,
  },
  coverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  coverMetaBadge: {
    color: '#C1440E',
    fontFamily: 'Outfit',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    border: '1pt solid #C1440E',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  coverMetaText: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  summaryText: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 9,
    textAlign: 'center',
  },
  coverTagline: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 8,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  introGrid: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 20,
  },
  introStat: {
    flex: 1,
    border: '1pt solid #333',
    padding: 14,
    marginRight: 8,
  },
  introStatValue: {
    color: '#FFFFFF',
    fontFamily: 'Cormorant',
    fontSize: 28,
    marginBottom: 4,
  },
  introStatLabel: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  introNote: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 10,
    lineHeight: 1.5,
    marginTop: 10,
  },
  magazineLabel: {
    color: '#C1440E',
    fontFamily: 'Outfit',
    fontSize: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  dayHeaderContainer: {
    marginBottom: 30,
  },
  dayHeader: {
    color: '#FFFFFF',
    fontFamily: 'Cormorant',
    fontSize: 24,
    marginBottom: 8,
  },
  dayHeaderRule: {
    width: 40,
    height: 2,
    backgroundColor: '#C1440E',
  },
  stopBlock: {
    marginBottom: 12,
  },
  stopContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stopCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1814',
    border: '1pt solid #333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  stopNumber: {
    color: '#FFFFFF',
    fontFamily: 'Outfit',
    fontSize: 10,
  },
  stopDetails: {
    flex: 1,
  },
  stopImage: {
    width: '100%',
    height: 80,
    maxHeight: 80,
    objectFit: 'cover',
    marginTop: 6,
    marginBottom: 6,
  },
  stopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stopName: {
    color: '#FFFFFF',
    fontFamily: 'Cormorant',
    fontSize: 16,
    marginRight: 10,
  },
  categoryLabel: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bestTimeBadge: {
    color: '#C1440E',
    fontFamily: 'Outfit',
    fontSize: 7,
    letterSpacing: 1,
    textTransform: 'uppercase',
    border: '1pt solid #C1440E',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  metaText: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 9,
    marginRight: 12,
  },
  descriptionText: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 6,
  },
  tipsText: {
    color: '#C1440E',
    fontFamily: 'Outfit',
    fontSize: 9,
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 11,
    marginBottom: 12,
  },
  transportLine: {
    width: 1,
    height: 20,
    borderLeft: '1pt dashed #8B7355',
    marginRight: 27,
  },
  transportText: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 9,
  },
  footerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  footerTextMain: {
    color: '#FFFFFF',
    fontFamily: 'Cormorant',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  footerUrl: {
    color: '#C1440E',
    fontFamily: 'Outfit',
    fontSize: 12,
    marginBottom: 24,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#333',
    marginBottom: 24,
  },
  footerAbout: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 9,
    lineHeight: 1.6,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 350,
  },
  footerFeatures: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 30,
  },
  footerFeature: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  footerNote: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 9,
  },
})

const PDF_FALLBACK_IMAGES = ['/Images/jame3.png', '/Images/riad.png', '/Images/sea.png', '/Images/spices.png', '/Images/Zellige.png']

function getPdfFallbackImage(index: number) {
  return PDF_FALLBACK_IMAGES[index % PDF_FALLBACK_IMAGES.length]
}

export interface ItineraryPDFProps {
  title: string
  region?: string | null
  durationDays?: number | null
  coverImageUrl?: string | null
  stops: Array<{
    name: string
    description: string
    rich_description?: string | null
    category: string
    day_number: number
    order_index: number
    duration_minutes: number | null
    transport_to_next: string | null
    transport_duration_minutes: number | null
    best_time: string | null
    tips: string | null
    image_url?: string | null
  }>
  userEmail: string
  generatedDate: string
}

export default function ItineraryPDF({ title, region, durationDays, coverImageUrl, stops, userEmail, generatedDate }: ItineraryPDFProps) {
  const daysMap = stops.reduce((acc, stop) => {
    const day = stop.day_number || 1
    if (!acc[day]) acc[day] = []
    acc[day].push(stop)
    return acc
  }, {} as Record<number, typeof stops>)

  Object.keys(daysMap).forEach(d => {
    daysMap[Number(d)].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  })

  const dayNumbers = Object.keys(daysMap).map(Number).sort((a, b) => a - b)
  const totalDays = dayNumbers.length
  const totalStops = stops.length

  const formatDuration = (mins: number | null) => {
    if (!mins) return ''
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    const rem = mins % 60
    return rem === 0 ? `${hrs} hr${hrs > 1 ? 's' : ''}` : `${hrs} hr ${rem} min`
  }

  return (
    <Document>
      {/* ─── Cover Page ─── */}
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {coverImageUrl && <Image src={coverImageUrl} style={styles.coverImage} />}
        {coverImageUrl && <View style={styles.coverShade} />}
        <Text style={styles.logoText}>ATLAS 360</Text>
        <View style={styles.coverContent}>
          <Text style={styles.magazineLabel}>Travel Magazine</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.coverRule} />

          {/* Region + Duration badges */}
          <View style={styles.coverMeta}>
            {region && <Text style={styles.coverMetaBadge}>{region}</Text>}
            {durationDays && (
              <Text style={styles.coverMetaText}>
                {durationDays} {durationDays === 1 ? 'day' : 'days'}
              </Text>
            )}
            <Text style={styles.coverMetaText}>·</Text>
            <Text style={styles.coverMetaText}>{totalStops} stops</Text>
          </View>

          <Text style={styles.summaryText}>
            Generated {generatedDate}
          </Text>
        </View>
        <Text style={styles.coverTagline}>Curated by Atlas 360 · atlas360.ma</Text>
      </Page>

      {/* ─── Overview Page ─── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.dayHeaderContainer}>
          <Text style={styles.magazineLabel}>Journey Overview</Text>
          <Text style={styles.dayHeader}>{title}</Text>
          <View style={styles.dayHeaderRule} />
        </View>
        <View style={styles.introGrid}>
          <View style={styles.introStat}>
            <Text style={styles.introStatValue}>{totalDays}</Text>
            <Text style={styles.introStatLabel}>Days</Text>
          </View>
          <View style={styles.introStat}>
            <Text style={styles.introStatValue}>{totalStops}</Text>
            <Text style={styles.introStatLabel}>Stops</Text>
          </View>
          <View style={styles.introStat}>
            <Text style={styles.introStatValue}>{stops.filter((stop) => stop.image_url).length}</Text>
            <Text style={styles.introStatLabel}>Photos</Text>
          </View>
        </View>
        <Text style={styles.introNote}>
          This travel book gathers the route, stop descriptions, timing notes, transfer cues, and available photography into one offline-friendly reference.
        </Text>
      </Page>

      {/* ─── Day Pages ─── */}
      {dayNumbers.map(dayNum => {
        const dayStops = daysMap[dayNum]
        return (
          <Page key={dayNum} size="A4" style={styles.page} wrap>
            <View style={styles.dayHeaderContainer} fixed>
              <Text style={styles.dayHeader}>DAY {dayNum}</Text>
              <View style={styles.dayHeaderRule} />
            </View>

            {dayStops.map((stop, i) => {
              const isLast = i === dayStops.length - 1
              const stopImage = stop.image_url || getPdfFallbackImage(i)
              // Use rich_description if available, otherwise fall back to description (no truncation)
              const displayDescription = stop.rich_description || stop.description || ''

              return (
                <View key={i} style={styles.stopBlock} minPresenceAhead={60}>
                  <View style={styles.stopContent}>
                    <View style={styles.stopCircle}>
                      <Text style={styles.stopNumber}>{i + 1}</Text>
                    </View>
                    
                    <View style={styles.stopDetails}>
                      <View style={styles.stopNameRow}>
                        <Text style={styles.stopName}>{stop.name}</Text>
                        <Text style={styles.categoryLabel}>{stop.category || 'Location'}</Text>
                        {stop.best_time && (
                          <Text style={styles.bestTimeBadge}>{stop.best_time}</Text>
                        )}
                      </View>
                      
                      <View style={styles.metaRow}>
                        {stop.duration_minutes && <Text style={styles.metaText}>Duration: {formatDuration(stop.duration_minutes)}</Text>}
                      </View>
                      
                      {/* Full description — no truncation */}
                      <Text style={styles.descriptionText}>
                        {displayDescription}
                      </Text>

                      {stopImage && (
                        <View wrap={false}>
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <Image src={stopImage} style={styles.stopImage} />
                        </View>
                      )}
                      
                      {/* Full tips */}
                      {stop.tips && (
                        <Text style={styles.tipsText}>→ Tip: {stop.tips}</Text>
                      )}
                    </View>
                  </View>

                  {!isLast && stop.transport_to_next && (
                    <View style={styles.transportRow}>
                      <View style={styles.transportLine} />
                      <Text style={styles.transportText}>
                        ── {stop.transport_to_next} · {stop.transport_duration_minutes ? formatDuration(stop.transport_duration_minutes) : 'transit'} ──
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
          </Page>
        )
      })}

      {/* ─── Footer Page ─── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.footerContent}>
          <Text style={styles.footerTextMain}>
            Your journey through Morocco starts here
          </Text>
          <Text style={styles.footerUrl}>atlas360.ma</Text>
          
          <View style={styles.footerDivider} />

          <Text style={styles.footerAbout}>
            Atlas 360 is the interactive Morocco itinerary platform for travelers who want curated routes, immersive 360° previews, practical logistics, and local planning confidence before they arrive.
          </Text>

          <View style={styles.footerFeatures}>
            <Text style={styles.footerFeature}>Interactive Maps</Text>
            <Text style={styles.footerFeature}>360° Previews</Text>
            <Text style={styles.footerFeature}>Planning Help</Text>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.footerNote}>
            Generated for {userEmail} on {generatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
