import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ⚠️ OVO JE KLJUČNO da se vidi iz Dockera
    port: 5173,
    allowedHosts: [
      'drs-frontend-b2bt.onrender.com'
    ],
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      'drs-frontend-b2bt.onrender.com'
    ],
  }
})
