// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',

    // TODO: uncomment once tests/global-setup.js exists in this project
    // and its login/delete endpoint placeholders have been fixed.
    // globalSetup: './tests/global-setup.js',

    fullyParallel: false,

    forbidOnly: !!process.env.CI,

    retries: process.env.CI ? 2 : 0,

    // Run tests one at a time because they share the same
    // login account and development server.
    workers: 1,

    reporter: 'html',

    // Default timeout for each test.
    timeout: 60000,

    use: {
        // IMPORTANT:
        // This must be a normal URL, NOT Markdown.
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

    // Playwright automatically starts the Vite development server
    // if it is not already running.
    webServer: {
        command: 'npm run dev',

        // IMPORTANT:
        // This must also be a normal URL, NOT Markdown.
        url: 'http://localhost:5173',

        reuseExistingServer: !process.env.CI,
    },
});