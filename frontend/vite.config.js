import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // escucha en 0.0.0.0: necesario dentro de un contenedor
    port: 5173,
    watch: { usePolling: process.env.VITE_USE_POLLING === 'true' },
    proxy: {
      '/api': process.env.VITE_API_PROXY ?? 'http://localhost:3000',
    },
  },
});
