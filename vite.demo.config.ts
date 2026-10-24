import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

const require = createRequire(import.meta.url)
const root = fileURLToPath(new URL('.', import.meta.url))
const fontRoot = dirname(realpathSync(require.resolve('@fontsource-variable/inter/package.json')))

export default defineConfig({
  root: `${root}demo`,
  publicDir: `${root}public`,
  envDir: false,
  define: { 'import.meta.env.VITE_DEMO_MODE': JSON.stringify('true') },
  resolve: { alias: { '@': `${root}src` } },
  server: { fs: { allow: [searchForWorkspaceRoot(root), fontRoot] } },
  plugins: [tailwindcss(), react()],
  build: { outDir: `${root}dist/demo`, emptyOutDir: true },
})
