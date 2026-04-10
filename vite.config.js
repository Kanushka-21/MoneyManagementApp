import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: false,
    target: ['esnext', 'es2020']
  },
  server: {
    port: 3000,
    open: true
  },
  ssr: {
    external: ['firebase']
  }
});
