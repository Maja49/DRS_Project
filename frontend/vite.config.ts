import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})*/

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ⚠️ OVO JE KLJUČNO da se vidi iz Dockera
    port: 5173
  },
    preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      'drs-frontend-b2bt.onrender.com'
    ],
  }
})
