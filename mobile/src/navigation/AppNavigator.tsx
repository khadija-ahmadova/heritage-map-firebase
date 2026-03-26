import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/auth/LoginScreen'
import SignupScreen from '../screens/auth/SignupScreen'
import OpenScreen from '../screens/maps/OpenScreen'
import AccountScreen from '../screens/AccountScreen'
import { SavedProvider } from '../context/SavedContext'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <SavedProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Opening" component={OpenScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SavedProvider>
  )
}
