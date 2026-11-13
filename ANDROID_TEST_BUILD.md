# Android wrapper notes

The included `capacitor.config.ts` and `package.json` let you generate the Android project after the first source upload:

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

Before testing LiveKit calls inside the native Android WebView, add these permissions to `android/app/src/main/AndroidManifest.xml` directly under the `<manifest>` element (not inside `<application>`):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
```

Check the Android WebView permission prompt behavior on the target Android version. If the WebView does not grant `getUserMedia` permissions correctly, use a maintained Capacitor native audio/video integration rather than bypassing Android permission controls.

This wrapper is not a signed production APK/AAB. Use Android Studio to create a debug APK for closed testers. Native Firebase push notifications, Play Integrity, app signing, privacy disclosures and store publication are separate work and must not be inferred from the PWA build.
