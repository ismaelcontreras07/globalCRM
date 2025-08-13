// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      process: 'process/browser',
    }
  },
  define: {
    'process.env': {}
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/globalCRM/backend/api', // A dónde se envía la petición (el servidor backend real).
        changeOrigin: true, // Cambia el encabezado Origin de la petición para que coincida con el del target. Útil para evitar problemas con CORS.
        secure: false, // Si el target es HTTP, asegúrate de que secure sea false.
        rewrite: (path) => path.replace(/^\/api/, '') // Remueve el prefijo /api de la petición para que coincida con el endpoint de la API.
      }
    }
  }
})
