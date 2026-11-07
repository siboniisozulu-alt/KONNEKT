
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/KONNEKT/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
