import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': '/src/components',
      '@assets': '/src/assets',
      '@utils': '/src/components/utils',
      '@scss': '/src/scss',
      '@commons': '/src/components/commons',
    }
  }
})

