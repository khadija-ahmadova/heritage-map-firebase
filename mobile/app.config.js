/** @type {import('expo/config').ExpoConfig} */
export default {
  name: 'Heritage Maps',
  slug: 'heritage-maps',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Heritage Maps to use your location to find nearby landmarks and notify you as you walk past them.',
      },
    ],
    ['expo-notifications', {}],
  ],
}
