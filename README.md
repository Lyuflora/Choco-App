# Dark Diary

Dark Diary is a local-first chocolate tracking MVP built with React Native, Expo Router, and TypeScript. It is designed for simple daily logging, monthly insight, and a warm premium UI focused on chocolate habits.

## Setup

Install dependencies and run the app:

```bash
npm install
npm run start
```

This project uses Expo-aligned native package versions. If you add or update Expo-native dependencies, prefer `npx expo install <package>` over a plain `npm install` so Expo Go and device builds stay compatible.

For web:

```bash
npm run web
```

For a browser-safe local web build that does not try to auto-open DevTools:

```bash
npm run web:headless
```

For tests:

```bash
npm run test
```

## Mobile Device Testing

For the fastest physical-device test loop, use Expo Go:

```bash
npm run start:lan
```

- Use `npm run start:lan` when your computer and phone are on the same Wi-Fi network.
- Use `npm run start:tunnel` if LAN discovery is blocked by your network or VPN.
- Use `npm run start:tunnel:clear` if Expo Go is stuck on the loading screen and you need a fresh tunnel session.
- Install Expo Go on each Android or iPhone test device and scan the QR code from the terminal.

If you want installable builds for testers instead of Expo Go sessions:

```bash
npm run eas:configure
npm run eas:build:device:android
npm run eas:build:device:ios
```

- `eas:build:device:android` creates an internal-distribution Android APK.
- `eas:build:device:ios` creates an internal-distribution iOS build for registered test devices.
- `eas:build:development:ios` now targets a physical iPhone or iPad, while `eas:build:simulator:ios` keeps the simulator-only path separate.
- iOS internal testing still requires your Apple Developer account and device registration during the EAS flow.

## Architecture

The app is split into a small number of beginner-friendly layers:

- `app/`
  - Expo Router screens and layouts
  - Bottom tabs: Today, Calendar, Insights, Library, Settings
  - Library detail routes for add/edit
- `src/store/`
  - App provider and CRUD actions
  - Local state hydration and persistence orchestration
- `src/storage/`
  - AsyncStorage read/write helpers
- `src/data/`
  - Seed chocolates, entries, and default settings
- `src/types/`
  - Core TypeScript models
- `src/utils/`
  - Date helpers, validation, and monthly summary calculations
- `src/components/`
  - Reusable UI blocks and feature-specific components

## Local Persistence

This MVP does not require login. All data is stored on-device with AsyncStorage.

- The first launch loads seed data automatically.
- Library changes, entries, and settings persist locally.
- Resetting seed data is available from the Settings screen.

## Feature Areas

### Today

- Daily toggle for `Had Chocolate` or `No Chocolate`
- Action types: `Eat`, `Taste`, `Purchase`
- Numeric fields for bars, grams, calories, spend
- Optional chocolate picker from the saved library
- Note field and same-day summary list

### Calendar

- Custom month grid
- Entry indicators per day
- Selected day detail list
- Month summary cards for chocolate days, calories, spend, and no-chocolate streak

### Insights

- Current month totals
- Most frequent brand
- Average spend per chocolate day

### Library

- Seed chocolates for testing
- Add new chocolate
- Edit saved chocolate
- Favorite and buy-again toggles

### Settings

- Monthly budget
- Daily calorie goal
- Preferred unit
- Currency

## Release Notes

Release configuration is already scaffolded for EAS:

- app name: `Dark Diary`
- iOS bundle identifier: `com.alyu.darkdiary`
- Android package: `com.alyu.darkdiary`
- EAS profiles: `development`, `development-simulator`, `preview`, `production`

Store submission still requires your Apple / Google developer accounts, final app store assets, and store listing metadata.
