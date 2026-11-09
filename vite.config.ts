import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves the site at /<repo>/; override with BASE_PATH if the repo name differs.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/danchuk-kingdom/',
  plugins: [react()],
})
