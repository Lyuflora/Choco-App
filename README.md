# Dark Diary

Dark Diary is a local-first chocolate tracking MVP built with React Native, Expo Router, and TypeScript. It is designed for simple daily logging, monthly insight, and a warm premium UI focused on chocolate habits.

## Setup

Install dependencies and run the app:

```bash
npm install
npm run start
```

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
- EAS profiles: `development`, `preview`, `production`

Store submission still requires your Apple / Google developer accounts, final app store assets, and store listing metadata.
