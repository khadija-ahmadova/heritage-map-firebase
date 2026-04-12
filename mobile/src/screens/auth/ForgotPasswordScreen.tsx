import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useTheme } from '../../context/ThemeContext'

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { colors } = useTheme()

  const handleReset = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email address.'); return }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Forgot Password</Text>
        <View style={styles.backButton} />
      </View>

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.logoRow}>
          <Ionicons name="star" size={32} color={colors.accent} />
          <View style={[styles.logoDivider, { backgroundColor: colors.accent }]} />
        </View>

        {!sent ? (
          <>
            <Text style={[styles.title, { color: colors.text }]}>Forgot password?</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              No worries! Enter your email and we'll send you reset instructions.
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.subtext} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.subtext}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={handleReset} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.card }]}>
              <Ionicons name="mail-open-outline" size={48} color={colors.accent} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              We sent a password reset link to{' '}
              <Text style={[styles.emailHighlight, { color: colors.accent }]}>{email}</Text>
            </Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReset} disabled={loading}>
              <Text style={[styles.resendText, { color: colors.subtext }]}>
                Didn't receive the email?{' '}
                <Text style={[styles.resendLink, { color: colors.accent }]}>Click to resend</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logoDivider: { flex: 1, height: 2, marginLeft: 10 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 50 },
  subtitle: { fontSize: 14, marginBottom: 52, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 15, marginBottom: 24,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14 },
  button: {
    borderRadius: 10, paddingVertical: 18, alignItems: 'center',
    alignSelf: 'stretch', marginTop: 12, marginBottom: 36,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  successContainer: { alignItems: 'center', paddingTop: 28 },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: 40,
  },
  emailHighlight: { fontWeight: '600' },
  resendText: { fontSize: 14, textAlign: 'center' },
  resendLink: { fontWeight: '600' },
})