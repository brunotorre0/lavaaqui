import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lavaaqui.app',
  appName: 'LavaAqui',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
