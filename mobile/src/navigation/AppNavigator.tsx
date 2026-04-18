import React from 'react'
import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/auth/LoginScreen'
import SignupScreen from '../screens/auth/SignupScreen'
import OpenScreen from '../screens/maps/OpenScreen'
import AccountScreen from '../screens/AccountScreen'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import { SavedProvider } from '../context/SavedContext'
import MonumentInfoScreen from '../screens/MonumentInfoScreen'
import { ThemeProvider } from '../context/ThemeContext'
import * as Notifications from 'expo-notifications'
import * as Linking from 'expo-linking'

const Stack = createNativeStackNavigator()
const prefix = Linking.createURL('/')


const linking = {
  prefixes: [prefix, 'heritageapp://'],
  config: {
    screens: {
      Opening: {
        path: 'share/route/:shareId',  // heritageapp://share/route/ABC123 → OpenScreen with shareId param
      },
    },
  },
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function AppNavigator() {
  useEffect(() => {
    Notifications.requestPermissionsAsync()
  }, [])

  return (
    <ThemeProvider>
      <SavedProvider>
        {/* CHANGE: pass linking object instead of inline config */}
        <NavigationContainer linking={linking}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Opening" component={OpenScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="MonumentInfo" component={MonumentInfoScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SavedProvider>
    </ThemeProvider>
  )
}