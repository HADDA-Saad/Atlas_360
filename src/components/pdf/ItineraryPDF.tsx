import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

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
  coverContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  coverRule: {
    width: 60,
    height: 1,
    backgroundColor: '#C1440E',
    marginBottom: 20,
  },
  summaryText: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 9,
    textAlign: 'center',
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
  },
  footerTextMain: {
    color: '#FFFFFF',
    fontFamily: 'Cormorant',
    fontSize: 16,
    marginBottom: 15,
  },
  footerUrl: {
    color: '#C1440E',
    fontFamily: 'Outfit',
    fontSize: 12,
    marginBottom: 30,
  },
  footerNote: {
    color: '#8B7355',
    fontFamily: 'Outfit',
    fontSize: 9,
  }
})

export interface ItineraryPDFProps {
  title: string
  stops: Array<{
    name: string
    description: string
    category: string
    day_number: number
    order_index: number
    duration_minutes: number | null
    transport_to_next: string | null
    transport_duration_minutes: number | null
    best_time: string | null
    tips: string | null
  }>
  userEmail: string
  generatedDate: string
}

export default function ItineraryPDF({ title, stops, userEmail, generatedDate }: ItineraryPDFProps) {
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
      <Page size="A4" style={styles.page}>
        <Text style={styles.logoText}>ATLAS 360</Text>
        <View style={styles.coverContent}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.coverRule} />
          <Text style={styles.summaryText}>
            {totalStops} stops · {totalDays} days · Generated {generatedDate}
          </Text>
        </View>
      </Page>

      {dayNumbers.map(dayNum => {
        const dayStops = daysMap[dayNum]
        return (
          <Page key={dayNum} size="A4" style={styles.page}>
            <View style={styles.dayHeaderContainer}>
              <Text style={styles.dayHeader}>DAY {dayNum}</Text>
              <View style={styles.dayHeaderRule} />
            </View>

            {dayStops.map((stop, i) => {
              const isLast = i === dayStops.length - 1
              return (
                <View key={i} style={styles.stopBlock}>
                  <View style={styles.stopContent}>
                    <View style={styles.stopCircle}>
                      <Text style={styles.stopNumber}>{i + 1}</Text>
                    </View>
                    
                    <View style={styles.stopDetails}>
                      <View style={styles.stopNameRow}>
                        <Text style={styles.stopName}>{stop.name}</Text>
                        <Text style={styles.categoryLabel}>{stop.category || 'Location'}</Text>
                      </View>
                      
                      <View style={styles.metaRow}>
                        {stop.best_time && <Text style={styles.metaText}>Best time: {stop.best_time}</Text>}
                        {stop.duration_minutes && <Text style={styles.metaText}>Duration: {formatDuration(stop.duration_minutes)}</Text>}
                      </View>
                      
                      <Text style={styles.descriptionText}>
                        {stop.description ? (stop.description.length > 180 ? stop.description.substring(0, 180) + '...' : stop.description) : ''}
                      </Text>
                      
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

      <Page size="A4" style={styles.page}>
        <View style={styles.footerContent}>
          <Text style={styles.footerTextMain}>
            Hotels & restaurants near each stop are available in the Atlas 360 app
          </Text>
          <Text style={styles.footerUrl}>atlas360.ma</Text>
          <Text style={styles.footerNote}>
            Generated for {userEmail} on {generatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
