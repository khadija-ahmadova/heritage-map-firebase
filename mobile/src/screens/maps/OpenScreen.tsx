import React, { useState } from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { SearchBar, Avatar } from 'react-native-elements'
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
  </script>
</body>
</html>
`

export default function OpenScreen({ navigation }: any) {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>

      {/* Leaflet map in WebView fills entire background */}
      <WebView
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
        <SearchBar
          placeholder="Search location..."
          onChangeText={(text) => setSearch(text)}
          value={search}
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInput}
          round
          platform="default"
        />
      </View>

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
  searchBarContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchBarInput: {
    backgroundColor: 'white',
    borderRadius: 10,
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