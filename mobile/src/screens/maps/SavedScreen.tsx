import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const SAVED_ITEMS = [
  { id: '1', title: 'Saved Routes' },
  { id: '2', title: 'Past Routes' },
  { id: '3', title: 'Want to Visit' },
]

export default function SavedScreen({ navigation }: any) {
  const [liked, setLiked] = useState<string[]>([])

  const toggleLike = (id: string) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <View style={styles.container}>
      {/* Map preview */}
      <View style={styles.mapPreview} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Saved List</Text>

        {/* Cards */}
        {SAVED_ITEMS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <TouchableOpacity style={styles.arrowBtn}>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Placeholder image */}
            <View style={styles.imagePlaceholder} />

          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF0EC',
  },
  mapPreview: {
    width: '100%',
    height: 140,
    backgroundColor: '#FFCFB3',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
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
    backgroundColor: '#3a3a3a',
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