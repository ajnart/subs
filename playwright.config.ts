import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const origin = 'http://127.0.0.1:4173'
const dataDir = mkdtempSync(join(tmpdir(), 'subs-playwright-'))

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: origin,
    timezoneId: 'UTC',
    locale: 'en-US',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'bun --bun vite dev --host 127.0.0.1 --port 4173 --strictPort',
    url: `${origin}/api/health`,
    reuseExistingServer: false,
    env: {
      DATA_DIR: dataDir,
      SUBS_SETUP_TOKEN: 'known-test-token',
      SUBS_ORIGIN: origin,
      DISABLE_AUTH: 'false',
    },
    timeout: 120000,
  },
})
