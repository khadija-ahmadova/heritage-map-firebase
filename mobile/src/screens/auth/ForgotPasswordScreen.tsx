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
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../lib/firebase'

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.')
      return
    }
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
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <Ionicons name="star" size={32} color="#7B3A10" />
        <View style={styles.logoDivider} />
      </View>

      
      {!sent ? (
        <>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we'll send you reset instructions.
          </Text>

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

          <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-open-outline" size={48} color="#6E3606" />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a password reset link to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReset} disabled={loading}>
            <Text style={styles.resendText}>
              Didn't receive the email?{' '}
              <Text style={styles.resendLink}>Click to resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 40,
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
    marginBottom: 50,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 52,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
    button: {
        backgroundColor: '#6E3606',
        borderRadius: 10,
        paddingVertical: 18,
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: 12,
        marginBottom: 36,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 28,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emailHighlight: {
    color: '#6E3606',
    fontWeight: '600',
  },
  resendText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  resendLink: {
    color: '#6E3606',
    fontWeight: '600',
  },

})