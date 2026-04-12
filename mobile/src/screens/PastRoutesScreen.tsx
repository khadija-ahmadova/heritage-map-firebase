import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useSaved } from '../context/SavedContext'
import type { SavedRoute } from '../context/SavedContext'

interface Props {
  onBack: () => void
  onSelectRoute?: (route: SavedRoute) => void
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const MODE_LABELS: Record<string, string> = {
  'foot-walking': 'Walk', 'driving-car': 'Drive', 'cycling-regular': 'Cycle',
}

export default function PastRoutesScreen({ onBack, onSelectRoute }: Props) {
  const { pastRoutes } = useSaved()
  const { colors } = useTheme()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Past Routes</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {pastRoutes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#E8A876" />
            <Text style={[styles.emptyText, { color: colors.text }]}>No past routes yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.subtext }]}>
              Your last 3 completed routes will appear here
            </Text>
          </View>
        ) : (
          pastRoutes.map((route, index) => (
            <React.Fragment key={route.id}>
              <TouchableOpacity style={styles.row} onPress={() => onSelectRoute?.(route)} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
                    <Text style={[styles.timeAgo, { color: colors.subtext }]}>{timeAgo(route.savedAt)}</Text>
                  </View>
                  <Text style={[styles.metaText, { color: colors.subtext }]}>
                    {route.monuments.length} stops · {MODE_LABELS[route.mode] ?? route.mode}
                    {route.distanceKm !== undefined ? ` · ${route.distanceKm} km` : ''}
                    {route.durationMin !== undefined ? ` · ${formatDuration(route.durationMin)}` : ''}
                  </Text>
                </View>
                <TouchableOpacity style={styles.arrowBtn} onPress={() => onSelectRoute?.(route)}>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < pastRoutes.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 20, minHeight: 80,
  },
  rowLeft: { flex: 1, paddingRight: 12, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeName: { fontSize: 16, fontWeight: '600', flex: 1 },
  timeAgo: { fontSize: 12, marginLeft: 8 },
  metaText: { fontSize: 13 },
  arrowBtn: {
    width: 36, height: 36, backgroundColor: '#E8A876',
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptySubtext: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
})