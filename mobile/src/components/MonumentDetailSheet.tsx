import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Monument } from '../hooks/useMonuments'
import { useSaved } from '../context/SavedContext'

interface Props {
  monument: Monument | null
  onClose: () => void
  onCreateRoute: (monument: Monument) => void
  onGetDirections: (monument: Monument) => void
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.62
const DISMISS_THRESHOLD = 80

export default function MonumentDetailSheet({ monument, onClose, onCreateRoute, onGetDirections }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const scrollOffset = useRef(0)
  const { saveMonument, unsaveMonument, isSaved } = useSaved()

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0 && scrollOffset.current <= 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy)
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(onClose)
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start()
        }
      },
    })
  ).current

  useEffect(() => {
    if (monument) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [monument, translateY])

  if (!monument) return null

  const saved = isSaved(monument.id)

  const handleSaveToggle = () => {
    if (saved) {
      unsaveMonument(monument.id)
    } else {
      saveMonument(monument)
    }
  }

  const detailText = [
    monument.period ? `Period: ${monument.period}` : null,
    monument.architect ? `Architect: ${monument.architect}` : null,
    monument.location ? `Location: ${monument.location}` : null,
    monument.description ? `Description: ${monument.description}` : null,
  ]
    .filter(Boolean)
    .join('\n\n')

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        accessibilityViewIsModal
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View style={styles.dragHandleArea}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView
          bounces={Platform.OS === 'ios'}
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollOffset.current = e.nativeEvent.contentOffset.y
            if (Platform.OS === 'ios' && e.nativeEvent.contentOffset.y < -60) {
              onClose()
            }
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image placeholder */}
          <View style={styles.imagePlaceholder} />

          {/* Title */}
          <Text style={styles.title}>{monument.name}</Text>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <View style={styles.actionButtonWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, saved && styles.actionButtonActive]}
                accessibilityLabel={saved ? 'Unsave monument' : 'Save monument'}
                onPress={handleSaveToggle}
              >
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Save</Text>
            </View>

            <View style={styles.actionButtonWrapper}>
              <TouchableOpacity style={styles.actionButton} accessibilityLabel="Share monument">
                <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Share</Text>
            </View>

            <View style={styles.actionButtonWrapper}>
              <TouchableOpacity
                style={styles.actionButton}
                accessibilityLabel="Get directions to monument"
                onPress={() => onGetDirections(monument)}
              >
                <Ionicons name="navigate-circle-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Direction</Text>
            </View>

            <View style={styles.actionButtonWrapper}>
              <TouchableOpacity
                style={styles.actionButton}
                accessibilityLabel="Create route"
                onPress={() => onCreateRoute(monument)}
              >
                <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Add to Route</Text>
            </View>
          </View>

          {/* Details + description box */}
          <View style={styles.detailsBox}>
            <Text style={styles.detailsText}>{detailText}</Text>
            <TouchableOpacity style={styles.arrowButton} accessibilityLabel="More info">
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#FFF3EC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3D3C3C',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: '#3D2B1F',
    borderRadius: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 25,
    marginBottom: 14,
  },
  actionButtonWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 50,
    height: 50,
    backgroundColor: '#E8A876',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#C97B3E',
  },
  actionLabel: {
    fontSize: 11,
    color: '#3D2B1F',
    fontWeight: '500',
    textAlign: 'center',
  },
  detailsBox: {
    backgroundColor: '#FFE2D2',
    borderRadius: 12,
    padding: 14,
    paddingBottom: 52,
  },
  detailsText: {
    fontSize: 13,
    color: '#3D2B1F',
    lineHeight: 20,
  },
  arrowButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    backgroundColor: '#E8A876',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
})