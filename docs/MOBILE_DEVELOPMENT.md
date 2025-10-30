# 📱 Mobile Development Guide

This guide explains how to develop and build InstaGoods as a native Android application using Capacitor.

## Overview

InstaGoods uses [Capacitor](https://capacitorjs.com/) to wrap the web application into a native Android app. Capacitor allows the React web app to run in a native WebView with access to native device APIs.

## Prerequisites

### For Android Development

- **Node.js** (v18 or higher)
- **npm** or **bun**
- **Android Studio** (latest version)
  - Download from: https://developer.android.com/studio
- **Java Development Kit (JDK)** 17 or higher
  - Android Studio includes OpenJDK
- **Android SDK** (installed via Android Studio)
  - Minimum SDK: API 22 (Android 5.1)
  - Target SDK: API 34 (Android 14) or latest

### Setting up Android Studio

1. **Install Android Studio**
   - Download and install from https://developer.android.com/studio
   - Follow the setup wizard to install the Android SDK

2. **Configure Android SDK**
   - Open Android Studio
   - Go to: Tools → SDK Manager
   - Install the following:
     - Android SDK Platform (API 34 or latest)
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools
     - Android SDK Command-line Tools

3. **Set Environment Variables** (if not auto-configured)
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

4. **Create an Android Virtual Device (AVD)**
   - Open Android Studio
   - Go to: Tools → Device Manager
   - Click "Create Device"
   - Select a device (e.g., Pixel 5)
   - Select a system image (e.g., Android 13 or 14)
   - Click "Finish"

## Project Structure

After Capacitor setup, your project will have:

```
InstaGoods/
├── android/                    # Native Android project
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── assets/
│   │   │       │   └── public/    # Web assets copied here
│   │   │       ├── java/          # Native Android code
│   │   │       └── res/           # Android resources
│   │   └── build.gradle
│   ├── gradle/
│   ├── build.gradle
│   └── settings.gradle
├── capacitor.config.ts         # Capacitor configuration
├── package.json
└── ...
```

## Available Scripts

### Build and Sync Commands

```bash
# Build web app and sync all platforms
npm run cap:sync

# Build web app and sync Android only
npm run cap:sync:android

# Open Android project in Android Studio
npm run cap:open:android

# Build, sync, and run on Android device/emulator
npm run cap:run:android

# Build APK for testing
npm run cap:build:android
```

### Development Workflow

```bash
# 1. Start web development server
npm run dev

# 2. In another terminal, open Android Studio
npm run cap:open:android

# 3. Run the app from Android Studio
# Click the green "Run" button
```

## Development Process

### 1. Initial Setup (Already Done)

The Capacitor setup has been completed with the following steps:

```bash
# Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init "InstaGoods" "com.instagoods.app" --web-dir=dist

# Add Android platform
npx cap add android
```

### 2. Making Changes to the Web App

1. Make your changes to React components in `src/`
2. Build the web app:
   ```bash
   npm run build
   ```
3. Sync changes to native platforms:
   ```bash
   npm run cap:sync:android
   ```

### 3. Testing on Emulator

1. Ensure you have an Android emulator running or a device connected
2. Run the app:
   ```bash
   npm run cap:run:android
   ```
   Or use Android Studio's Run button

### 4. Testing on Physical Device

1. Enable Developer Options on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. Connect your device via USB

3. Run the app:
   ```bash
   npm run cap:run:android
   ```

### 5. Live Reload (Development)

For faster development, you can use live reload:

1. Find your computer's local IP address:
   ```bash
   # On Linux/Mac
   ifconfig | grep inet
   
   # On Windows
   ipconfig
   ```

2. Update `capacitor.config.ts`:
   ```typescript
   const config: CapacitorConfig = {
     // ... other config
     server: {
       url: 'http://YOUR_IP:8080',
       cleartext: true
     }
   };
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Sync and run:
   ```bash
   npm run cap:sync:android
   npm run cap:run:android
   ```

   > **Important:** Remember to remove or comment out the `server.url` configuration before building for production!

## Building for Production

### Debug APK (for testing)

```bash
# Build the web app
npm run build

# Sync with Android
npm run cap:sync:android

# Build debug APK
cd android
./gradlew assembleDebug

# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for distribution)

1. **Generate a signing key**:
   ```bash
   keytool -genkey -v -keystore instagoods-release-key.keystore \
           -alias instagoods -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Create `android/key.properties`**:
   ```properties
   storePassword=your_keystore_password
   keyPassword=your_key_password
   keyAlias=instagoods
   storeFile=../instagoods-release-key.keystore
   ```

3. **Update `android/app/build.gradle`**:
   ```gradle
   android {
       // ... existing config
       
       signingConfigs {
           release {
               def keystorePropertiesFile = rootProject.file("key.properties")
               def keystoreProperties = new Properties()
               keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
               
               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
               storeFile file(keystoreProperties['storeFile'])
               storePassword keystoreProperties['storePassword']
           }
       }
       
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

4. **Build release APK**:
   ```bash
   npm run build
   npm run cap:sync:android
   cd android
   ./gradlew assembleRelease
   
   # APK will be at: android/app/build/outputs/apk/release/app-release.apk
   ```

### Building AAB (Android App Bundle) for Google Play

```bash
cd android
./gradlew bundleRelease

# AAB will be at: android/app/build/outputs/bundle/release/app-release.aab
```

## Configuration

### Capacitor Configuration

Edit `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.instagoods.app',           // Unique app identifier
  appName: 'InstaGoods',                  // App display name
  webDir: 'dist',                         // Build output directory
  
  server: {
    androidScheme: 'https',               // Use HTTPS scheme
    cleartext: true                       // Allow HTTP requests
  },
  
  android: {
    allowMixedContent: true,              // Allow mixed HTTP/HTTPS content
    captureInput: true,                   // Enable input capture
    webContentsDebuggingEnabled: true     // Enable Chrome DevTools debugging
  }
};

export default config;
```

### App Configuration

**App Name & Icon:**
- Update app name in `android/app/src/main/res/values/strings.xml`
- Replace icons in `android/app/src/main/res/` folders

**App Version:**
- Update in `android/app/build.gradle`:
  ```gradle
  defaultConfig {
      versionCode 1
      versionName "1.0.0"
  }
  ```

**Permissions:**
- Edit `android/app/src/main/AndroidManifest.xml`
- Add required permissions, e.g.:
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  ```

## Adding Native Plugins

Capacitor has many official and community plugins:

```bash
# Example: Add Camera plugin
npm install @capacitor/camera
npx cap sync android
```

Popular plugins:
- `@capacitor/camera` - Camera and photos
- `@capacitor/geolocation` - GPS location
- `@capacitor/storage` - Native key-value storage
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/splash-screen` - Native splash screen
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/app` - App lifecycle and info

See all plugins: https://capacitorjs.com/docs/plugins

## Debugging

### Chrome DevTools

1. Open Chrome and navigate to: `chrome://inspect`
2. Run your app on an emulator or device
3. Your app should appear in the list
4. Click "inspect" to open DevTools

### Android Studio Logcat

1. Open Android Studio
2. Go to: View → Tool Windows → Logcat
3. Filter by your app package: `com.instagoods.app`

### Debug Web Content

```typescript
// Add to capacitor.config.ts for debugging
android: {
  webContentsDebuggingEnabled: true
}
```

## Troubleshooting

### Build Fails

**Problem:** Gradle build fails
```bash
# Solution: Clean and rebuild
cd android
./gradlew clean
./gradlew build
```

**Problem:** SDK not found
```bash
# Solution: Set ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
# Or point to your Android SDK location
```

### App Won't Start

**Problem:** White screen on launch
- Check that `npm run build` completed successfully
- Ensure `dist` folder has content
- Run `npm run cap:sync:android` again

**Problem:** Network requests fail
- Add `cleartext: true` to server config in `capacitor.config.ts`
- Check AndroidManifest.xml has INTERNET permission

### Live Reload Issues

**Problem:** Device can't connect to dev server
- Ensure device and computer are on same network
- Check firewall settings
- Verify IP address in `capacitor.config.ts`

## Performance Optimization

### 1. Code Splitting

Update `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  }
});
```

### 2. Image Optimization

- Compress images before building
- Use WebP format when possible
- Implement lazy loading for images

### 3. PWA Features

- Add service worker for offline support
- Cache static assets
- Enable background sync

## Resources

### Documentation
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)

### Tools
- [Android Studio](https://developer.android.com/studio)
- [Capacitor CLI](https://capacitorjs.com/docs/cli)
- [Gradle](https://gradle.org/)

### Community
- [Capacitor GitHub](https://github.com/ionic-team/capacitor)
- [Capacitor Discord](https://discord.gg/UPYYRhtyzp)
- [Ionic Forum](https://forum.ionicframework.com/)

## Next Steps

1. ✅ Capacitor is set up for Android
2. 🔄 Test the app on an emulator or device
3. 📦 Consider adding Capacitor plugins for native features
4. 🎨 Customize app icon and splash screen
5. 🔧 Configure app for production release
6. 🚀 Submit to Google Play Store

---

**Need Help?** 
- Check the [Capacitor Documentation](https://capacitorjs.com/docs)
- Review Android-specific issues in [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- Ask questions in the project's GitHub Issues
