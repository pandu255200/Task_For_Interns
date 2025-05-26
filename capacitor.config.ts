import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Tak_app',
  webDir: 'build',
  server: {
    url: 'https://taskmanagement-kohl.vercel.app/',  // Replace with your actual Vercel URL
    cleartext: false                     // Ensures HTTPS is used
  }
};

export default config;
