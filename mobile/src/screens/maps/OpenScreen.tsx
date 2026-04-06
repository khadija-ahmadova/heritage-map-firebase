import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
import ExploreSheet from '../../components/ExploreSheet'
import type { StartLocation } from '../../components/RouteBuilderSheet'
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



type SearchSuggestion =
  | { kind: 'monument'; monument: Monument }
  | { kind: 'place'; display_name: string; lat: string; lon: string }



/** Case-insensitive substring match for monument search */
function matchMonuments(query: string, monuments: Monument[]): Monument[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return monuments.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q) ||
      (m.architect ?? '').toLowerCase().includes(q) ||
      (m.period ?? '').toLowerCase().includes(q)
  )
}

/** Geocode a free-text address via Nominatim; returns null on failure */
async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'HeritageMapApp/1.0' } }
    )
    const data = await res.json()
    if (data?.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }
    }
  } catch {}
  return null
}


export default function OpenScreen({ navigation }: any) {
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selected, setSelected] = useState<Monument | null>(null)
  const [savedOpen, setSavedOpen] = useState(false)
  const [routeVisible, setRouteVisible] = useState(false)
  const [routeConfirmed, setRouteConfirmed] = useState(false)
  const [routeStartMonument, setRouteStartMonument] = useState<Monument | null>(null)
  const [isAddingStop, setIsAddingStop] = useState(false)
  const [isPickingStart, setIsPickingStart] = useState(false)
  const [pickedStartMonument, setPickedStartMonument] = useState<Monument | null>(null)
  const [routeMonuments, setRouteMonuments] = useState<Monument[]>([])
  const [travelMode, setTravelMode] = useState<TravelMode>('foot-walking')
  const [confirmedRouteIds, setConfirmedRouteIds] = useState<Set<string>>(new Set())
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [currentStart, setCurrentStart] = useState<StartLocation>({ type: 'gps' })
  const [exploreOpen, setExploreOpen] = useState(false)
  const [filteredMonumentIds, setFilteredMonumentIds] = useState<Set<string> | null>(null)
  // Resolved coords for the address-type start — passed into the sheet so it
  // can show a "located" indicator without doing async work itself
  const [startAddressCoords, setStartAddressCoords] = useState<{ latitude: number; longitude: number } | null>(null)

  const mapRef = useRef<MapView>(null)
  const routeActiveRef = useRef(false)
  useEffect(() => { routeActiveRef.current = routeVisible || routeConfirmed }, [routeVisible, routeConfirmed])
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { monuments, loading, error } = useMonuments()
  const { routeResult, loading: routeLoading, fetchRoute, clearRoute } = useRoute()
  const { saveRoute, pushPastRoute } = useSaved()

  // GPS 

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return
      const loc = await Location.getCurrentPositionAsync({})
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
    })()
  }, [])

  useEffect(() => {
    if (error) {
      Alert.alert('Map error', 'Could not load landmarks. Check your connection and try again.')
    }
  }, [error])

  // Route refresh 

  const resolveStartCoords = useCallback(
    async (start: StartLocation): Promise<{ latitude: number; longitude: number } | null> => {
      if (start.type === 'gps') return userLocation
      if (start.type === 'monument') return start.coordinates ?? null
      if (start.type === 'address') {
        // use pre-resolved coords if available, otherwise geocode now
        if (startAddressCoords) return startAddressCoords
        if (start.address?.trim()) return geocodeAddress(start.address)
      }
      return null
    },
    [userLocation, startAddressCoords]
  )

  const refreshRoute = useCallback(
    async (stops: Monument[], mode: TravelMode, start: StartLocation) => {
      if (!routeActiveRef.current) { clearRoute(); return }
      const startCoords = await resolveStartCoords(start)
      const stopCoords = stops.map((m) => m.coordinates)
      const allCoords = startCoords ? [startCoords, ...stopCoords] : stopCoords
      if (allCoords.length >= 2) fetchRoute(allCoords, mode)
      else clearRoute()
    },
    [resolveStartCoords, fetchRoute, clearRoute]
  )


  useEffect(() => {
    if (routeVisible || routeConfirmed) {
      refreshRoute(routeMonuments, travelMode, currentStart)
    }
  }, [routeMonuments, travelMode, routeVisible, routeConfirmed, userLocation, currentStart, startAddressCoords])
  //Address geocoding (debounced, triggered when start type = address) 

  const handleAddressStartChange = useCallback(
    (address: string) => {
      setStartAddressCoords(null)
      if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current)
      if (!address.trim()) return
      addressDebounceRef.current = setTimeout(async () => {
        const coords = await geocodeAddress(address)
        if (coords) {
          setStartAddressCoords(coords)
          // Pan map to show the typed start location
          mapRef.current?.animateToRegion(
            { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
            600
          )
        }
      }, 700)
    },
    []
  )

  //  Search bar 

  /**
   * As the user types we:
   * 1. Immediately filter monuments from the in-memory list (instant)
   * 2. After a short debounce, hit Nominatim for OSM place suggestions
   */
  const handleSearchChange = (text: string) => {
    setSearch(text)
    setSearchError('')

    if (!text.trim()) {
      setSuggestions([])
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      return
    }

    // 1. Instant monument matches
    const monumentMatches: SearchSuggestion[] = matchMonuments(text, monuments).map((m) => ({
      kind: 'monument',
      monument: m,
    }))
    setSuggestions(monumentMatches)

    // 2. Debounced OSM suggestions
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=4`,
          { headers: { 'User-Agent': 'HeritageMapApp/1.0' } }
        )
        const data: { display_name: string; lat: string; lon: string }[] = await res.json()
        const placeSuggestions: SearchSuggestion[] = (data ?? []).map((d) => ({
          kind: 'place',
          display_name: d.display_name,
          lat: d.lat,
          lon: d.lon,
        }))
        // Keep monument matches at the top, OSM places below
        setSuggestions([...matchMonuments(text, monuments).map((m) => ({ kind: 'monument' as const, monument: m })), ...placeSuggestions])
      } catch {
        // OSM failed — monument results are still shown
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSuggestions([])
    setSearch('')
    if (suggestion.kind === 'monument') {
      // Fly to monument and open detail sheet
      mapRef.current?.animateToRegion(
        {
          ...suggestion.monument.coordinates,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      )
      setSelected(suggestion.monument)
    } else {
      mapRef.current?.animateToRegion(
        {
          latitude: parseFloat(suggestion.lat),
          longitude: parseFloat(suggestion.lon),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      )
    }
  }

  const handleSearchSubmit = () => {
    // If there's a top suggestion, just select it
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0])
      return
    }
    if (!search.trim()) return
    setIsSearching(true)
    setSearchError('')
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'HeritageMapApp/1.0' } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.length > 0) {
          mapRef.current?.animateToRegion(
            {
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            600
          )
          setSuggestions([])
          setSearch('')
        } else {
          setSearchError('Location not found. Try a different search.')
        }
      })
      .catch(() => setSearchError('Search failed. Check your connection.'))
      .finally(() => setIsSearching(false))
  }

  

  const handleCreateRoute = (monument: Monument) => {
    setSelected(null)
    clearRoute()
    setRouteStartMonument(monument)
    setRouteMonuments([monument])
    setConfirmedRouteIds(new Set())
    setRouteConfirmed(false)
    setPickedStartMonument(null)
    setStartAddressCoords(null)
    setCurrentStart({ type: 'gps', coordinates: userLocation ?? undefined })
    setRouteVisible(true)
  }

  const handleMarkerPress = (monument: Monument) => {
    if (isPickingStart) {
      setPickedStartMonument(monument)
      return
    }
    if (isAddingStop) {
      setRouteStartMonument(monument)
      setRouteMonuments((prev) =>
        prev.find((m) => m.id === monument.id) ? prev : [...prev, monument]
      )
      return
    }
    setSuggestions([])
    setSavedOpen(false)
    setSelected(monument)
  }

  const handleExitRoute = () => {
    setRouteConfirmed(false)
    setConfirmedRouteIds(new Set())
    setRouteMonuments([])
    setPickedStartMonument(null)
    setStartAddressCoords(null)
    clearRoute()
  }

  const handleSaveRoute = (name: string, mons: Monument[], mode: TravelMode) => {
    saveRoute({
      name, monuments: mons, mode,
      distanceKm: routeResult?.distanceKm,
      durationMin: routeResult?.durationMin,
    })
    Alert.alert('Saved', `"${name}" has been saved to your routes.`)
  }

  const handleDone = (confirmed: Monument[], mode: TravelMode, start: StartLocation) => {
    pushPastRoute({
      name: confirmed.map((m) => m.name).join(' → '),
      monuments: confirmed, mode,
      distanceKm: routeResult?.distanceKm,
      durationMin: routeResult?.durationMin,
    })
    setRouteVisible(false)
    setIsAddingStop(false)
    setIsPickingStart(false)
    setTravelMode(mode)
    setRouteMonuments(confirmed)
    setConfirmedRouteIds(new Set(confirmed.map((m) => m.id)))
    setCurrentStart(start)
    setRouteConfirmed(true)
    refreshRoute(confirmed, mode, start)
  }

  const handleExploreSelect = (monument: Monument) => {
    setExploreOpen(false)
    setFilteredMonumentIds(null)
    mapRef.current?.animateToRegion(
      { ...monument.coordinates, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      600
    )
    setSelected(monument)
  }

  const handleSelectRoute = (route: SavedRoute) => {
    setSavedOpen(false)
    setTravelMode(route.mode)
    setRouteMonuments(route.monuments)
    setConfirmedRouteIds(new Set(route.monuments.map((m) => m.id)))
    setRouteConfirmed(true)
    const start: StartLocation = { type: 'gps', coordinates: userLocation ?? undefined }
    setCurrentStart(start)
    refreshRoute(route.monuments, route.mode, start)
  }

 
  const showBottomPanel = !selected && !savedOpen && !routeVisible && !routeConfirmed && !exploreOpen
  const showSuggestions = suggestions.length > 0 || isSearching


  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapType="standard"
        initialRegion={BAKU_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => {
          if (showSuggestions) setSuggestions([])
        }}
      >
        {routeResult && routeResult.coordinates.length > 1 && (
          <Polyline
            coordinates={routeResult.coordinates}
            strokeColor={MODE_COLORS[travelMode]}
            strokeWidth={4}
          />
        )}

        {/* Show a distinct marker for a geocoded address start */}
        {startAddressCoords && routeVisible && (
          <Marker
            coordinate={startAddressCoords}
            pinColor="#4A90D9"
            title="Start"
          />
        )}

        {monuments
          .filter((m) => filteredMonumentIds === null || filteredMonumentIds.has(m.id))
          .map((m) => {
            const isRoute =
              pickedStartMonument?.id === m.id ||
              confirmedRouteIds.has(m.id) ||
              !!routeMonuments.find((r) => r.id === m.id)
            return (
              <Marker
                key={`${m.id}-${isRoute}`}
                coordinate={m.coordinates}
                pinColor={isRoute ? '#4A90D9' : undefined}
                onPress={() => handleMarkerPress(m)}
              />
            )
          })}
      </MapView>

      {(loading || routeLoading) && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#6E3606" />
        </View>
      )}

      {/* Search bar */}
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
            placeholder="Search monuments or places..."
            onChangeText={handleSearchChange}
            value={search}
            style={styles.searchInput}
            placeholderTextColor="#999"
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#6E3606" />
          ) : search.length > 0 ? (
            <TouchableOpacity onPress={() => { setSearch(''); setSuggestions([]) }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search-outline" size={20} color="#6E3606" />
          )}
        </View>
      </View>

      {/* Suggestion dropdown */}
      {showSuggestions && (
        <View style={styles.suggestionsBox}>
          <FlatList
            data={suggestions}
            keyExtractor={(_, i) => String(i)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionRow}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Ionicons
                  name={item.kind === 'monument' ? 'business-outline' : 'location-outline'}
                  size={16}
                  color={item.kind === 'monument' ? '#6E3606' : '#888'}
                  style={styles.suggestionIcon}
                />
                <View style={styles.suggestionTextWrap}>
                  <Text style={styles.suggestionPrimary} numberOfLines={1}>
                    {item.kind === 'monument' ? item.monument.name : item.display_name.split(',')[0]}
                  </Text>
                  {item.kind === 'monument' && item.monument.location ? (
                    <Text style={styles.suggestionSecondary} numberOfLines={1}>
                      {[item.monument.architect, item.monument.period, item.monument.location]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  ) : item.kind === 'place' ? (
                    <Text style={styles.suggestionSecondary} numberOfLines={1}>
                      {item.display_name.split(',').slice(1, 3).join(',')}
                    </Text>
                  ) : null}
                </View>
                {item.kind === 'monument' && (
                  <View style={styles.monumentBadge}>
                    <Text style={styles.monumentBadgeText}>Monument</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.suggestionDivider} />}
          />
        </View>
      )}

      {searchError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : null}

      {showBottomPanel && (
        <View style={styles.bottomPanel}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setExploreOpen(true)}>
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

      <MonumentDetailSheet
        monument={selected}
        onClose={() => setSelected(null)}
        onCreateRoute={handleCreateRoute}
        onMoreInfo={(monument) => navigation.navigate('MonumentInfo', { monument })}
      />

      <SavedSheet
        visible={savedOpen}
        onClose={() => setSavedOpen(false)}
        onSelectMonument={(monument) => { setSavedOpen(false); setSelected(monument) }}
        onSelectRoute={handleSelectRoute}
      />

      <RouteBuilderSheet
        visible={routeVisible}
        initialMonument={routeStartMonument}
        userLocation={userLocation}
        startAddressCoords={startAddressCoords}
        onClose={() => {
          setRouteVisible(false)
          setIsAddingStop(false)
          setIsPickingStart(false)
          setRouteMonuments([])
          setConfirmedRouteIds(new Set())
          setRouteConfirmed(false)
          setPickedStartMonument(null)
          setStartAddressCoords(null)
          clearRoute()
        }}
        onDone={handleDone}
        onSave={handleSaveRoute}
        onModeChange={(mode) => setTravelMode(mode)}
        onAddStopMode={(active) => setIsAddingStop(active)}
        onPickStartMonument={(active) => {
          setIsPickingStart(active)
          if (!active) setPickedStartMonument(null)
        }}
        pickedStartMonument={pickedStartMonument}
        onRouteChange={(reordered, start) => {
          setRouteMonuments(reordered)
          setCurrentStart(start)
          // If start type switched to address, kick off geocoding
          if (start.type === 'address') handleAddressStartChange(start.address ?? '')
          else setStartAddressCoords(null)
        }}
        isAddingStop={isAddingStop}
        routeDistanceKm={routeResult?.distanceKm}
        routeDurationMin={routeResult?.durationMin}
        routeLoading={routeLoading}
      />

      <ExploreSheet
        visible={exploreOpen}
        monuments={monuments}
        userLocation={userLocation}
        onClose={() => {
          setExploreOpen(false)
          setFilteredMonumentIds(null)
        }}
        onSelectMonument={handleExploreSelect}
        onFilterChange={setFilteredMonumentIds}
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
    top: 50, left: 10, right: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { backgroundColor: '#6E3606', marginRight: 8, width: 45, height: 45 },
  searchBarWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 25,
    paddingHorizontal: 12, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333', padding: 0, marginRight: 8 },

  // Suggestions dropdown
  suggestionsBox: {
    position: 'absolute',
    top: 108,
    left: 10, right: 10,
    zIndex: 9,
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  suggestionIcon: { marginRight: 10 },
  suggestionTextWrap: { flex: 1 },
  suggestionPrimary: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  suggestionSecondary: { fontSize: 12, color: '#888', marginTop: 1 },
  monumentBadge: {
    backgroundColor: '#FFF0E6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  monumentBadgeText: { fontSize: 10, color: '#6E3606', fontWeight: '700' },
  suggestionDivider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 40 },

  errorBox: {
    position: 'absolute', top: 110, left: 16, right: 16,
    backgroundColor: 'rgba(220,53,69,0.9)',
    borderRadius: 10, padding: 10, zIndex: 1,
  },
  errorText: { color: 'white', textAlign: 'center', fontSize: 13 },
  bottomPanel: {
    position: 'absolute', bottom: 40, left: 16, right: 16,
    backgroundColor: '#6E3606', borderRadius: 30,
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', paddingVertical: 14, zIndex: 1,
  },
  tabItem: { alignItems: 'center', gap: 4 },
  tabText: { color: 'white', fontSize: 12 },
  exitRouteBtn: {
    position: 'absolute', bottom: 40, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#6E3606', borderRadius: 20,
    paddingVertical: 12, zIndex: 1,
  },
  exitRouteBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
})
