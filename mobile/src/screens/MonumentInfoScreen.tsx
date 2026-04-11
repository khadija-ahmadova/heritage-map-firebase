import React, { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Monument } from '../hooks/useMonuments'

export default function MonumentInfoScreen({ route, navigation }: any) {
  const monument: Monument = route.params.monument
  const [complexity, setComplexity] = useState<'simplified' | 'advanced'>('simplified')

  const simplifiedText = monument.description
    ? monument.description.split(/(?<=[.!?])\s+/).slice(0, 4).join(' ')
    : 'No description available.'

  const advancedText = monument.description ?? 'No description available.'

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#3D2B1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Information</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images row */}
        <View style={styles.imagesRow}>
          <View style={styles.imagePlaceholder} />
          <View style={styles.imagePlaceholder} />
        </View>

        {/* Name */}
        <Text style={styles.title}>{monument.name}</Text>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="location-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Description box */}
        <View style={styles.descriptionBox}>
          {/* Complexity toggle */}
          <View style={styles.toggleRow}>
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

          <Text style={styles.descriptionText}>
            {complexity === 'simplified' ? simplifiedText : advancedText}
          </Text>
        </View>

        {/* Meta info */}
        {(monument.period || monument.architect || monument.location) && (
          <View style={styles.metaBox}>
            {monument.period && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color="#E8A876" />
                <Text style={styles.metaText}>{monument.period}</Text>
              </View>
            )}
            {monument.architect && (
              <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={16} color="#E8A876" />
                <Text style={styles.metaText}>{monument.architect}</Text>
              </View>
            )}
            {monument.location && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color="#E8A876" />
                <Text style={styles.metaText}>{monument.location}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF3EC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#FFF3EC',
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },

  imagesRow: { flexDirection: 'row', gap: 10 },
  imagePlaceholder: {
    flex: 1, height: 130,
    backgroundColor: '#3D2B1F',
    borderRadius: 12,
  },

  title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },

  actionRow: { flexDirection: 'row', gap: 30 },
  actionBtn: {
    width: 46, height: 46,
    backgroundColor: '#E8A876',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  descriptionBox: {
    backgroundColor: '#FFE2D2',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F5C9AD',
    borderRadius: 8,
    padding: 3,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnActive: { backgroundColor: '#E8A876' },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#8B5E3C' },
  toggleTextActive: { color: '#fff' },
  descriptionText: { fontSize: 14, color: '#3D2B1F', lineHeight: 22 },

  metaBox: {
    backgroundColor: '#FFE2D2',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, color: '#3D2B1F', flex: 1 },
})