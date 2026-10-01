This is a bare React Native CLI mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Commands

```bash
npm install
npm start
npm run ios
npm run android
npm run typecheck
```

Run the TypeScript check before declaring a task done. Install iOS pods with `cd ios && pod install` when native dependencies change.

## Native Projects

- `ios/` and `android/` are checked-in React Native CLI projects. Keep their identifiers aligned with `com.livecoach.coaching` when changing app configuration.
- React Native packages with native code are autolinked by the Community CLI. Reinstall CocoaPods after adding or removing iOS native packages.
- The app entry point is `index.js`, which registers the root component from `App.tsx`.
