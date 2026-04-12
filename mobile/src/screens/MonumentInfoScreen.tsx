import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import type { Monument } from '../hooks/useMonuments'

export default function MonumentInfoScreen({ route, navigation }: any) {
  const monument: Monument = route.params.monument
  const [complexity, setComplexity] = useState<'simplified' | 'advanced'>('simplified')
  const { colors } = useTheme()

  const simplifiedText = monument.simplified_desc ?? 'No description available.'
  const advancedText = monument.description ?? 'No description available.'

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Information</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imagesRow}>
          <View style={styles.imagePlaceholder} />
          <View style={styles.imagePlaceholder} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{monument.name}</Text>

        {(monument.period || monument.architect || monument.location) && (
          <View style={[styles.metaBox, { backgroundColor: colors.card }]}>
            {monument.period && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color="#E8A876" />
                <Text style={[styles.metaText, { color: colors.text }]}>{monument.period}</Text>
              </View>
            )}
            {monument.architect && (
              <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={16} color="#E8A876" />
                <Text style={[styles.metaText, { color: colors.text }]}>{monument.architect}</Text>
              </View>
            )}
            {monument.location && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color="#E8A876" />
                <Text style={[styles.metaText, { color: colors.text }]}>{monument.location}</Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.descriptionBox, { backgroundColor: colors.card }]}>
          <View style={[styles.toggleRow, { backgroundColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, complexity === 'simplified' && styles.toggleBtnActive]}
              onPress={() => setComplexity('simplified')}
            >
              <Text style={[styles.toggleText, complexity === 'simplified' && styles.toggleTextActive]}>
                Simplified
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, complexity === 'advanced' && styles.toggleBtnActive]}
              onPress={() => setComplexity('advanced')}
            >
              <Text style={[styles.toggleText, complexity === 'advanced' && styles.toggleTextActive]}>
                Advanced
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {complexity === 'simplified' ? simplifiedText : advancedText}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  imagesRow: { flexDirection: 'row', gap: 10 },
  imagePlaceholder: { flex: 1, height: 130, backgroundColor: '#3D2B1F', borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  metaBox: { borderRadius: 14, padding: 14, gap: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, flex: 1 },
  descriptionBox: { borderRadius: 14, padding: 14, gap: 12 },
  toggleRow: { flexDirection: 'row', borderRadius: 8, padding: 3, alignSelf: 'flex-start' },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#E8A876' },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#8B5E3C' },
  toggleTextActive: { color: '#fff' },
  descriptionText: { fontSize: 14, lineHeight: 22 },
})