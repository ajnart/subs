import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

const require = createRequire(import.meta.url)
const nitroRoot = dirname(require.resolve('nitro/package.json'))
const nodeModulesRoot = resolve('node_modules')
let dependenciesRoot = nodeModulesRoot
if (!nitroRoot.startsWith(`${nodeModulesRoot}/`)) dependenciesRoot = resolve(nitroRoot, '../../..')

const database = {
  default: {
    connector: 'bun-sqlite' as const,
    options: {
      path: process.env.SQLITE_PATH ?? `${process.env.DATA_DIR ?? './data'}/subs.sqlite`,
    },
  },
}

export default defineConfig({
  resolve: { tsconfigPaths: true, alias: { pathe: resolve(dirname(require.resolve('pathe')), 'index.mjs') } },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), dependenciesRoot],
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({
      preset: 'bun',
      plugins: [resolve('src/server/database-path.ts')],
      experimental: { database: true },
      database,
      devDatabase: database,
    }),
    react(),
  ],
})
