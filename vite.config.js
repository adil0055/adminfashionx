import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://13.203.231.154:8000', // Backend URL
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://13.203.231.154:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
