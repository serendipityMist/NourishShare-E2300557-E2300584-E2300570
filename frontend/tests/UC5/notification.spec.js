import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'gfcgffghhhhgg53@gmail.com';
const TEST_PASSWORD = 'Spriha@123';


/**
 * ============================================================
 * LOGIN HELPER
 * ============================================================
 */
async function login(page) {
    await page.goto('/login');

    await expect(
        page.getByRole('button', {
            name: /log in/i,
        })
    ).toBeVisible();

    await page
        .getByLabel('Email or Phone Number')
        .fill(TEST_EMAIL);

    await page
        .getByLabel('Password')
        .fill(TEST_PASSWORD);

    await Promise.all([
        page.waitForURL(/dashboard|welcome/, {
            timeout: 30000,
        }),

        page
            .getByRole('button', {
                name: /log in/i,
            })
            .click(),
    ]);
}


/**
 * ============================================================
 * UC5 - NOTIFICATIONS MODULE
 * ============================================================
 */
test.describe('UC5 - Notifications Module', () => {


    /**
     * ========================================================
     * TEST 1
     * Unauthenticated user is redirected to login
     * ========================================================
     */
    test(
        'Unauthenticated user is redirected to login from notifications page',
        async ({ page }) => {

            await page.goto('/notifications');

            await expect(page).toHaveURL(/login/i);
        }
    );


    /**
     * ========================================================
     * TEST 2
     * Authenticated user can access notifications page
     * ========================================================
     */
    test(
        'Authenticated user can access notifications page',
        async ({ page }) => {

            await login(page);

            await page.goto('/notifications');

            await expect(page).toHaveURL(/notifications/i);

            await expect(
                page
                    .getByRole('main')
                    .getByRole('heading', {
                        name: 'Notifications',
                        exact: true,
                    })
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * TEST 3
     * Notifications page displays Mark All as Read button
     * ========================================================
     */
    test(
        'Notifications page displays Mark All as Read button',
        async ({ page }) => {

            await login(page);

            await page.goto('/notifications');

            const markAllButton = page.getByRole('button', {
                name: /mark all as read/i,
            });

            await expect(markAllButton).toBeVisible();

            await expect(markAllButton).toBeEnabled();
        }
    );


    /**
     * ========================================================
     * TEST 4
     * User can click Mark All as Read
     * ========================================================
     */
    test(
        'User can click Mark All as Read',
        async ({ page }) => {

            await login(page);

            await page.goto('/notifications');

            const markAllButton = page.getByRole('button', {
                name: /mark all as read/i,
            });

            await expect(markAllButton).toBeVisible();

            await expect(markAllButton).toBeEnabled();

            await markAllButton.click();

            await expect(page).toHaveURL(/notifications/i);

            await expect(
                page
                    .getByRole('main')
                    .getByRole('heading', {
                        name: 'Notifications',
                        exact: true,
                    })
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * TEST 5
     * Notifications page contains visible content
     * ========================================================
     */
    test(
        'Notifications page displays visible content',
        async ({ page }) => {

            await login(page);

            await page.goto('/notifications');

            await page.waitForLoadState('networkidle');

            const main = page.getByRole('main');

            await expect(main).toBeVisible();

            const mainText = await main.innerText();

            expect(mainText.trim().length).toBeGreaterThan(0);
        }
    );


    /**
     * ========================================================
     * TEST 6
     * Notifications page has a valid state
     * ========================================================
     *
     * UC5 allows two states:
     *
     * 1. Notifications exist
     * 2. No new notifications
     *
     * Therefore, this test verifies that the application
     * displays one of those valid states.
     */
    test(
        'Notifications page displays a valid notification state',
        async ({ page }) => {

            await login(page);

            await page.goto('/notifications');

            await page.waitForLoadState('networkidle');

            const noNotifications = page.getByRole('heading', {
                name: 'No new notifications',
                exact: true,
            });

            const notificationsHeading = page
                .getByRole('main')
                .getByRole('heading', {
                    name: 'Notifications',
                    exact: true,
                });

            await expect(notificationsHeading).toBeVisible();

            const pageText = await page
                .getByRole('main')
                .innerText();

            /*
             * The page must contain actual content.
             */
            expect(pageText.trim().length).toBeGreaterThan(0);

            /*
             * If the empty state exists, verify its text.
             *
             * Otherwise, the page is displaying notification
             * content.
             */
            if (await noNotifications.count() > 0) {
                await expect(noNotifications).toBeVisible();
            } else {
                expect(pageText.trim().length).toBeGreaterThan(0);
            }
        }
    );


    /**
     * ========================================================
     * TEST 7
     * Notifications page remains accessible after refresh
     * ========================================================
     */
    test(
        'Notifications page remains accessible after refresh',
        async ({ page }) => {

            await login(page);

            await page.goto('/notifications');

            await expect(page).toHaveURL(/notifications/i);

            await page.reload();

            await expect(page).toHaveURL(/notifications/i);

            await expect(
                page
                    .getByRole('main')
                    .getByRole('heading', {
                        name: 'Notifications',
                        exact: true,
                    })
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * TEST 8
     * User can navigate away and return to notifications
     * ========================================================
     */
    test(
        'User can leave and return to notifications page',
        async ({ page }) => {

            await login(page);

            await page.goto('/notifications');

            await expect(page).toHaveURL(/notifications/i);

            /*
             * Navigate to dashboard.
             */
            await page.goto('/dashboard');

            await expect(page).toHaveURL(/dashboard/i);

            /*
             * Return to notifications.
             */
            await page.goto('/notifications');

            await expect(page).toHaveURL(/notifications/i);

            await expect(
                page
                    .getByRole('main')
                    .getByRole('heading', {
                        name: 'Notifications',
                        exact: true,
                    })
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * NEW NEGATIVE TEST CASES (TESTS 9-11)
     *
     * IMPORTANT - PLEASE VERIFY BEFORE RUNNING:
     * Tests 9 and 11 call backend API endpoints directly. The
     * exact paths below (/api/v1/notifications and
     * /api/v1/notifications/:id/read) are INFERRED from the
     * pattern used in the UC2 spec (/api/v1/food/...). Please
     * replace them with your real notification endpoints before
     * running, or they will fail for the wrong reason (404
     * route-not-found instead of 401/404 as intended).
     * ========================================================
     */

    /**
     * ========================================================
     * TEST 9 (NEW - NEGATIVE)
     *
     * Unauthenticated direct API request to the Notifications
     * endpoint should be rejected, not just the page redirect
     * already covered by Test 1.
     * ========================================================
     */
    test(
        'Unauthenticated request to the Notifications API is rejected',
        async ({ request }) => {

            // TODO: confirm the real notifications endpoint path with your
            // backend routes before running - this is inferred, not confirmed.
            const response = await request.get(
                'http://localhost:8500/api/v1/notifications'
            );

            expect(
                [401, 403]
            ).toContain(response.status());
        }
    );


    /**
     * ========================================================
     * TEST 10 (NEW - NEGATIVE)
     *
     * Marking all notifications as read when there are no
     * notifications present should not throw an error - the
     * button should either be safely disabled or the action
     * should complete silently without breaking the page.
     * ========================================================
     */
    test(
        'Marking all as read with no notifications does not break the page',
        async ({ page }) => {

            await login(page);

            await page.goto('/notifications');

            await page.waitForLoadState('networkidle');

            const noNotifications = page.getByRole('heading', {
                name: 'No new notifications',
                exact: true,
            });

            // Only meaningful when the empty state is genuinely present;
            // if notifications exist, this scenario does not apply for
            // this run and the test is skipped rather than forced to fail.
            test.skip(
                (await noNotifications.count()) === 0,
                'Skipping: notifications exist for this account, so the ' +
                'empty-state edge case does not apply for this run.'
            );

            const markAllButton = page.getByRole('button', {
                name: /mark all as read/i,
            });

            await expect(markAllButton).toBeVisible();

            await markAllButton.click();

            // Page must remain usable, not throw a client-side error
            await expect(page).toHaveURL(/notifications/i);

            await expect(
                page
                    .getByRole('main')
                    .getByRole('heading', { name: 'Notifications', exact: true })
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * TEST 11 (NEW - NEGATIVE)
     *
     * Attempting to mark a non-existent notification ID as read
     * should return a proper error response, not a server crash
     * (500) or a silent false-success.
     * ========================================================
     */
    test(
        'Marking a non-existent notification as read returns a proper error',
        async ({ request }) => {

            // TODO: confirm the real "mark as read" endpoint path and method
            // (PUT/PATCH) with your backend routes before running.
            const response = await request.put(
                'http://localhost:8500/api/v1/notifications/000000000000000000000000/read'
            );

            // Should be rejected as unauthenticated (401) and/or not found (404),
            // but must NOT be a 500 server error.
            expect(response.status()).not.toBe(500);

            expect(
                [401, 403, 404]
            ).toContain(response.status());
        }
    );

});