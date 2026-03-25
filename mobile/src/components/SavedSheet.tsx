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

const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.70
const DISMISS_THRESHOLD = 80

const SAVED_ITEMS = [
  { id: '1', title: 'Saved Routes' },
  { id: '2', title: 'Past Routes' },
  { id: '3', title: 'Want to Visit' },
]

interface Props {
  visible: boolean
  onClose: () => void
}

export default function SavedSheet({ visible, onClose }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const scrollOffset = useRef(0)
  const [liked, setLiked] = React.useState<string[]>([])

  const toggleLike = (id: string) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

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
    Animated.timing(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      duration: visible ? 300 : 250,
      useNativeDriver: true,
    }).start()
  }, [visible])

  if (!visible) return null

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
          <Text style={styles.title}>Saved List</Text>

          {SAVED_ITEMS.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity style={styles.arrowBtn}>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.imagePlaceholder} />
            </View>
          ))}
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
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 24,  
    paddingBottom: 40,      
    paddingTop: 8,          
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFF3EC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    justifyContent: 'space-between',
    height: 80,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  arrowBtn: {
    backgroundColor: '#574F4F',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: '#FFCFB3',
    marginLeft: 12,
  },
})