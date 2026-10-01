# Coaching

React Native CLI app for the Coaching SaaS, built with React Native 0.86 and TypeScript. It uses Zustand for authentication state, native Keychain/Keystore storage for session credentials, and one Axios client with request and response interceptors.

## Start the app

```sh
npm install
cp .env.example .env
npm start
```

Set `API_URL` in `.env` to the backend URL reachable by the device, then restart Metro after changing it. The Android emulator uses `http://10.0.2.2:5010/api`; the iOS simulator can use `http://localhost:5010/api`. A physical phone needs the computer's LAN IP address, for example `http://192.168.1.20:5010/api`.

Install CocoaPods dependencies with `cd ios && pod install` after installing JavaScript packages. Run `npm run ios` or `npm run android` with the relevant native toolchain and simulator/device available.

Run `npm run typecheck` to validate TypeScript.

The app includes an animated Coaching launch screen, login, secure persisted sessions, role-aware tabs, institute/student/parent/teacher/super-admin data views, pull-to-refresh, and automatic session clearing after an unauthorized API response.
