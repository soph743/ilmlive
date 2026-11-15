import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When the Flask backend is ready, requests to /api/... can be forwarded to it
// by uncommenting the proxy below (Flask runs on port 5001 in your README).
export default defineConfig({
  plugins: [react()],
  // server: { proxy: { '/api': 'http://localhost:5001' } },
})
