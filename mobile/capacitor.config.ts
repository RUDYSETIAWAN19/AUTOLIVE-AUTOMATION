import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.autolive.app',
  appName: 'AutoLive',
  webDir: '../frontend/out',
  bundledWebRuntime: false,
  server: {
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined,
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  ios: {
    scheme: 'AutoLive',
    contentInset: 'always',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
