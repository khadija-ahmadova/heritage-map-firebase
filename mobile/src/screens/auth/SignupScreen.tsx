import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { auth, db } from '../../lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useTheme } from '../../context/ThemeContext'

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { colors } = useTheme()

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) { Alert.alert('Error', 'Please fill in all fields.'); return }
    if (password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters.'); return }
    if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match.'); return }
    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', credential.user.uid), {
        user_name: email.split('@')[0],
        email: credential.user.email ?? email,
        role: 'visitor',
        created_at: serverTimestamp(),
      })
      navigation.navigate('Opening')
    } catch (error: any) {
      Alert.alert('Sign up Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoRow}>
        <Ionicons name="star" size={32} color="#7B3A10" />
        <View style={styles.logoDivider} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Create an account</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Welcome back! Please enter your details.</Text>

      <Text style={[styles.label, { color: colors.text }]}>Email</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="mail-outline" size={18} color={colors.subtext} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Enter your email"
          placeholderTextColor={colors.subtext}
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
        />
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Password</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.subtext} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="••••••••" placeholderTextColor={colors.subtext}
          value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Password Verification</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.subtext} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="••••••••" placeholderTextColor={colors.subtext}
          value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      <View style={styles.hintRow}>
        <Ionicons name="checkbox" size={18} color="#2F88FF" />
        <Text style={[styles.hintText, { color: colors.subtext }]}>Must be at least 8 characters</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <Text style={[styles.loginText, { color: colors.subtext }]}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 80 },
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
    backgroundColor: '#2F88FF', borderRadius: 10, paddingVertical: 15,
    alignItems: 'center', marginTop: 4, marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hintRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  hintText: { fontSize: 13, marginLeft: 8 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 80 },
  loginText: { fontSize: 14 },
  loginLink: { color: '#2F88FF', fontWeight: '700', fontSize: 14 },
})