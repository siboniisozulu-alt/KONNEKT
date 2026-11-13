import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.konnekt.app',
  appName: 'KONNEKT',
  webDir: 'dist',
  android: { allowMixedContent: false }
};
export default config;
