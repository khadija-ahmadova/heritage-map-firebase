import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { Avatar } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { useMonuments } from '../../hooks/useMonuments'
import type { Monument } from '../../hooks/useMonuments'
import MonumentDetailSheet from '../../components/MonumentDetailSheet'
import SavedSheet from '../../components/SavedSheet'
import RouteBuilderSheet from '../../components/RouteBuilderSheet'
import { useRoute } from '../../hooks/useRoute'
import type { TravelMode } from '../../hooks/useRoute'
import { useSaved } from '../../context/SavedContext'
import type { SavedRoute } from '../../context/SavedContext'

const BAKU_REGION = {
  latitude: 40.4093,
  longitude: 49.8671,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

const MODE_COLORS: Record<TravelMode, string> = {
  'foot-walking': '#4A90D9',
  'driving-car': '#E8341C',
  'cycling-regular': '#3DAE6E',
}

export default function OpenScreen({ navigation }: any) {
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selected, setSelected] = useState<Monument | null>(null)
  const [savedOpen, setSavedOpen] = useState(false)
  const [routeVisible, setRouteVisible] = useState(false)
  const [routeConfirmed, setRouteConfirmed] = useState(false)
  const [routeStartMonument, setRouteStartMonument] = useState<Monument | null>(null)
  const [isAddingStop, setIsAddingStop] = useState(false)
  const [routeMonuments, setRouteMonuments] = useState<Monument[]>([])
  const [travelMode, setTravelMode] = useState<TravelMode>('foot-walking')
  const [confirmedRouteIds, setConfirmedRouteIds] = useState<Set<string>>(new Set())
  const [directionsMonument, setDirectionsMonument] = useState<Monument | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const mapRef = useRef<MapView>(null)
  const { monuments, loading, error } = useMonuments()
  const { routeResult, loading: routeLoading, fetchRoute, clearRoute } = useRoute()
  const { saveRoute, pushPastRoute } = useSaved()

  useEffect(() => {
    if (routeVisible && routeMonuments.length >= 2) {
      fetchRoute(routeMonuments.map((m) => m.coordinates), travelMode)
    } else if (!routeConfirmed) {
      clearRoute()
    }
  }, [routeMonuments, travelMode, routeVisible])

  if (error) {
    Alert.alert('Map error', 'Could not load landmarks. Check your connection and try again.')
  }
  // Request location 
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return
      const loc = await Location.getCurrentPositionAsync({})
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      })
    })()
  }, [])

  useEffect(() => {
    if (routeVisible && routeMonuments.length >= 1 && userLocation) {
      fetchRoute(
        [userLocation, ...routeMonuments.map((m) => m.coordinates)],
        travelMode
      )
    } else if (routeVisible && routeMonuments.length >= 2) {
      // fallback if location permission denied
      fetchRoute(routeMonuments.map((m) => m.coordinates), travelMode)
    } else if (!routeConfirmed) {
      clearRoute()
    }
  }, [routeMonuments, travelMode, routeVisible, userLocation])

  if (error) {
    Alert.alert('Map error', 'Could not load landmarks. Check your connection and try again.')
  }
  const handleGetDirections = async (monument: Monument) => {
    // Clear any active route/confirmed state first
    setRouteConfirmed(false)
    setConfirmedRouteIds(new Set())
    setRouteMonuments([])
    clearRoute()

    setSelected(null)
    setDirectionsMonument(monument)

    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is needed to show directions.')
      setDirectionsMonument(null)
      return
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const userCoord = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }

      fetchRoute([userCoord, monument.coordinates], travelMode)

      mapRef.current?.fitToCoordinates([userCoord, monument.coordinates], {
        edgePadding: { top: 80, right: 40, bottom: 160, left: 40 },
        animated: true,
      })
    } catch {
      Alert.alert('Location error', 'Could not get your current location. Try again.')
      setDirectionsMonument(null)
    }
  }

  const handleExitDirections = () => {
    setDirectionsMonument(null)
    clearRoute()
  }

  const handleCreateRoute = (monument: Monument) => {
    setSelected(null)
    setDirectionsMonument(null)
    clearRoute()
    setRouteStartMonument(monument)
    setRouteMonuments([monument])
    setConfirmedRouteIds(new Set())
    setRouteConfirmed(false)
    setRouteVisible(true)
  }

  const handleMarkerPress = (monument: Monument) => {
    if (isAddingStop) {
      setRouteStartMonument(monument)
      setRouteMonuments((prev) => {
        const alreadyIn = prev.find((m) => m.id === monument.id)
        return alreadyIn ? prev : [...prev, monument]
      })
      return
    }
    setSavedOpen(false)
    setSelected(monument)
  }

  const handleExitRoute = () => {
    setRouteConfirmed(false)
    setConfirmedRouteIds(new Set())
    setRouteMonuments([])
    clearRoute()
  }

  const handleSaveRoute = (name: string, monuments: Monument[], mode: TravelMode) => {
    saveRoute({
      name,
      monuments,
      mode,
      distanceKm: routeResult?.distanceKm,
      durationMin: routeResult?.durationMin,
    })
    Alert.alert('Saved', `"${name}" has been saved to your routes.`)
  }

  const handleDone = (confirmed: Monument[], mode: TravelMode) => {
    const name = confirmed.map((m) => m.name).join(' → ')
    pushPastRoute({ name, monuments: confirmed, mode,
      distanceKm: routeResult?.distanceKm,
      durationMin: routeResult?.durationMin,
    })
    setRouteVisible(false)
    setIsAddingStop(false)
    setTravelMode(mode)
    setRouteMonuments(confirmed)
    setConfirmedRouteIds(new Set(confirmed.map((m) => m.id)))
    setRouteConfirmed(true)

    // re-fetch with user location so the confirmed polyline also starts from user
    if (userLocation) {
      fetchRoute(
        [userLocation, ...confirmed.map((m) => m.coordinates)],
        mode
      )
    }
  }

  const handleSelectRoute = (route: SavedRoute) => {
  setSavedOpen(false)
  setTravelMode(route.mode)
  setRouteMonuments(route.monuments)
  setConfirmedRouteIds(new Set(route.monuments.map((m) => m.id)))
  setRouteConfirmed(true)
  const coords = userLocation
    ? [userLocation, ...route.monuments.map((m) => m.coordinates)]
    : route.monuments.map((m) => m.coordinates)
  fetchRoute(coords, route.mode)
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

  const isDirectionsActive = !!directionsMonument
  const showBottomPanel = !selected && !savedOpen && !routeVisible && !routeConfirmed && !isDirectionsActive

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapType="standard"
        initialRegion={BAKU_REGION}
        showsUserLocation={true}         
        showsMyLocationButton={false}   
      >
        {routeResult && routeResult.coordinates.length > 1 && (
          <Polyline
            coordinates={routeResult.coordinates}
            strokeColor={isDirectionsActive ? '#4A90D9' : MODE_COLORS[travelMode]}
            strokeWidth={4}
          />
        )}

        {monuments.map((m) => (
          <Marker
            key={m.id}
            coordinate={m.coordinates}
            pinColor={
              directionsMonument?.id === m.id
                ? '#4A90D9'
                : confirmedRouteIds.has(m.id)
                ? '#4A90D9'
                : routeMonuments.find((r) => r.id === m.id)
                ? '#4A90D9'
                : undefined
            }
            onPress={() => handleMarkerPress(m)}
          />
        ))}
      </MapView>

      {(loading || routeLoading) && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#6E3606" />
        </View>
      )}

      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Account')}>
          <Avatar
            rounded
            icon={{ name: 'person', type: 'ionicon', color: '#FFFFFF', size: 26 }}
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

      {searchError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : null}

      {showBottomPanel && (
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

      {routeConfirmed && (
        <TouchableOpacity style={styles.exitRouteBtn} onPress={handleExitRoute}>
          <Ionicons name="close" size={18} color="#fff" />
          <Text style={styles.exitRouteBtnText}>Exit Route</Text>
        </TouchableOpacity>
      )}

      {isDirectionsActive && (
        <TouchableOpacity style={styles.exitRouteBtn} onPress={handleExitDirections}>
          <Ionicons name="close" size={18} color="#fff" />
          <Text style={styles.exitRouteBtnText}>
            Exit Directions — {directionsMonument!.name}
          </Text>
        </TouchableOpacity>
      )}

      <MonumentDetailSheet
        monument={selected}
        onClose={() => setSelected(null)}
        onCreateRoute={handleCreateRoute}
        onGetDirections={handleGetDirections}
      />

      <SavedSheet
        visible={savedOpen}
        onClose={() => setSavedOpen(false)}
        onSelectMonument={(monument) => {
          setSavedOpen(false)
          setSelected(monument)
        }}
        onSelectRoute={handleSelectRoute}
      />

      <RouteBuilderSheet
        visible={routeVisible}
        initialMonument={routeStartMonument}
        onClose={() => {
          setRouteVisible(false)
          setIsAddingStop(false)
          setRouteMonuments([])
          setConfirmedRouteIds(new Set())
          setRouteConfirmed(false)
          clearRoute()
        }}
        onDone={handleDone}
        onSave={handleSaveRoute}
        onModeChange={(mode) => setTravelMode(mode)}
        onAddStopMode={(active) => setIsAddingStop(active)}
        onRouteChange={(reordered) => setRouteMonuments(reordered)}
        isAddingStop={isAddingStop}
        routeDistanceKm={routeResult?.distanceKm}
        routeDurationMin={routeResult?.durationMin}
        routeLoading={routeLoading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  errorText: { color: 'white', textAlign: 'center', fontSize: 13 },
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
  tabItem: { alignItems: 'center', gap: 4 },
  tabText: { color: 'white', fontSize: 12 },
  exitRouteBtn: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#6E3606',
    borderRadius: 20,
    paddingVertical: 12,
    zIndex: 1,
  },
  exitRouteBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
})