import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { gamePages } from './scripts/game-pages.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), gamePages()],
  server: {
    // In development, the update-email sign-ups go to updates/server.js run locally
    // (`node updates/server.js` - with no RESEND_API_KEY it prints emails instead of sending).
    // The pages that post to the intake (the /draw form, the Spell Index vote) go to
    // intake/server.js run locally the same way: `DATA_DIR=<a scratch folder> node
    // intake/server.js`, which with no RESEND_API_KEY saves each post there and emails nothing.
    proxy: {
      '/api/updates': 'http://localhost:3002',
      '/api/draw': 'http://localhost:3000',
    },
  },
})
