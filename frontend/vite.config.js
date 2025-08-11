// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-trello']
  },
  resolve: {
    alias: {
      // redirige import "process" al paquete npm process/browser
      process: 'process/browser',
      // opcionalmente define un alias para react-trello si quieres forzar la versión
      // 'react-trello': path.resolve(__dirname, 'node_modules/react-trello')
    }
  },
  define: {
    // asegura que process.env no explote
    'process.env': {}
  },
  server: {
    proxy: {
      // 1) Intercepta TODO lo que empiece por /api
      '/api': {
        // 2) Apunta directamente a tu API
        target: 'http://localhost/iconCRM/backend/api',
        changeOrigin: true,
        secure: false,
        // 3) Elimina el prefijo `/api` de la ruta
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
