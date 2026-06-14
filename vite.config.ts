import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  server: {
    port: 3000,
    host: true
  },
  build: {
    assetsInlineLimit: 0
  }
});
