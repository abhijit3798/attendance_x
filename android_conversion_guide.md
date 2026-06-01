# AttendanceX - Android Studio APK Conversion Guide (Android 10+ / API 29+)

This guide outlines the detailed, step-by-step developer workflow to open, configure, and compile AttendanceX into a production-ready **Release APK** or **Android App Bundle (AAB)** inside Android Studio, targeting devices running Android 10+ (API Level 29 or higher).

---

## 1. Prerequisites & Environment Setup

Before compiling, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **Java Development Kit (JDK 17)** (required by modern Android Gradle wrappers)
- **Android Studio (Ladybug or later)**
- **Android SDK Platform-Tools** matching API Level 29+ (Standard Android 10.0 or higher)

---

## 2. Compile Web Resources & Synchronize Native Platforms

First, compile your production client web bundle and synchronize all assets into the native Android folder structure:

```bash
# 1. Compile optimized, minified production assets
npm run build

# 2. Sync web builds and configuration mappings into the Capacitor native project
npx cap sync
```

This updates the compiled web bundle inside the native directory path:
`android/app/src/main/assets/public/`

---

## 3. Opening the Project inside Android Studio

Launch Android Studio directly by pointing to the native android path or let the Capacitor CLI handle it for you:

```bash
npx cap open android
```

Wait for Android Studio to index the folder structures and complete the **Gradle Synchronization** sync cycle.

---

## 4. Configuring Target & SDK Versions

Verify that the build settings are targeted for Android 10+ (API 29+):
1. Inside the Android Studio Project Pane, navigate to and open:
   `android/app/build.gradle` (Module: `app`)
2. Double-check the following parameters:
   ```groovy
   android {
       compileSdk 34 // or latest stable compile SDK
       
       defaultConfig {
           applicationId "com.attendancex.app"
           minSdk 29 // Restricts installation to Android 10.0+ devices!
           targetSdk 34 // Matches Google Play Store requirement specs
           versionCode 1
           versionName "1.0.0"
           
           testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
       }
       ...
   }
   ```
3. If changes were made, click **"Sync Now"** in the yellow notification banner at the top of the editor.

---

## 5. Security & Biometrics Permission Mappings

Since AttendanceX supports a **Biometric Ready Lock**, we must declare biometrics permissions inside the native Android manifest:

1. Open `android/app/src/main/AndroidManifest.xml`
2. Add the following permission tag inside the `<manifest>` tag, right before the `<application>` block:
   ```xml
   <uses-permission android:name="android.permission.USE_BIOMETRIC" />
   <uses-permission android:name="android.permission.USE_FINGERPRINT" />
   ```
3. Add the hardware-acceleration tag inside the `<application>` node to ensure smooth sliding gestures and calendar heatmaps:
   ```xml
   <application
       android:hardwareAccelerated="true"
       ... >
   ```

---

## 6. Configuring Splash Screens & Adaptive Icons

Capacitor automatically scaffolds a default splash screen and launching icons. To customize them:

### A. App Launching Icons (Adaptive Icons for Android 10+)
Android 10+ uses **Adaptive Icons** composed of a foreground vector image and a background color layer:
1. Right-click the `app` folder in the project deck and select:
   `New -> Image Asset`
2. In the **Asset Studio** configuration screen:
   - **Icon Type**: Select `Launcher Icons (Adaptive and Legacy)`
   - **Name**: Leave as `ic_launcher`
   - **Foreground Layer**: Point the path to `public/logo512.png` or `public/logo192.png` and scale it down to fit inside the safe-zone guide circle.
   - **Background Layer**: Select `Color` and pick `#090F0C` (matching the dark forest green background).
3. Click `Next` and then `Finish` to auto-generate adaptive vector assets across all native screen densities (`mipmap-hdpi`, `mipmap-xxxhdpi`, etc.).

### B. Launch Splash Screens
Capacitor displays a native splash screen before launching the WebView:
1. Splash image resources are stored under:
   `android/app/src/main/res/drawable/splash.png`
2. Replace `splash.png` with a custom-designed launching splash screen matching the theme colors to ensure a seamless Material 3 launch transition!

---

## 7. Compiling the Production signed APK / AAB Bundle

When you are ready to compile the final build for device side-loading or Google Play Store publishing:

1. In the Android Studio Top Menu, select:
   `Build -> Generate Signed Bundle / APK...`
2. Select either:
   - **Android App Bundle (AAB)**: Best for uploading directly to Google Play Store.
   - **APK**: Best for direct local side-loading and manual testing on devices.
3. Click `Next`.
4. Choose or create a secure **Key Store Path** (`.jks` keystore), fill in secure credentials, and specify your developer key alias.
5. Select the **Build Variant** as `release`.
6. Select **Destination Folder** where the build will compile.
7. Click **Create / Finish**.

Android Studio will compile, bundle, and optimize the APK wrapper in the background. Once completed, a popup toast notification will appear. Click **"Locate"** to retrieve your optimized `.apk` file!
