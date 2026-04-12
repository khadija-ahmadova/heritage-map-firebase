import React from 'react'
import {
  Animated, Dimensions, PanResponder, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { distanceBetween } from 'geofire-common'
import { useTheme } from '../context/ThemeContext'
import type { Monument } from '../hooks/useMonuments'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.88
const FULL = 0
const PEEK = SHEET_HEIGHT * 0.50
const CLOSED = SHEET_HEIGHT

interface Props {
  visible: boolean
  monuments: Monument[]
  userLocation: { latitude: number; longitude: number } | null
  onClose: () => void
  onSelectMonument: (m: Monument) => void
  onFilterChange: (ids: Set<string> | null) => void
}

function DistanceSlider({ value, max, onChange, accent }: {
  value: number; max: number; onChange: (v: number) => void; accent: string
}) {
  const trackWidth = React.useRef(0)
  const pan = React.useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidth.current))
      onChange(Math.round(pct * max * 10) / 10)
    },
    onPanResponderMove: (e) => {
      const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidth.current))
      onChange(Math.round(pct * max * 10) / 10)
    },
  })).current
  const fillPct = value / max
  return (
    <View
      style={[styles.sliderTrack, { backgroundColor: accent }]}
      onLayout={e => { trackWidth.current = e.nativeEvent.layout.width }}
      {...pan.panHandlers}
    >
      <View style={[styles.sliderFill, { width: `${fillPct * 100}%` as any, backgroundColor: accent }]} />
      <View style={[styles.sliderThumb, { left: (fillPct * 100) + '%' as any, marginLeft: -10 }]} />
    </View>
  )
}

function FilterChip({ label, active, onPress, accent }: {
  label: string; active: boolean; onPress: () => void; accent: string
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: accent }, active && { backgroundColor: accent, opacity: 0.75 }]}
      onPress={onPress}
    >
      <Text style={styles.chipText} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  )
}

function MonumentResultCard({ monument, userLocation, onPress, colors }: {
  monument: Monument
  userLocation: { latitude: number; longitude: number } | null
  onPress: () => void
  colors: any
}) {
  const dist = userLocation
    ? distanceBetween(
        [userLocation.latitude, userLocation.longitude],
        [monument.coordinates.latitude, monument.coordinates.longitude]
      )
    : null

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardContent}>
        <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{monument.name}</Text>
        <Text style={[styles.cardMeta, { color: colors.subtext }]} numberOfLines={1}>
          {[monument.architect, monument.period].filter(Boolean).join(' · ')}
        </Text>
        {monument.location ? (
          <Text style={[styles.cardLocation, { color: colors.subtext }]} numberOfLines={1}>{monument.location}</Text>
        ) : null}
      </View>
      {dist !== null && (
        <View style={[styles.distBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.distBadgeText}>{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
    </TouchableOpacity>
  )
}

export default function ExploreSheet({ visible, monuments, userLocation, onClose, onSelectMonument, onFilterChange }: Props) {
  const { colors } = useTheme()
  const [selectedArchitects, setSelectedArchitects] = React.useState<Set<string>>(new Set())
  const [selectedPeriods, setSelectedPeriods] = React.useState<Set<string>>(new Set())
  const [distanceEnabled, setDistanceEnabled] = React.useState(false)
  const [distanceKm, setDistanceKm] = React.useState(2.0)

  const translateY = React.useRef(new Animated.Value(CLOSED)).current
  const snapRef = React.useRef<'peek' | 'full'>('peek')

  const architects = React.useMemo(() => {
    const set = new Set<string>()
    monuments.forEach(m => { if (m.architect?.trim()) set.add(m.architect.trim()) })
    return Array.from(set).sort()
  }, [monuments])

  const periods = React.useMemo(() => {
    const set = new Set<string>()
    monuments.forEach(m => { if (m.period?.trim()) set.add(m.period.trim()) })
    return Array.from(set).sort()
  }, [monuments])

  const filtered = React.useMemo(() => {
    return monuments.filter(m => {
      if (selectedArchitects.size > 0 && !selectedArchitects.has(m.architect?.trim() ?? '')) return false
      if (selectedPeriods.size > 0 && !selectedPeriods.has(m.period?.trim() ?? '')) return false
      if (distanceEnabled && userLocation) {
        const dist = distanceBetween(
          [userLocation.latitude, userLocation.longitude],
          [m.coordinates.latitude, m.coordinates.longitude]
        )
        if (dist > distanceKm) return false
      }
      return true
    })
  }, [monuments, selectedArchitects, selectedPeriods, distanceEnabled, distanceKm, userLocation])

  const anyActive = selectedArchitects.size > 0 || selectedPeriods.size > 0 || distanceEnabled

  React.useEffect(() => {
    onFilterChange(anyActive ? new Set(filtered.map(m => m.id)) : null)
  }, [filtered, anyActive])

  React.useEffect(() => {
    if (visible) {
      snapRef.current = 'peek'
      Animated.timing(translateY, { toValue: PEEK, duration: 300, useNativeDriver: true }).start()
    } else {
      Animated.timing(translateY, { toValue: CLOSED, duration: 300, useNativeDriver: true }).start()
    }
  }, [visible])

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_e, g) => {
        const base = snapRef.current === 'peek' ? PEEK : FULL
        translateY.setValue(Math.max(FULL, base + g.dy))
      },
      onPanResponderRelease: (_e, g) => {
        const base = snapRef.current === 'peek' ? PEEK : FULL
        const currentPos = base + g.dy
        if (g.vy > 0.5 || currentPos > PEEK + 40) {
          snapRef.current = 'peek'
          Animated.timing(translateY, { toValue: CLOSED, duration: 300, useNativeDriver: true }).start(() => onClose())
        } else if (g.vy < -0.3 || currentPos < (PEEK + FULL) / 2) {
          snapRef.current = 'full'
          Animated.spring(translateY, { toValue: FULL, useNativeDriver: true }).start()
        } else {
          Animated.spring(translateY, { toValue: snapRef.current === 'peek' ? PEEK : FULL, useNativeDriver: true }).start()
        }
      },
    })
  ).current

  const toggleArchitect = (a: string) => {
    setSelectedArchitects(prev => { const next = new Set(prev); next.has(a) ? next.delete(a) : next.add(a); return next })
  }
  const togglePeriod = (p: string) => {
    setSelectedPeriods(prev => { const next = new Set(prev); next.has(p) ? next.delete(p) : next.add(p); return next })
  }
  const clearAll = () => {
    setSelectedArchitects(new Set())
    setSelectedPeriods(new Set())
    setDistanceEnabled(false)
    setDistanceKm(2.0)
  }

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY }] }]}>

        <View style={[styles.handleArea, { borderBottomColor: colors.border }]}>
          <View style={styles.handleBarHitArea} {...panResponder.panHandlers}>
            <View style={[styles.handleBar, { backgroundColor: colors.subtext }]} />
          </View>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
            <View style={[styles.countChip, { backgroundColor: colors.accent }]}>
              <Text style={styles.countText}>{filtered.length} monuments</Text>
            </View>
            {anyActive && (
              <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
                <Text style={[styles.clearText, { color: colors.accent }]}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Range</Text>
              <TouchableOpacity
                style={[styles.toggle, { backgroundColor: colors.accent }]}
                onPress={() => setDistanceEnabled(v => !v)}
              >
                <Text style={styles.toggleText}>{distanceEnabled ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
            </View>
            {distanceEnabled && (
              <View style={styles.sliderRow}>
                <DistanceSlider value={distanceKm} max={10} onChange={setDistanceKm} accent={colors.accent} />
                <Text style={[styles.distanceLabel, { color: colors.text }]}>{distanceKm.toFixed(1)} km</Text>
              </View>
            )}
            {distanceEnabled && !userLocation && (
              <Text style={[styles.noGpsWarning, { color: colors.text }]}>GPS unavailable</Text>
            )}
          </View>

          {architects.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Architect</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {architects.map(a => (
                  <FilterChip key={a} label={a} active={selectedArchitects.has(a)} onPress={() => toggleArchitect(a)} accent={colors.accent} />
                ))}
              </ScrollView>
            </View>
          )}

          {periods.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Period</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {periods.map(p => (
                  <FilterChip key={p} label={p} active={selectedPeriods.has(p)} onPress={() => togglePeriod(p)} accent={colors.accent} />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {filtered.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No monuments match the current filters</Text>
          ) : (
            filtered.map(m => (
              <MonumentResultCard key={m.id} monument={m} userLocation={userLocation} onPress={() => onSelectMonument(m)} colors={colors} />
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 16,
  },
  handleArea: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1 },
  handleBarHitArea: { alignItems: 'center', paddingVertical: 8 },
  handleBar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  countChip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  countText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  clearBtn: { marginLeft: 'auto' },
  clearText: { fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', flex: 1 },
  toggle: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  toggleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  sliderTrack: { flex: 1, height: 28, borderRadius: 14, justifyContent: 'center', overflow: 'visible' },
  sliderFill: { height: 28, borderRadius: 14 },
  sliderThumb: {
    position: 'absolute', width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#fff', top: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
  },
  distanceLabel: { fontSize: 13, fontWeight: '600', width: 48, textAlign: 'right' },
  noGpsWarning: { fontSize: 12, marginTop: 4 },
  chipScroll: { marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8 },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 16, marginVertical: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingTop: 24 },
  card: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  cardContent: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  cardMeta: { fontSize: 12 },
  cardLocation: { fontSize: 11, marginTop: 2 },
  distBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  distBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
})