import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Allows the built app (GitHub Pages / any static host) to be served
  // from a sub-path, e.g. /messenger/.
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});