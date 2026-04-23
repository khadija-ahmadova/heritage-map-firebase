/** @type {import('expo/config').ExpoConfig} */
export default {
  name: 'Heritage Maps',
  slug: 'heritage-maps',
  scheme: 'heritagemaps',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.heritagemaps.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.heritagemaps.app',
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
      },
    },
  },
  web: {
    favicon: './assets/icon.png',
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
  "extra": {
      "eas": {
        "projectId": "b0df3700-6487-467c-b432-1c1d5fad8484",
      },
    },
}