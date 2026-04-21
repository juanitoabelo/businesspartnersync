import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Only used in development when no production API is set
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  envPrefix: ['VITE_', 'REACT_APP_'],
  define: {
    'process.env': {},
  },
})