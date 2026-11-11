// OneSignal configuration is intentionally supplied at build/runtime, never committed as a secret.
export async function initialisePushNotifications(userId) {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (!appId || !userId) return { configured: false, reason: 'OneSignal App ID or signed-in user is missing.' };
  try {
    const sdk = await import('onesignal-cordova-plugin');
    const OneSignal = sdk.default || sdk.OneSignal;
    OneSignal.initialize(appId);
    await OneSignal.Notifications.requestPermission(false);
    OneSignal.login(userId);
    return { configured: true };
  } catch (error) {
    console.warn('KONNEKT push setup:', error?.message || error);
    return { configured: false, reason: 'Push SDK is not available in this build.' };
  }
}
