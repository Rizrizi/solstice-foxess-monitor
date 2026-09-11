# Solstice — FoxESS solar monitor

A Tesla-app-style solar/battery monitoring dashboard for FoxESS inverters,
built with Expo (React Native). Runs on demo data out of the box; connect
your FoxESS OpenAPI key in-app to switch to live readings.

## Features

- Animated solar → home → battery/grid flow diagram
- Live headline power number, stat cards (yield, usage, grid, CO₂ avoided)
- Day/week generation chart
- Battery charge ring with status, rate, and time-to-full
- In-app "Connect" panel that talks directly to FoxESS's OpenAPI
  (signed requests, no backend needed — see `lib/foxess.js`)

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android), or press `a` / `i` for an
emulator.

## Build a real .apk / .aab

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview   # installable .apk
```

## Connecting your FoxESS account

Generate an API key at foxesscloud.com → Account → API Management, then
enter it plus your inverter's serial number in the app's "Connect" card.
Your key stays on-device; it's sent straight to FoxESS, signed per their
OpenAPI spec (see `lib/foxess.js` for the exact signing logic).

## Project structure

```
App.js                 entry point, ties components + polling together
theme.js                color tokens
data/mock.js            demo data generators
lib/foxess.js           real FoxESS OpenAPI client (signed requests)
components/
  FlowDiagram.js         animated power-flow diagram
  StatCard.js            small stat tiles
  GenerationChart.js     day/week chart
  BatteryRing.js         battery charge gauge
  ConnectPanel.js        API key / serial number entry
```

## Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

(Create the empty repo on github.com first, or via `gh repo create` if
you have the GitHub CLI installed.)
