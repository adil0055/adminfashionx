import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://65.0.6.48:8000', // Backend URL
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://65.0.6.48:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
