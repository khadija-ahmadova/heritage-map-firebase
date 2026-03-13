import React, { useState } from 'react'
import { View, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native'
import { SearchBar, Avatar } from 'react-native-elements'
import MapView, { UrlTile } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'

export default function OpenScreen({ navigation }: any) {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>

      {/* Map fills the entire background */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 40.4093,
          longitude: 49.8671,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
      </MapView>

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

        <TouchableOpacity style = {styles.tabItem} onPress={() => navigation.navigate('Saved')}>
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
    ...StyleSheet.absoluteFillObject,  // fills entire screen behind everything
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