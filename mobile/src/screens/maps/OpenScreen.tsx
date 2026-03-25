import React, { useState, useRef } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { Avatar } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons'
import { useMonuments } from '../../hooks/useMonuments'
import type { Monument } from '../../hooks/useMonuments'
import MonumentDetailSheet from '../../components/MonumentDetailSheet'
import SavedSheet from '../../components/SavedSheet'

const BAKU_REGION = {
  latitude: 40.4093,
  longitude: 49.8671,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

export default function OpenScreen({ navigation }: any) {
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selected, setSelected] = useState<Monument | null>(null)
  const [savedOpen, setSavedOpen] = useState(false)

  const mapRef = useRef<MapView>(null)
  const { monuments, loading, error } = useMonuments()

  if (error) {
    Alert.alert('Map error', 'Could not load landmarks. Check your connection and try again.')
  }

  const handleSearch = async () => {
    if (!search.trim()) return

    setIsSearching(true)
    setSearchError('')

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'HeritageMapApp/1.0' } }
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        mapRef.current?.animateToRegion({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        })
      } else {
        setSearchError('Location not found. Try a different search.')
      }
    } catch {
      setSearchError('Search failed. Check your connection.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <View style={styles.container}>

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapType="standard"
        initialRegion={BAKU_REGION}
      >
        {monuments.map((m) => (
          <Marker
            key={m.id}
            coordinate={m.coordinates}
            onPress={() => {
              setSavedOpen(false)
              setSelected(m)
            }}
          />
        ))}
      </MapView>

      {/* Loading spinner while fetching monuments */}
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#6E3606" />
        </View>
      )}

      {/* Search bar + Avatar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Account')}>
          <Avatar
            rounded
            icon={{
              name: 'person',
              type: 'ionicon',
              color: '#FFFFFF',
              size: 26,
            }}
            containerStyle={styles.avatar}
          />
        </TouchableOpacity>

        <View style={styles.searchBarWrapper}>
          <TextInput
            placeholder="Search location..."
            onChangeText={(text) => {
              setSearch(text)
              setSearchError('')
            }}
            value={search}
            style={styles.searchInput}
            placeholderTextColor="#999"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} disabled={isSearching}>
            <Ionicons
              name={isSearching ? 'hourglass-outline' : 'search-outline'}
              size={20}
              color="#6E3606"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search error message */}
      {searchError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : null}

      {/* Bottom navigation panel — hidden when any sheet is open */}
      {!selected && !savedOpen && (
        <View style={styles.bottomPanel}>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="location-outline" color="white" size={24} />
            <Text style={styles.tabText}>Explore</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setSavedOpen(true)}>
            <Ionicons name="bookmark-outline" color="white" size={24} />
            <Text style={styles.tabText}>Saved</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Monument detail sheet */}
      <MonumentDetailSheet monument={selected} onClose={() => setSelected(null)} />

      {/* Saved sheet */}
      <SavedSheet visible={savedOpen} onClose={() => setSavedOpen(false)} />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6E3606',
    marginRight: 8,
    width: 45,
    height: 45,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
    marginRight: 8,
  },
  errorBox: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(220,53,69,0.9)',
    borderRadius: 10,
    padding: 10,
    zIndex: 1,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 13,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: '#6E3606',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    zIndex: 1,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabText: {
    color: 'white',
    fontSize: 12,
  },
})