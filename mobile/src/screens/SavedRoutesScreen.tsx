import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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

const MODE_LABELS: Record<string, string> = {
  'foot-walking': 'Walk',
  'driving-car': 'Drive',
  'cycling-regular': 'Cycle',
}

export default function SavedRoutesScreen({ onBack, onSelectRoute }: Props) {
  const { savedRoutes, removeSavedRoute } = useSaved()

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Remove route', `Remove "${name}" from saved routes?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSavedRoute(id) },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Routes</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {savedRoutes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={48} color="#E8A876" />
            <Text style={styles.emptyText}>No saved routes yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the bookmark icon in the route builder to save a route
            </Text>
          </View>
        ) : (
          savedRoutes.map((route, index) => (
            <React.Fragment key={route.id}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => onSelectRoute?.(route)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <View style={styles.meta}>
                    <Text style={styles.metaText}>
                      {route.monuments.length} stops · {MODE_LABELS[route.mode] ?? route.mode}
                      {route.distanceKm !== undefined
                        ? ` · ${route.distanceKm} km`
                        : ''}
                      {route.durationMin !== undefined
                        ? ` · ${formatDuration(route.durationMin)}`
                        : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(route.id, route.name)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#8B4A3A" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => onSelectRoute?.(route)}
                  >
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              {index < savedRoutes.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF3EC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scrollContent: { paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 80,
  },
  rowLeft: { flex: 1, paddingRight: 12, gap: 6 },
  routeName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  meta: { flexDirection: 'row', flexWrap: 'wrap' },
  metaText: { fontSize: 13, color: '#8C6E61' },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FFE0D6',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#E8A876',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: '#E0C9BC' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#3D2B1F' },
  emptySubtext: {
    fontSize: 14,
    color: '#8C6E61',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
})
