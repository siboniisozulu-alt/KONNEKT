
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const pwaFiles = [
  'manifest.webmanifest',
  'sw.js',
  'konnekt.svg',
  'konnekt-192.png',
  'konnekt-512.png'
];

export default defineConfig({
  plugins: [
    react(),

    {
      name: 'copy-konnekt-pwa-assets',

      generateBundle() {
        for (const file of pwaFiles) {
          this.emitFile({
            type: 'asset',
            fileName: file,
            source: readFileSync(
              path.resolve(process.cwd(), file)
            )
          });
        }
      }
    }
  ],

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
