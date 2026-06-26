import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plain static SPA. Outputs to dist/. No SSR, no server functions, no Worker.
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
})
