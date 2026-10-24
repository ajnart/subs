import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: `${root}demo`,
  publicDir: `${root}public`,
  envDir: false,
  define: { 'import.meta.env.VITE_DEMO_MODE': JSON.stringify('true') },
  resolve: { alias: { '@': `${root}src` } },
  plugins: [tailwindcss(), react()],
  build: { outDir: `${root}dist/demo`, emptyOutDir: true },
})
