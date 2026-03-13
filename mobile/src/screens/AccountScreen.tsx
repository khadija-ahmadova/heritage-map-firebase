import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../hooks/useAuth'

const SETTINGS = [
  { id: '1', label: 'Language' },
  { id: '2', label: 'Theme' },
  { id: '3', label: 'Notifications' },
  { id: '4', label: 'Location' },
  { id: '5', label: 'About' },
]

export default function AccountScreen({ navigation }: any) {
  const { user } = useAuth()

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.divider} />

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person-outline" size={48} color="#7B3A10" />
        </View>
        <Text style={styles.username}>
          {user?.displayName || 'Username'}
        </Text>
        <Text style={styles.email}>
          {user?.email || 'user@gmail.com'}
        </Text>
      </View>

      {/* Settings list */}
      <View style={styles.settingsList}>
        {SETTINGS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.settingsItem}>
            <Text style={styles.settingsLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  avatarSection: {
    alignItems: 'center',
    color: '#6E3606',
    paddingVertical: 32,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1EFEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  settingsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  settingsItem: {
    backgroundColor: '#F1EFEE',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
})