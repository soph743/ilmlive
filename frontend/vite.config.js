import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Requests to /api/... are forwarded to the Flask backend (port 5001 by default),
// so the browser sees one origin and Flask's session cookie just works.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5001' } },
})
