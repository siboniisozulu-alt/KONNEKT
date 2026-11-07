
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/KONNEKT/',
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
