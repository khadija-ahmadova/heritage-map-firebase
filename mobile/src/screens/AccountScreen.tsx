import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'

export default function AccountScreen({ navigation }: any) {
  const { user } = useAuth()
  const [aboutVisible, setAboutVisible] = useState(false)
  const { isDark, toggleTheme, colors, notifications, setNotifications, location, setLocation } = useTheme()


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Account</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.card }]}>
            <Ionicons name="person-outline" size={48} color={colors.accent} />
          </View>

          <Text style={[styles.email, { color: colors.subtext }]}>
            {user?.email || 'user@gmail.com'}
          </Text>
        </View>

        <View style={styles.settingsList}>

          <View style={[styles.settingsItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingsLeft}>
              <Text style={[styles.settingsLabel, { color: colors.text }]}>Theme</Text>
              <Text style={[styles.settingsSubtitle, { color: colors.subtext }]}>
                {isDark ? 'Dark mode is on' : 'Light mode is on'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ddd', true: colors.accent }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingsItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingsLeft}>
              <Text style={[styles.settingsLabel, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.settingsSubtitle, { color: colors.subtext }]}>
                {notifications ? 'You will receive notifications' : 'Notifications are disabled'}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ddd', true: colors.accent }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingsItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingsLeft}>
              <Text style={[styles.settingsLabel, { color: colors.text }]}>Location</Text>
              <Text style={[styles.settingsSubtitle, { color: colors.subtext }]}>
                {location ? 'Location access is enabled' : 'Location access is disabled'}
              </Text>
            </View>
            <Switch
               value={location}
               onValueChange={setLocation}
              trackColor={{ false: '#ddd', true: colors.accent }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            style={[styles.settingsItem, { backgroundColor: colors.card }]}
            onPress={() => setAboutVisible(true)}
          >
            <Text style={[styles.settingsLabel, { color: colors.text }]}>About</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>

        </View>
      </ScrollView>

      <Modal visible={aboutVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>About</Text>
              <TouchableOpacity onPress={() => setAboutVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />
            <View style={styles.modalBody}>
              <View style={styles.modalIconRow}>
                <Ionicons name="star" size={28} color={colors.accent} />
                <View style={[styles.modalLogoDivider, { backgroundColor: colors.accent }]} />
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>Heritage Maps Baku</Text>
              <Text style={[styles.appDescription, { color: colors.subtext }]}>
                Your go-to app for discovering new places and saving routes. Built with care to help you explore the city around you.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: 30, 
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  divider: { height: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  username: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  email: { fontSize: 14 },
  settingsList: { paddingHorizontal: 20, gap: 10 },
  settingsItem: {
    borderRadius: 12, paddingHorizontal: 18, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  settingsLeft: { flex: 1, marginRight: 12 },
  settingsLabel: { fontSize: 14, fontWeight: '500' },
  settingsSubtitle: { fontSize: 12, marginTop: 3 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end',
  },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 48 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalDivider: { height: 1 },
  modalBody: { paddingHorizontal: 28, paddingTop: 32, alignItems: 'center' },
  modalIconRow: {
    flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24,
  },
  modalLogoDivider: { flex: 1, height: 2, backgroundColor: '#6E3606', marginLeft: 10 },
  appName: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  appDescription: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
})