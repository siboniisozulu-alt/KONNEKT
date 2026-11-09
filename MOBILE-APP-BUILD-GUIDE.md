# KONNEKT Mobile App Build Guide

This package wraps the existing React/Vite KONNEKT application in Capacitor. It keeps the existing Supabase URL, publishable key, authentication, profiles, follows, posts, statuses and storage configuration. It does not create a new Supabase project or change database tables/policies.

## Important
- Android users receive an installable APK.
- iPhone users need a separate iOS build. An APK cannot be installed on iPhone.
- Android builds require Android Studio + Android SDK. iOS builds require macOS + Xcode.
- The first native build still needs dependency installation and native platform generation.

## Android: generate and build APK

1. Install Node.js LTS and Android Studio on a computer.
2. Extract this ZIP and open a terminal in the `KONNEKT-main` project folder.
3. Run:

   ```bash
   npm install
   npm run cap:sync
   npx cap add android
   npx cap sync android
   npx cap open android
   ```

4. In Android Studio, allow Gradle sync and install any requested Android SDK components.
5. For a test APK, choose **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Android Studio will show the APK location, usually `android/app/build/outputs/apk/debug/app-debug.apk`.
7. Copy the APK to an Android phone, allow installation from that file source, and install it.

For a signed release APK, use **Build > Generate Signed Bundle / APK > APK**, create and safely back up a keystore, then complete the wizard. Never share the keystore or its passwords.

## Updating after website/code changes

Run:

```bash
npm run cap:sync
```

Then rebuild the APK in Android Studio.

## iPhone: prepare the iOS app

On a Mac with Xcode installed, run:

```bash
npm install
npm run cap:sync
npx cap add ios
npx cap sync ios
npx cap open ios
```

Configure signing in Xcode and run on a device or distribute through TestFlight/App Store. An Apple Developer account may be required for wider distribution.

## Existing website deployment

The normal `npm run build` remains configured for the existing GitHub Pages `/KONNEKT/` path. The separate `npm run build:mobile` uses a relative asset path suitable for the Capacitor WebView. Continue using the normal website build workflow for GitHub Pages.

## Supabase safety

The existing public client URL and publishable key remain in `src/lib_supabase.js`. These are client-side credentials and must be protected by correctly configured Supabase Row Level Security (RLS) and Storage policies. Never place a Supabase service-role key in this app. Do not run the SQL schema again just to build the mobile package.

## Before public release

Test sign-up, sign-in, password reset/deep links, chats, Reels video playback, follow/unfollow persistence, creator profiles, Discover search, status upload/view/expiry, media permissions, app background/resume, and logout on real devices. Configure verified HTTPS redirect URLs in Supabase Auth for the app's chosen deep-link scheme before relying on password reset links in the installed app.
