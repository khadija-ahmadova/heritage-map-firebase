import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useSaved } from '../context/SavedContext'
import type { Monument } from '../hooks/useMonuments'

interface Props {
  onBack: () => void
  onSelectMonument?: (monument: Monument) => void
}

export default function WantToVisitScreen({ onBack, onSelectMonument }: Props) {
  const { wantToVisit } = useSaved()
  const { colors } = useTheme()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Want to Visit</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {wantToVisit.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color="#E8A876" />
            <Text style={[styles.emptyText, { color: colors.text }]}>No saved places yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.subtext }]}>
              Tap the bookmark icon on any monument to save it here
            </Text>
          </View>
        ) : (
          wantToVisit.map((monument, index) => (
            <React.Fragment key={monument.id}>
              <TouchableOpacity style={styles.row} onPress={() => onSelectMonument?.(monument)}>
                <Text style={[styles.locationName, { color: colors.text }]}>{monument.name}</Text>
                <TouchableOpacity style={styles.arrowBtn} onPress={() => onSelectMonument?.(monument)}>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < wantToVisit.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
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
    paddingHorizontal: 20, paddingVertical: 24, minHeight: 90,
  },
  locationName: { fontSize: 16, fontWeight: '600', flex: 1, paddingRight: 12 },
  arrowBtn: {
    width: 36, height: 36, backgroundColor: '#E8A876',
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptySubtext: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
})