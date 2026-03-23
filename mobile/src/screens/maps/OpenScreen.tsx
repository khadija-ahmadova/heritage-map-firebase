import React, { useState, useRef } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native'
import { Avatar } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'

const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([40.4093, 49.8671], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var currentMarker = null;

    // Listen for messages from React Native
    document.addEventListener('message', function(event) {
      handleMessage(event.data);
    });
    window.addEventListener('message', function(event) {
      handleMessage(event.data);
    });

    function handleMessage(data) {
      try {
        var msg = JSON.parse(data);
        if (msg.type === 'FLY_TO') {
          var lat = msg.lat;
          var lon = msg.lon;
          var label = msg.label;

          // Remove old marker if exists
          if (currentMarker) {
            map.removeLayer(currentMarker);
          }

          // Add new marker and fly to location
          currentMarker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(label)
            .openPopup();

          map.flyTo([lat, lon], 15, { duration: 1.5 });
        }
      } catch(e) {}
    }
  </script>
</body>
</html>
`

export default function OpenScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const webviewRef = useRef<WebView>(null);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'MyDiplomaApp/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];

        // Send coordinates to the Leaflet map inside WebView
        webviewRef.current?.injectJavaScript(`
          handleMessage(JSON.stringify({
            type: 'FLY_TO',
            lat: ${parseFloat(lat)},
            lon: ${parseFloat(lon)},
            label: ${JSON.stringify(display_name)}
          }));
          true;
        `);
      } else {
        setError('Location not found. Try a different search.');
      }
    } catch (e) {
      setError('Search failed. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>

      <WebView
        ref={webviewRef}
        style={styles.map}
        source={{ html: leafletHTML }}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
      />

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
              setSearch(text);
              setError('');
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

      {/* Error message */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="location-outline" color="white" size={24} />
          <Text style={styles.tabText}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Saved')}>
          <Ionicons name="bookmark-outline" color="white" size={24} />
          <Text style={styles.tabText}>Saved</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  }
})