import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Monument } from '../hooks/useMonuments'
import type { TravelMode } from '../hooks/useRoute'

interface Props {
  visible: boolean
  initialMonument: Monument | null
  onClose: () => void
  onDone: (routeMonuments: Monument[], mode: TravelMode) => void
  onAddStopMode: (active: boolean) => void
  onModeChange: (mode: TravelMode) => void
  onRouteChange: (monuments: Monument[]) => void
  onSave: (name: string, monuments: Monument[], mode: TravelMode) => void
  isAddingStop: boolean
  routeDistanceKm?: number
  routeDurationMin?: number
  routeLoading?: boolean
}

const MODES: { key: TravelMode; icon: string; label: string }[] = [
  { key: 'foot-walking', icon: 'walk-outline', label: 'Walk' },
  { key: 'driving-car', icon: 'car-outline', label: 'Drive' },
  { key: 'cycling-regular', icon: 'bicycle-outline', label: 'Cycle' },
]

export default function RouteBuilderSheet({
  visible,
  initialMonument,
  onClose,
  onDone,
  onAddStopMode,
  onModeChange,
  onRouteChange,
  onSave,
  isAddingStop,
  routeDistanceKm,
  routeDurationMin,
  routeLoading,
}: Props) {
  const [route, setRoute] = useState<Monument[]>([])
  const [selectedMode, setSelectedMode] = useState<TravelMode>('foot-walking')
  const [saveModalVisible, setSaveModalVisible] = useState(false)
  const [saveName, setSaveName] = useState('')

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        })
        pan.setValue({ x: 0, y: 0 })
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset()
      },
    })
  ).current

  useEffect(() => {
    if (visible && initialMonument) {
      setRoute((prev) => {
        const alreadyIn = prev.find((m) => m.id === initialMonument.id)
        return alreadyIn ? prev : [...prev, initialMonument]
      })
    }
  }, [visible, initialMonument])

  useEffect(() => {
    if (initialMonument && visible) {
      setRoute((prev) => {
        const alreadyIn = prev.find((m) => m.id === initialMonument.id)
        return alreadyIn ? prev : [...prev, initialMonument]
      })
    }
  }, [initialMonument])

  useEffect(() => {
    if (!visible) {
      setRoute([])
      setSaveModalVisible(false)
      setSaveName('')
      pan.setValue({ x: 0, y: 0 })
      pan.setOffset({ x: 0, y: 0 })
    }
  }, [visible])

  const removeStop = (id: string) => {
    setRoute((prev) => {
      const next = prev.filter((m) => m.id !== id)
      onRouteChange(next)
      return next
    })
  }

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    setRoute((prev) => {
      const next = [...prev]
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
      if (toIndex < 0 || toIndex >= next.length) return prev
      ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
      onRouteChange(next)
      return next
    })
  }

  const handleSave = () => {
    if (route.length === 0) return
    setSaveName(route.map((m) => m.name).join(' → '))
    setSaveModalVisible(true)
  }

  const handleConfirmSave = () => {
    const trimmed = saveName.trim()
    if (!trimmed) return
    onSave(trimmed, route, selectedMode)
    setSaveModalVisible(false)
    setSaveName('')
  }

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        ]}
        accessibilityViewIsModal
      >
        {/* Drag handle */}
        <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
          <Text style={styles.dragHint}>hold & drag to move</Text>
        </View>

        {/* Travel mode selector */}
        <View style={styles.modeRow}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeBtn, selectedMode === mode.key && styles.modeBtnActive]}
              onPress={() => {
                setSelectedMode(mode.key)
                onModeChange(mode.key)
              }}
            >
              <Ionicons
                name={mode.icon as any}
                size={18}
                color={selectedMode === mode.key ? '#fff' : '#C0A898'}
              />
              <Text style={[styles.modeLabel, selectedMode === mode.key && styles.modeLabelActive]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}

          {(routeDistanceKm !== undefined || routeLoading) && (
            <View style={styles.infoPill}>
              {routeLoading ? (
                <Text style={styles.infoText}>...</Text>
              ) : (
                <Text style={styles.infoText}>
                  {routeDistanceKm} km · {formatDuration(routeDurationMin ?? 0)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Stop list — scrollable */}
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                      <Ionicons
                        name="chevron-up"
                        size={14}
                        color={index === 0 ? '#C0A898' : '#fff'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveItem(index, 'down')}
                      disabled={index === route.length - 1}
                      style={[
                        styles.reorderBtn,
                        index === route.length - 1 && styles.reorderBtnDisabled,
                      ]}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={14}
                        color={index === route.length - 1 ? '#C0A898' : '#fff'}
                      />
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

        {/* Bottom actions */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addStopBtn, isAddingStop && styles.addStopBtnActive]}
            onPress={() => onAddStopMode(!isAddingStop)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addStopText}>
              {isAddingStop ? 'Cancel' : 'Add Stop'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => onDone(route, selectedMode)}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {isAddingStop && (
          <View style={styles.addStopBanner}>
            <Ionicons name="information-circle-outline" size={16} color="#E8A876" />
            <Text style={styles.addStopBannerText}>
              Tap a marker on the map to add a stop
            </Text>
          </View>
        )}

        {/* Save modal — cross-platform, slides up inside the sheet */}
        {saveModalVisible && (
          <View style={styles.saveModal}>
            <Text style={styles.saveModalTitle}>Save Route</Text>
            <TextInput
              style={styles.saveModalInput}
              value={saveName}
              onChangeText={setSaveName}
              placeholder="Route name..."
              placeholderTextColor="#9A8A80"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleConfirmSave}
            />
            <View style={styles.saveModalButtons}>
              <TouchableOpacity
                style={styles.saveModalCancel}
                onPress={() => setSaveModalVisible(false)}
              >
                <Text style={styles.saveModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveModalConfirm}
                onPress={handleConfirmSave}
              >
                <Text style={styles.saveModalConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 160,
    left: 16,
    width: 380,
    maxHeight: '60%',
    backgroundColor: '#3D3228',
    borderRadius: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
    overflow: 'hidden',
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#5C4F47',
    marginBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#7A6A60',
    borderRadius: 2,
    marginBottom: 4,
  },
  dragHint: { color: '#7A6A60', fontSize: 10 },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#5C4F47',
  },
  modeBtnActive: { backgroundColor: '#E8A876' },
  modeLabel: { color: '#C0A898', fontSize: 12, fontWeight: '600' },
  modeLabelActive: { color: '#fff' },
  infoPill: {
    marginLeft: 'auto',
    backgroundColor: '#5C4F47',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 16 },
  emptyText: {
    color: '#C0A898',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
  stopIndexText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stopName: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  stopActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  reorderBtn: {
    width: 24,
    height: 24,
    backgroundColor: '#5C4F47',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: { backgroundColor: '#3D3228' },
  removeBtn: {
    width: 24,
    height: 24,
    backgroundColor: '#8B4A3A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: '#5C4F47' },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#5C4F47',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#5C4F47',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addStopBtnActive: { backgroundColor: '#8B4A3A' },
  addStopText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  doneBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  doneBtnText: { color: '#4A90D9', fontSize: 16, fontWeight: '600' },
  addStopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  addStopBannerText: { color: '#E8A876', fontSize: 12 },
  saveModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2A2018',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#5C4F47',
  },
  saveModalTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  saveModalInput: {
    backgroundColor: '#5C4F47',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  saveModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  saveModalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveModalCancelText: {
    color: '#C0A898',
    fontSize: 14,
    fontWeight: '600',
  },
  saveModalConfirm: {
    backgroundColor: '#E8A876',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveModalConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
})
