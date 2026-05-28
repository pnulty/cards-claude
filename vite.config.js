import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'zoom',
  base: '/zoom/',
  plugins: [react()],
  build: {
    outDir: '../public/zoom',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': { target: 'http://localhost:3001', ws: true },
      '/images': { target: 'http://localhost:3001' },
    },
  },
});
