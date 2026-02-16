

# Add Capacitor for App Store and Play Store Distribution

## Overview

Wrap the existing Edupreneurs React web app in Capacitor to create native iOS and Android apps. The web app runs inside a native WebView shell, giving access to App Store/Play Store distribution while keeping the existing codebase intact.

## What Changes in the Project

### 1. Install Capacitor Dependencies

Add the following packages:
- `@capacitor/core` (runtime)
- `@capacitor/cli` (dev dependency)
- `@capacitor/ios` (iOS platform)
- `@capacitor/android` (Android platform)

### 2. Initialize Capacitor Configuration

Create `capacitor.config.ts` at project root with:
- **App ID**: `app.lovable.14710ec1c1bf40aab3976fddd23c28b4`
- **App Name**: `edupreneurs-haiti-ai`
- **Web Dir**: `dist` (Vite build output)
- **Server URL**: Points to the Lovable preview for hot-reload during development

### 3. Update `package.json` Scripts

Add convenience scripts:
- `cap:sync` -- sync web build to native projects
- `cap:build` -- build + sync in one command
- `cap:open:ios` -- open iOS project in Xcode
- `cap:open:android` -- open Android project in Android Studio

### 4. Service Worker Compatibility

The existing `public/sw.js` works as-is inside Capacitor's WebView. No changes needed -- the service worker handles caching and push notifications the same way.

### 5. PWA Install Prompt Adjustment

Update `usePWAInstall.ts` to detect when running inside Capacitor (native app) and suppress the "Install to Home Screen" banner, since the user already has the native app installed.

## What You Need To Do After (On Your Machine)

Since Capacitor requires native build tools that cannot run inside Lovable, you will need to:

1. **Export to GitHub** via the "Export to GitHub" button in Lovable
2. **Clone and install** on your local machine:
   ```
   git pull
   npm install
   ```
3. **Add native platforms**:
   ```
   npx cap add ios
   npx cap add android
   ```
4. **Update native dependencies**:
   ```
   npx cap update ios
   npx cap update android
   ```
5. **Build and sync**:
   ```
   npm run build
   npx cap sync
   ```
6. **Run on device/emulator**:
   - iOS: `npx cap run ios` (requires Mac + Xcode)
   - Android: `npx cap run android` (requires Android Studio)

Every time you pull new changes from Lovable, just run `npx cap sync` to update the native apps.

## Technical Details

### Files Created/Modified

| File | Action | Description |
|---|---|---|
| `capacitor.config.ts` | Create | Capacitor configuration with app ID, name, and dev server URL |
| `package.json` | Edit | Add Capacitor dependencies + convenience scripts |
| `src/hooks/usePWAInstall.ts` | Edit | Detect Capacitor environment and suppress install banner |

### Capacitor Detection in Code

```typescript
// Check if running inside Capacitor native shell
const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
```

This prevents showing the PWA install prompt when the user is already in the native app.

### No Impact On

- Existing PWA functionality (still works in browsers)
- Service worker caching strategy
- Push notifications
- All existing features and routes
- Database or backend

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing PWA? | No -- Capacitor is additive |
| Breaks existing functionality? | No -- only adds config + suppresses install banner in native |
| 3G optimized? | Yes -- native shell loads local assets, no extra downloads |
| Backward compatible? | Yes -- web app continues working independently |

## Important Reading

After implementation, refer to the [Lovable blog post on Capacitor](https://lovable.dev/blog/capacitor-lovable) for detailed guidance on building, signing, and publishing to the App Store and Play Store.

