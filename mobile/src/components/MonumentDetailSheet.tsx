import React, { useEffect, useRef } from 'react'
import {
  Animated, Dimensions, Image, PanResponder, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import type { Monument } from '../hooks/useMonuments'
import { useSaved } from '../context/SavedContext'
import { Share } from 'react-native'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'


interface Props {
  monument: Monument | null
  onClose: () => void
  onCreateRoute: (monument: Monument) => void
  onMoreInfo: (monument: Monument) => void
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.62
const DISMISS_THRESHOLD = 80

export default function MonumentDetailSheet({ monument, onClose, onCreateRoute, onMoreInfo }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const scrollOffset = useRef(0)
  const { saveMonument, unsaveMonument, isSaved } = useSaved()
  const { colors } = useTheme()

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0 && scrollOffset.current <= 0,
      onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy) },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_THRESHOLD) {
          Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }).start(onClose)
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start()
        }
      },
    })
  ).current

  useEffect(() => {
    if (monument) {
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }).start()
    } else {
      Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }).start()
    }
  }, [monument, translateY])

  if (!monument) return null

  const saved = isSaved(monument.id)

  const handleSaveToggle = () => {
    if (saved) unsaveMonument(monument.id)
    else saveMonument(monument)
  }

  const handleShare = async () => {
    try {
      const ref = await addDoc(collection(db, 'shares_monument'), {
        monumentId: monument.id,
        createdAt: serverTimestamp(),
      })
      await Share.share({
        message: `Check out ${monument.name}:\n${process.env.EXPO_PUBLIC_WEB_URL}/monument/${monument.id}`,
      })
    } catch (e) {
      console.error('Share failed', e)
    }
  }

  const previewText = [
    monument.period ? `Period: ${monument.period}` : null,
    monument.architect ? `Architect: ${monument.architect}` : null,
    monument.location ? `Location: ${monument.location}` : null,
    monument.description
      ? monument.description.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
      : null,
  ].filter(Boolean).join('\n\n')

  const images: string[] = monument.photos ?? []

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY }] }]}
        accessibilityViewIsModal
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandleArea}>
          <View style={[styles.dragHandle, { backgroundColor: colors.subtext }]} />
        </View>

        <ScrollView
          bounces={Platform.OS === 'ios'}
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollOffset.current = e.nativeEvent.contentOffset.y
            if (Platform.OS === 'ios' && e.nativeEvent.contentOffset.y < -60) onClose()
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Photo gallery */}
          {images.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
              contentContainerStyle={styles.imageScrollContent}
            >
              {images.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imagePlaceholder} />
          )}

          <Text style={[styles.title, { color: colors.text }]}>{monument.name}</Text>

          <View style={styles.actionRow}>
            <View style={styles.actionButtonWrapper}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.accentSecondary },
                  saved && styles.actionButtonActive,
                ]}
                onPress={handleSaveToggle}
              >
                <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.actionLabel, { color: colors.subtext }]}>Save</Text>
            </View>

            <View style={styles.actionButtonWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.accentSecondary }]}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.actionLabel, { color: colors.subtext }]}>Share</Text>
            </View>

            <View style={styles.actionButtonWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.accentSecondary }]}
                onPress={() => onCreateRoute(monument)}
              >
                <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.actionLabel, { color: colors.subtext }]}>Add to Route</Text>
            </View>
          </View>

          <View style={[styles.detailsBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.previewText, { color: colors.text }]}>{previewText}</Text>
            <TouchableOpacity
              style={[styles.arrowButton, { backgroundColor: colors.accentSecondary }]}
              onPress={() => onMoreInfo(monument)}
            >
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 12,
  },
  dragHandleArea: { alignItems: 'center', paddingVertical: 12 },
  dragHandle: { width: 40, height: 4, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  imageScroll: { marginBottom: 14 },
  imageScrollContent: { gap: 8 },
  image: { height: 150, width: 220, borderRadius: 12 },
  imagePlaceholder: { height: 150, backgroundColor: '#3D2B1F', borderRadius: 12, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 25, marginBottom: 14 },
  actionButtonWrapper: { alignItems: 'center', gap: 4 },
  actionButton: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionButtonActive: { opacity: 0.8 },
  actionLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  detailsBox: { borderRadius: 12, padding: 14, paddingBottom: 52 },
  previewText: { fontSize: 13, lineHeight: 20 },
  arrowButton: {
    position: 'absolute', bottom: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
})
