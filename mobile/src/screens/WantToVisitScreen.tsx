import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSaved } from '../context/SavedContext'
import type { Monument } from '../hooks/useMonuments'

interface Props {
  onBack: () => void
  onSelectMonument?: (monument: Monument) => void
}

export default function WantToVisitScreen({ onBack, onSelectMonument }: Props) {
  const { wantToVisit } = useSaved()

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Want to Visit</Text>
        {/* Spacer to center title */}
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {wantToVisit.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color="#E8A876" />
            <Text style={styles.emptyText}>No saved places yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the bookmark icon on any monument to save it here
            </Text>
          </View>
        ) : (
          wantToVisit.map((monument, index) => (
            <React.Fragment key={monument.id}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => onSelectMonument?.(monument)}
                accessibilityLabel={`Open ${monument.name}`}
              >
                <Text style={styles.locationName}>{monument.name}</Text>
                <TouchableOpacity
                  style={styles.arrowBtn}
                  onPress={() => onSelectMonument?.(monument)}
                  accessibilityLabel={`Navigate to ${monument.name}`}
                >
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < wantToVisit.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3EC',
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: 90,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    paddingRight: 12,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#E8A876',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0C9BC',
    marginHorizontal: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D2B1F',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8C6E61',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
})
