import React, { useEffect, useRef, useState } from 'react'
import {
  Animated, Dimensions, PanResponder, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import WantToVisitScreen from '../screens/WantToVisitScreen'
import SavedRoutesScreen from '../screens/SavedRoutesScreen'
import PastRoutesScreen from '../screens/PastRoutesScreen'
import type { Monument } from '../hooks/useMonuments'
import type { SavedRoute } from '../context/SavedContext'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.70
const DISMISS_THRESHOLD = 80

const SAVED_ITEMS = [
  { id: '1', title: 'Saved Routes', icon: 'map-outline' },
  { id: '2', title: 'Past Routes', icon: 'time-outline' },
  { id: '3', title: 'Want to Visit', icon: 'bookmark-outline' },
]

type InnerScreen = 'savedRoutes' | 'pastRoutes' | 'wantToVisit' | null

interface Props {
  visible: boolean
  onClose: () => void
  onSelectMonument?: (monument: Monument) => void
  onSelectRoute?: (route: SavedRoute) => void
}

export default function SavedSheet({ visible, onClose, onSelectMonument, onSelectRoute }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const scrollOffset = useRef(0)
  const [innerScreen, setInnerScreen] = useState<InnerScreen>(null)
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
    Animated.timing(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      duration: visible ? 300 : 250,
      useNativeDriver: true,
    }).start()
    if (!visible) setInnerScreen(null)
  }, [visible])

  if (!visible) return null

  const handleCardPress = (id: string) => {
    if (id === '1') setInnerScreen('savedRoutes')
    if (id === '2') setInnerScreen('pastRoutes')
    if (id === '3') setInnerScreen('wantToVisit')
  }

  if (innerScreen === 'wantToVisit') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY }] }]}>
          <WantToVisitScreen
            onBack={() => setInnerScreen(null)}
            onSelectMonument={(monument) => { setInnerScreen(null); onClose(); onSelectMonument?.(monument) }}
          />
        </Animated.View>
      </View>
    )
  }

  if (innerScreen === 'savedRoutes') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY }] }]}>
          <SavedRoutesScreen
            onBack={() => setInnerScreen(null)}
            onSelectRoute={(route) => { setInnerScreen(null); onClose(); onSelectRoute?.(route) }}
          />
        </Animated.View>
      </View>
    )
  }

  if (innerScreen === 'pastRoutes') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY }] }]}>
          <PastRoutesScreen
            onBack={() => setInnerScreen(null)}
            onSelectRoute={(route) => { setInnerScreen(null); onClose(); onSelectRoute?.(route) }}
          />
        </Animated.View>
      </View>
    )
  }

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
          <Text style={[styles.title, { color: colors.text }]}>Saved List</Text>
          {SAVED_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => handleCardPress(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <TouchableOpacity style={[styles.arrowBtn, { backgroundColor: colors.accent }]} onPress={() => handleCardPress(item.id)}>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={[styles.iconCircle, { backgroundColor: colors.border }]}>
                <Ionicons name={item.icon as any} size={32} color={colors.accent}/>
              </View>
            </TouchableOpacity>
          ))}
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
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 12, overflow: 'hidden',
  },
  dragHandleArea: { alignItems: 'center', paddingVertical: 12 },
  dragHandle: { width: 40, height: 4, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 30 },
  card: {
    borderRadius: 16, padding: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { flex: 1, justifyContent: 'space-between', height: 80 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  arrowBtn: {
    backgroundColor: '#574F4F', borderRadius: 20,
    width: 36, height: 36, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start',
  },
  iconCircle: {
    width: 90, height: 90, borderRadius: 30,
    marginLeft: 12, alignItems: 'center', justifyContent: 'center',
  },
})