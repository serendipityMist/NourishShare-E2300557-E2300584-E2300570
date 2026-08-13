import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',

    // Deletes leftover test meal plans (from previous runs) via API
    // before any test starts, so the 7x4 = 28-slot calendar never
    // fills up and starts hiding newly created meals.
    globalSetup: './tests/global-setup.js',

    // fullyParallel only controls parallelism WITHIN a spec file.
    // It does NOT stop different projects (chromium/firefox/webkit)
    // from running at the same time against the same dev server
    // and the same test account -- that's what was causing the
    // strict-mode violations ("resolved to 2/3 elements") and the
    // NS_ERROR_CONNECTION_REFUSED / page-crashed failures.
    fullyParallel: false,

    // Force everything -- including different projects -- to run
    // one test at a time. This stops chromium/firefox/webkit from
    // simultaneously logging into the same account and creating
    // meals with the same names at the same time.
    workers: 1,

    timeout: 30000,

    expect: {
        timeout: 10000,
    },

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
        reuseExistingServer: true,
    },
});