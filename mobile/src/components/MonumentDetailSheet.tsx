import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Monument } from '../hooks/useMonuments'

interface Props {
  monument: Monument | null
  onClose: () => void
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.62

export default function MonumentDetailSheet({ monument, onClose }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current

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

  const detailText = [
    monument.period ? `Period: ${monument.period}` : null,
    monument.architect ? `Architect: ${monument.architect}` : null,
    monument.location ? `Location: ${monument.location}` : null,
    monument.description || null,
  ]
    .filter(Boolean)
    .join('\n\n')

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        accessibilityViewIsModal
      >
        {/* Drag handle — tap to close */}
        <TouchableOpacity onPress={onClose} style={styles.dragHandleArea} accessibilityLabel="Close">
          <View style={styles.dragHandle} />
        </TouchableOpacity>

        {/* Image placeholder */}
        <View style={styles.imagePlaceholder} />

        {/* Title */}
        <Text style={styles.title}>{monument.name}</Text>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} accessibilityLabel="Save monument">
            <Ionicons name="bookmark-outline" size={22} color="#6E3606" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} accessibilityLabel="Navigate to monument">
            <Ionicons name="navigate-circle-outline" size={22} color="#6E3606" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} accessibilityLabel="Share monument">
            <Ionicons name="share-social-outline" size={22} color="#6E3606" />
          </TouchableOpacity>
        </View>

        {/* Details + description box */}
        <View style={styles.detailsBox}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailsScroll}>
            <Text style={styles.detailsText}>{detailText}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.arrowButton} accessibilityLabel="More info">
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#FEF0E8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
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
    backgroundColor: '#C4A090',
    borderRadius: 2,
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
    gap: 10,
    marginBottom: 14,
  },
  actionButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F5C4A9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBox: {
    flex: 1,
    backgroundColor: '#FDE4D0',
    borderRadius: 12,
    padding: 14,
  },
  detailsScroll: {
    paddingBottom: 44,
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
    backgroundColor: '#6E3606',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
