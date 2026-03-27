import React, { useEffect, useRef, useState } from 'react'
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

interface Props {
  visible: boolean
  initialMonument: Monument | null
  onClose: () => void
  onDone: (routeMonuments: Monument[]) => void
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = 260 
const DISMISS_THRESHOLD = 60

export default function RouteBuilderSheet({ visible, initialMonument, onClose, onDone }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const [route, setRoute] = useState<Monument[]>([])

  // Seed the route with the monument that triggered "Create Route"
  useEffect(() => {
    if (visible && initialMonument) {
      setRoute((prev) => {
        const alreadyIn = prev.find((m) => m.id === initialMonument.id)
        return alreadyIn ? prev : [...prev, initialMonument]
      })
    }
  }, [visible, initialMonument])

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      duration: visible ? 300 : 250,
      useNativeDriver: true,
    }).start()
    if (!visible) setRoute([])
  }, [visible])

  const removeStop = (id: string) => {
    setRoute((prev) => prev.filter((m) => m.id !== id))
  }

  // Drag-to-reorder helpers
  const dragIndex = useRef<number | null>(null)
  const dragY = useRef(new Animated.Value(0)).current

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    setRoute((prev) => {
      const next = [...prev]
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
      if (toIndex < 0 || toIndex >= next.length) return prev
      ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
      return next
    })
  }

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Tap backdrop to close */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        accessibilityViewIsModal
      >
        {/* Drag handle */}
        <View style={styles.dragHandleArea}>
          <View style={styles.dragHandle} />
        </View>

        {/* Stop list */}
        <ScrollView
          style={styles.list}
          scrollEnabled={route.length > 4}
          showsVerticalScrollIndicator={false}
        >
          {route.length === 0 ? (
            <Text style={styles.emptyText}>No stops added yet</Text>
          ) : (
            route.map((monument, index) => (
              <View key={monument.id}>
                <View style={styles.stopRow}>
                  <View style={styles.stopIndex}>
                    <Text style={styles.stopIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stopName} numberOfLines={1}>
                    {monument.name}
                  </Text>
                  <View style={styles.stopActions}>
                    <TouchableOpacity
                      onPress={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                    >
                      <Ionicons name="chevron-up" size={14} color={index === 0 ? '#C0A898' : '#fff'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveItem(index, 'down')}
                      disabled={index === route.length - 1}
                      style={[styles.reorderBtn, index === route.length - 1 && styles.reorderBtnDisabled]}
                    >
                      <Ionicons name="chevron-down" size={14} color={index === route.length - 1 ? '#C0A898' : '#fff'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeStop(monument.id)}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
                {index < route.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          )}
        </ScrollView>

        {/* Bottom actions row */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Save route">
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Share route">
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => onDone(route)}
            accessibilityLabel="Done"
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  sheet: {
    position: 'absolute',
    top: 80, 
    left: 16,
    right: 16,
    backgroundColor: '#3D3228',
    borderRadius: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#7A6A60',
    borderRadius: 2,
  },
  list: {
    maxHeight: 200,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#C0A898',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  stopIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8A876',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIndexText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  stopName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  stopActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  reorderBtn: {
    width: 24,
    height: 24,
    backgroundColor: '#5C4F47',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: {
    backgroundColor: '#3D3228',
  },
  removeBtn: {
    width: 24,
    height: 24,
    backgroundColor: '#8B4A3A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#5C4F47',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#5C4F47',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  doneBtnText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '600',
  },
})
