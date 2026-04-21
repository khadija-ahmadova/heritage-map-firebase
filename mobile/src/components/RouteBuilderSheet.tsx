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
import { useTheme } from '../context/ThemeContext'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'



export type StartLocationType = 'gps' | 'address' | 'monument'

export interface StartLocation {
  type: StartLocationType
  address?: string
  monument?: Monument
  coordinates?: { latitude: number; longitude: number }
}

interface Props {
  visible: boolean
  initialMonument: Monument | null
  userLocation: { latitude: number; longitude: number } | null
  /** Resolved coords for an address-type start — supplied by parent after geocoding */
  startAddressCoords: { latitude: number; longitude: number } | null
  onClose: () => void
  onDone: (routeMonuments: Monument[], mode: TravelMode, start: StartLocation) => void
  onAddStopMode: (active: boolean) => void
  onPickStartMonument: (active: boolean) => void
  pickedStartMonument: Monument | null
  onModeChange: (mode: TravelMode) => void
  onRouteChange: (monuments: Monument[], start: StartLocation) => void
  onSave: (name: string, monuments: Monument[], mode: TravelMode) => void
  isAddingStop: boolean
  routeDistanceKm?: number
  routeDurationMin?: number
  routeLoading?: boolean
}



const MODES: { key: TravelMode; icon: string; label: string }[] = [
  { key: 'foot-walking',    icon: 'walk-outline',    label: 'Walk'  },
  { key: 'driving-car',     icon: 'car-outline',     label: 'Drive' },
  { key: 'cycling-regular', icon: 'bicycle-outline', label: 'Cycle' },
]

const START_TYPES: { key: StartLocationType; icon: string; label: string }[] = [
  { key: 'gps',      icon: 'locate-outline', label: 'My Location' },
  { key: 'address',  icon: 'search-outline', label: 'Address'     },
  { key: 'monument', icon: 'flag-outline',   label: 'Monument'    },
]



export default function RouteBuilderSheet({
  visible,
  initialMonument,
  userLocation,
  startAddressCoords,
  onClose,
  onDone,
  onAddStopMode,
  onPickStartMonument,
  pickedStartMonument,
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

  const [startType, setStartType] = useState<StartLocationType>('gps')
  const [addressInput, setAddressInput] = useState('')
  const [isPickingStart, setIsPickingStart] = useState(false)

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value })
        pan.setValue({ x: 0, y: 0 })
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => pan.flattenOffset(),
    })
  ).current

  // Build StartLocation from current UI state 

  const buildStart = (
    type: StartLocationType,
    addr: string,
    picked: Monument | null,
  ): StartLocation => {
    if (type === 'gps')      return { type: 'gps', coordinates: userLocation ?? undefined }
    if (type === 'monument') return { type: 'monument', monument: picked ?? undefined, coordinates: picked?.coordinates }
    return { type: 'address', address: addr }
  }

  //  When parent confirms a picked start monument 

  useEffect(() => {
    if (pickedStartMonument && isPickingStart) {
      setIsPickingStart(false)
      onPickStartMonument(false)
      onRouteChange(route, buildStart('monument', addressInput, pickedStartMonument))
    }
  }, [pickedStartMonument])

  // Start type toggle

  const handleStartTypeChange = (type: StartLocationType) => {
    setStartType(type)
    if (isPickingStart && type !== 'monument') {
      setIsPickingStart(false)
      onPickStartMonument(false)
    }
    onRouteChange(route, buildStart(type, addressInput, pickedStartMonument))
  }

  // Stops lifecycle

  useEffect(() => {
    if (visible && initialMonument) {
      setRoute((prev) =>
        prev.find((m) => m.id === initialMonument.id) ? prev : [...prev, initialMonument]
      )
    }
  }, [visible, initialMonument])

  useEffect(() => {
    if (initialMonument && visible) {
      setRoute((prev) =>
        prev.find((m) => m.id === initialMonument.id) ? prev : [...prev, initialMonument]
      )
    }
  }, [initialMonument])

  useEffect(() => {
    if (!visible) {
      setRoute([])
      setSaveModalVisible(false)
      setSaveName('')
      setStartType('gps')
      setAddressInput('')
      setIsPickingStart(false)
      pan.setValue({ x: 0, y: 0 })
      pan.setOffset({ x: 0, y: 0 })
    }
  }, [visible])

  const removeStop = (id: string) => {
    setRoute((prev) => {
      const next = prev.filter((m) => m.id !== id)
      onRouteChange(next, buildStart(startType, addressInput, pickedStartMonument))
      return next
    })
  }

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    setRoute((prev) => {
      const next = [...prev]
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
      if (toIndex < 0 || toIndex >= next.length) return prev
      ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
      onRouteChange(next, buildStart(startType, addressInput, pickedStartMonument))
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



  const addressResolved = startType === 'address' && !!startAddressCoords
  const addressPending  = startType === 'address' && !!addressInput.trim() && !startAddressCoords
  const { colors } = useTheme()

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.sheet, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
        accessibilityViewIsModal
      >
        {/* Drag handle */}
        <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
          <Text style={styles.dragHint}>hold & drag to move</Text>
        </View>

        {/* Travel mode + info pill */}
        <View style={styles.modeRow}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeBtn, selectedMode === mode.key && { backgroundColor: colors.accentSecondary }]}
              onPress={() => { setSelectedMode(mode.key); onModeChange(mode.key) }}
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
              <Text style={styles.infoText}>
                {routeLoading ? '…' : `${routeDistanceKm} km · ${formatDuration(routeDurationMin ?? 0)}`}
              </Text>
            </View>
          )}
        </View>

        {/* Start Location Block */}
        <View style={styles.startBlock}>
          {/* Header row: pin icon + "Start" label + type toggle pills */}
          <View style={styles.startHeader}>
            <View style={styles.startPin}>
              <Ionicons name="pin" size={13} color="#fff" />
            </View>
            <Text style={styles.startTitle}>Start</Text>
            <View style={styles.startTypeRow}>
              {START_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.startTypeBtn, startType === t.key && styles.startTypeBtnActive]}
                  onPress={() => handleStartTypeChange(t.key)}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={13}
                    color={startType === t.key ? '#fff' : '#C0A898'}
                  />
                  <Text style={[styles.startTypeLabel, startType === t.key && styles.startTypeLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Value row — changes based on type */}
          {startType === 'address' ? (
            <View>
              <TextInput
                style={styles.addressInput}
                placeholder="Type an address…"
                placeholderTextColor="#7A6A60"
                value={addressInput}
                onChangeText={(text) => {
                  setAddressInput(text)
                  onRouteChange(route, buildStart('address', text, pickedStartMonument))
                }}
                returnKeyType="done"
              />
              {/* Geocoding status */}
              {addressInput.trim().length > 0 && (
                <View style={styles.addressStatus}>
                  <Ionicons
                    name={addressResolved ? 'checkmark-circle' : 'hourglass-outline'}
                    size={13}
                    color={addressResolved ? '#3DAE6E' : '#C0A898'}
                  />
                  <Text style={[styles.addressStatusText, addressResolved && styles.addressStatusResolved]}>
                    {addressResolved ? 'Location found — shown on map' : 'Locating…'}
                  </Text>
                </View>
              )}
            </View>
          ) : startType === 'monument' ? (
            <TouchableOpacity
              style={styles.startValueRow}
              onPress={() => {
                const next = !isPickingStart
                setIsPickingStart(next)
                onPickStartMonument(next)
              }}
            >
              <Text style={[styles.startValueText, !pickedStartMonument && styles.startValuePlaceholder]}>
                {pickedStartMonument ? pickedStartMonument.name : 'Tap to pick from map…'}
              </Text>
              <Ionicons
                name={isPickingStart ? 'close-circle-outline' : 'chevron-forward'}
                size={16}
                color="#C0A898"
              />
            </TouchableOpacity>
          ) : (
            /* GPS */
            <View style={styles.startValueRow}>
              <Ionicons
                name="radio-button-on-outline"
                size={14}
                color={userLocation ? '#4A90D9' : '#8B4A3A'}
              />
              <Text style={[styles.startValueText, !userLocation && styles.startValuePlaceholder]}>
                {userLocation ? 'Current location' : 'GPS unavailable'}
              </Text>
            </View>
          )}
        </View>

        {/* Stop list */}
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
                  <View style={[styles.stopIndex, { backgroundColor: colors.accentSecondary }]}>
                    <Text style={styles.stopIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stopName} numberOfLines={1}>{monument.name}</Text>
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
                    <TouchableOpacity onPress={() => removeStop(monument.id)} style={[styles.removeBtn, { backgroundColor: colors.accent}]}>
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

          <TouchableOpacity 
            style={[styles.addStopBtn, isAddingStop && [styles.addStopBtn, { backgroundColor: colors.accent}]]}
            onPress={() => onAddStopMode(!isAddingStop)}
          >
           <Ionicons name={isAddingStop ? "close-circle-outline" : "add-circle-outline"} size={18} color="#fff" />
            <Text style={styles.addStopText}>{isAddingStop ? 'Cancel' : 'Add Stop'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => onDone(route, selectedMode, buildStart(startType, addressInput, pickedStartMonument))}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {isAddingStop && (
          <View style={styles.banner}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accentSecondary} />
              <Text style={[styles.bannerText, { color: colors.accentSecondary }]}>Tap a marker on the map to add a stop</Text>
          </View>
        )}

        {isPickingStart && (
          <View style={[styles.banner, styles.bannerBlue]}>
            <Ionicons name="information-circle-outline" size={16} color="#4A90D9" />
            <Text style={[styles.bannerText, { color: '#4A90D9' }]}>
              Tap a marker on the map to set as start
            </Text>
          </View>
        )}

        {/* Save modal */}
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
              <TouchableOpacity style={styles.saveModalCancel} onPress={() => setSaveModalVisible(false)}>
                <Text style={styles.saveModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveModalConfirm, { backgroundColor: colors.accentSecondary }]} onPress={handleConfirmSave}>
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
    top: 160, left: 16,
    width: 380,
    maxHeight: '65%',
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
    paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#5C4F47',
    marginBottom: 4,
  },
  dragHandle: { width: 36, height: 4, backgroundColor: '#7A6A60', borderRadius: 2, marginBottom: 4 },
  dragHint: { color: '#7A6A60', fontSize: 10 },

  modeRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingHorizontal: 16, marginBottom: 8,
  },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, backgroundColor: '#5C4F47',
  },
  modeLabel: { color: '#C0A898', fontSize: 12, fontWeight: '600' },
  modeLabelActive: { color: '#fff' },
  infoPill: {
    marginLeft: 'auto', backgroundColor: '#5C4F47',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  infoText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Start block
  startBlock: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#2A2018', borderRadius: 12, overflow: 'hidden',
  },
  startHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8,
    flexWrap: 'wrap',
  },
  startPin: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#4A90D9', alignItems: 'center', justifyContent: 'center',
  },
  startTitle: { color: '#fff', fontWeight: '700', fontSize: 13 },
  startTypeRow: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  startTypeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, backgroundColor: '#5C4F47',
  },
  startTypeBtnActive: { backgroundColor: '#4A90D9' },
  startTypeLabel: { color: '#C0A898', fontSize: 11, fontWeight: '600' },
  startTypeLabelActive: { color: '#fff' },

  startValueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#3D3228',
  },
  startValueText: { flex: 1, color: '#fff', fontSize: 13 },
  startValuePlaceholder: { color: '#7A6A60' },

  addressInput: {
    borderTopWidth: 1, borderTopColor: '#3D3228',
    paddingHorizontal: 12, paddingVertical: 10,
    color: '#fff', fontSize: 13,
  },
  addressStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingBottom: 8,
  },
  addressStatusText: { color: '#C0A898', fontSize: 11 },
  addressStatusResolved: { color: '#3DAE6E' },

  // Stops
  list: { paddingHorizontal: 16 },
  emptyText: { color: '#C0A898', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  stopRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  stopIndex: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  stopIndexText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stopName: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  stopActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  reorderBtn: {
    width: 24, height: 24, backgroundColor: '#5C4F47',
    borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  reorderBtnDisabled: { backgroundColor: '#3D3228' },
  removeBtn: {
    width: 24, height: 24,
    borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: '#5C4F47' },

  // Bottom
  bottomRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10, gap: 8,
  },
  iconBtn: {
    width: 38, height: 38, backgroundColor: '#5C4F47',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  addStopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#5C4F47', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  
  addStopText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  doneBtn: { marginLeft: 'auto', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  doneBtnText: { color: '#4A90D9', fontSize: 16, fontWeight: '600' },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  bannerBlue: {},
  bannerText: {fontSize: 12 },

  // Save modal
  saveModal: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#2A2018',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: 20, gap: 12,
    borderTopWidth: 1, borderTopColor: '#5C4F47',
  },
  saveModalTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  saveModalInput: {
    backgroundColor: '#5C4F47', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14,
  },
  saveModalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  saveModalCancel: { paddingHorizontal: 16, paddingVertical: 8 },
  saveModalCancelText: { color: '#C0A898', fontSize: 14, fontWeight: '600' },
  saveModalConfirm: {
    borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  saveModalConfirmText: { color: '#fff', fontSize: 14, fontWeight: '700' },
})
