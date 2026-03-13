import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { auth } from '../../lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export default function SignupScreen({ navigation }: any) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)


    const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all fields.')
        return
    }
    if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters.')
        return
    }
    if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.')
        return
    }
    setLoading(true)
    try {
        await createUserWithEmailAndPassword(auth, email, password)
        navigation.navigate('Opening')
    } catch (error: any) {
        Alert.alert('Sign up Failed', error.message)
    } finally {
        setLoading(false)
    }
    }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <Ionicons name="star" size={32} color="#7B3A10" />
        <View style={styles.logoDivider} />
      </View>

      {/* Header */}
      <Text style={styles.title}>Create an account</Text>
      <Text style={styles.subtitle}>Welcome back! Please enter your details.</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={18} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color="#999"
          />
        </TouchableOpacity>
      </View>


     {/* Password Verification */}
      <Text style={styles.label}>Password Verification</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* Password hint */}
      <View style={styles.hintRow}>
        <Ionicons name="checkbox" size={18} color="#2F88FF" />
        <Text style={styles.hintText}>Must be at least 8 characters</Text>
      </View>

      {/* Sign up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Already have account */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 80,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
  },
  logoDivider: {
    flex: 1,
    height: 2,
    backgroundColor: '#6E3606',
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 50,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 18,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#2F88FF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hintText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 8,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 80,
  },
  loginText: {
    color: '#888',
    fontSize: 14,
  },
  loginLink: {
    color: '#2F88FF',
    fontWeight: '700',
    fontSize: 14,
  },
})