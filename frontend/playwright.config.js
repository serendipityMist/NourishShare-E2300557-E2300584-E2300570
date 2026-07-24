// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // TODO: uncomment once tests/global-setup.js exists in this project
  // and its login/delete endpoint placeholders have been fixed to match
  // the real backend routes. Until then, this line breaks config loading
  // entirely (MODULE_NOT_FOUND) because the file doesn't exist yet.
  // globalSetup: './tests/global-setup.js',

  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  // Forced to 1 everywhere (not just CI): tests across chromium/firefox/
  // webkit share one login account and hit the same dev server. Running
  // them in parallel causes one browser's navigation/session to get
  // starved out — e.g. page.goto() hanging indefinitely on
  // domcontentloaded, as seen on firefox in donation-browsing.spec.js.
  // Serial execution avoids that at the cost of slower total runtime.
  workers: 1,

  reporter: 'html',

  // Default per-test timeout. Bumped from the 30s default since the
  // image-upload create/edit flows can legitimately take longer,
  // especially before pantry cleanup has run.
  timeout: 60000,

  use: {
    baseURL: 'http://localhost:5173',

    trace: 'on-first-retry',

    screenshot: 'on',

    video: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});