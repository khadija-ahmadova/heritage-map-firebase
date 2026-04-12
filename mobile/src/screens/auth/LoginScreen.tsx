import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useTheme } from '../../context/ThemeContext'

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { colors } = useTheme()

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields.'); return }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigation.navigate('Opening')
    } catch (error: any) {
      Alert.alert('Login Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoRow}>
        <Ionicons name="star" size={32} color="#7B3A10" />
        <View style={styles.logoDivider} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Log in to your account</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Welcome back! Please enter your details.</Text>

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

      <Text style={[styles.label, { color: colors.text }]}>Password</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.subtext} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="••••••••"
          placeholderTextColor={colors.subtext}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.forgotText, { color: colors.text }]}>Forgot password</Text>
      </TouchableOpacity>
      <View style={styles.signupRow}>
        <Text style={[styles.signupText, { color: colors.subtext }]}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 50 },
  logoDivider: { flex: 1, height: 2, backgroundColor: '#6E3606', marginLeft: 10 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 15 },
  subtitle: { fontSize: 14, marginBottom: 50 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 18,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14 },
  button: {
    backgroundColor: '#6E3606', borderRadius: 10, paddingVertical: 15,
    alignItems: 'center', marginTop: 10, marginBottom: 25,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  forgotText: { textAlign: 'center', fontWeight: '600', fontSize: 14, marginBottom: 24 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignSelf: 'center' },
  signupText: { fontSize: 14 },
  signupLink: { color: '#2F88FF', fontWeight: '700', fontSize: 14 },
})