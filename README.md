# Heritage Maps

A mobile app and companion web platform for exploring, documenting, and sharing Baku's architectural heritage.

## Overview

Heritage Maps lets users discover historic monuments around Baku, plan routes between them, save landmarks to visit later, and contribute information about architectural sites. The platform is built entirely on Firebase with no custom backend — all logic runs client-side.

## Monorepo Structure

```
heritage-map-firebase-claude/
├── web/        Vite + React 19 + TypeScript + Tailwind CSS v4
└── mobile/     Expo ~54 + React Native 0.81.5 + TypeScript
```

Both projects share the same Firebase project.

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | React 19 + Tailwind CSS v4 → Firebase Hosting |
| Mobile | React Native / Expo ~54 (iOS & Android) |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| Web maps | Leaflet + OpenStreetMap tiles |
| Mobile maps | `react-native-maps` + OSM `UrlTile` |
| Routing | OpenRouteService API (foot / car / cycle) |
| Proximity | `geofire-common` geohash + haversine (client-side) |
| Notifications | `expo-location` + `expo-notifications` (local, no FCM) |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with Authentication, Firestore, and Storage enabled

### Environment Variables

Copy the example files and fill in your Firebase config values from the Firebase Console:

```bash
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env
```

Web uses `VITE_` prefix; mobile uses `EXPO_PUBLIC_` prefix.

### Web

```bash
cd web
npm install
npm run dev          # dev server at http://localhost:5173
npm run build        # production build → web/dist/
npm run lint         # ESLint
npm run preview      # preview the production build
```

### Mobile

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start           # scan QR with Expo Go
npx expo start --ios     # open iOS simulator
npx expo start --android # open Android emulator
npx jest --no-coverage   # run tests
```

## Features

- **Interactive map** — browse monuments on an OpenStreetMap-based map
- **Monument detail** — photos, description, architect, period, and location info
- **Search & filter** — search by name, architect, era, or area
- **Saved landmarks** — bookmark places to visit later (persisted to Firestore)
- **Route builder** — build and save multi-stop routes with turn-by-turn directions
- **Past routes** — view recently completed routes
- **Proximity alerts** — background location notifications when near a landmark
- **Contributions** — researchers can submit information; moderators review and publish
- **Share routes** — shareable links via `nanoid` tokens resolved by Firestore query

## Web Routes

| Path | Page |
|---|---|
| `/` | Landing page |
| `/signin` | Sign in |
| `/register` | Register |
| `/dashboard` | Map dashboard (protected) |
| `/search-by-architect` | Search by architect |
| `/search-by-era` | Search by era |
| `/search-by-area` | Search by area |
| `/monument/:id` | Monument detail |

## Authorization

Three roles stored in `users/{uid}.role`:

- **visitor** — browse and save landmarks
- **researcher** — create monuments (unpublished) and submit contributions
- **moderator** — publish monuments and approve/reject contributions

## Firestore Schema

```
users/{uid}
monuments/{id}
  └── photos/{id}
  └── contributions/{id}
routes/{id}
saved_landmarks/{uid}_{monumentId}
seen_landmarks/{uid}_{monumentId}
```

## Architecture Notes

**No Cloud Functions** — the project runs on the Firebase Spark (free) plan. Proximity queries use `geofire-common` geohash range queries with client-side haversine filtering. Route directions call the OpenRouteService REST API directly from the client.

## Testing

Tests live in `mobile/__tests__/` and use Jest + jest-expo + React Native Testing Library v12.

```bash
cd mobile
npx jest --no-coverage
```

Target coverage: >50%.
