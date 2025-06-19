import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'ITM',
  webDir: 'build',
   server: {
    url: 'https://internstasksresoluteai.vercel.app/',  // Replace with your actual Vercel URL
    cleartext: false                     // Ensures HTTPS is used
  }
};

export default config;


