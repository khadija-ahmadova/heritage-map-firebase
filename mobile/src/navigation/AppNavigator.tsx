import React from 'react'
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

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <ThemeProvider>
      <SavedProvider>
        <NavigationContainer>
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
