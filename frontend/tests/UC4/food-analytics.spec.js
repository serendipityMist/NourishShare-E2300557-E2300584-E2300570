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
 * API TRAFFIC HELPER
 *
 * Collects real XHR/fetch requests made by the Analytics page.
 *
 * NOTE:
 * - Call this AFTER any navigation you don't care about (e.g. after
 *   login() has fully settled) so you don't pick up stray in-flight
 *   requests from the previous page that get canceled/aborted when
 *   the next page.goto() fires. Canceled requests are a common
 *   source of browser-specific (esp. Firefox/WebKit) flakiness.
 * - Also tracks genuinely failed/aborted requests separately via
 *   'requestfailed', so a network-level abort can be told apart
 *   from an HTTP response with a bad status code.
 * ============================================================
 */
function collectApiTraffic(page) {
    const requests = [];
    const responses = [];
    const failedRequests = [];

    page.on('request', request => {
        const resourceType = request.resourceType();

        if (
            resourceType === 'xhr' ||
            resourceType === 'fetch'
        ) {
            requests.push({
                method: request.method(),
                url: request.url(),
            });
        }
    });

    page.on('response', response => {
        const request = response.request();

        const resourceType = request.resourceType();

        if (
            resourceType === 'xhr' ||
            resourceType === 'fetch'
        ) {
            responses.push({
                status: response.status(),
                method: request.method(),
                url: response.url(),
            });
        }
    });

    page.on('requestfailed', request => {
        const resourceType = request.resourceType();

        if (
            resourceType === 'xhr' ||
            resourceType === 'fetch'
        ) {
            failedRequests.push({
                method: request.method(),
                url: request.url(),
                failure: request.failure()?.errorText ?? 'unknown',
            });
        }
    });

    return {
        requests,
        responses,
        failedRequests,
    };
}


/**
 * ============================================================
 * UC4 - FOOD ANALYTICS
 * ============================================================
 */
test.describe('UC4 - Food Analytics', () => {

    /**
     * ========================================================
     * Increase the per-test timeout for this whole file.
     *
     * Chart.js's ResizeObserver/requestAnimationFrame loop on
     * the analytics canvases can keep Firefox's automation
     * driver busy for a few extra seconds during context
     * teardown, even after the page has navigated away (see
     * the afterEach below). Rather than fight browser-internal
     * cleanup timing, give teardown a larger budget than the
     * default 60s so a slow-but-successful close doesn't get
     * reported as a failure.
     * ========================================================
     */
    test.slow();


    /**
     * ========================================================
     * AFTERECH: Force navigation away from the Analytics page
     * before context teardown.
     *
     * Chart.js registers a ResizeObserver on its <canvas> that
     * drives an internal _refresh -> requestAnimationFrame loop.
     * If a test ends while still on /analytics, that loop can
     * still be active when Playwright tries to close the browser
     * context, causing "Tearing down context exceeded the test
     * timeout" (seen on Firefox/WebKit in particular).
     *
     * Navigating to about:blank forces React to unmount
     * FoodAnalytics, which runs its existing useEffect cleanup
     * (chartInstance.current?.destroy()) and disconnects the
     * ResizeObserver before teardown begins. No app code changes
     * needed - this only ensures the app's own cleanup gets a
     * chance to run before the test ends.
     * ========================================================
     */
    test.afterEach(async ({ page }) => {
        await page.goto('about:blank');
    });


    /**
     * ========================================================
     * TEST 1
     *
     * Unauthenticated users cannot access Analytics.
     * ========================================================
     */
    test(
        'Unauthenticated user is redirected to login from Food Analytics',
        async ({ page }) => {

            await page.goto('/analytics');

            await expect(page).toHaveURL(/login/i);
        }
    );


    /**
     * ========================================================
     * TEST 2
     *
     * Authenticated user can access Analytics.
     * ========================================================
     */
    test(
        'Authenticated user can access Food Analytics',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await expect(page).toHaveURL(/analytics/i);

            await expect(
                page.getByRole('main')
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * TEST 3
     *
     * Verify the Analytics page makes real backend requests.
     *
     * This is functional/API-flow testing, not just UI testing.
     * ========================================================
     */
    test(
        'Food Analytics requests data from the backend',
        async ({ page }) => {

            await login(page);

            const apiTraffic =
                collectApiTraffic(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            expect(
                apiTraffic.requests.length
            ).toBeGreaterThan(0);

            console.log(
                'Analytics API requests:',
                apiTraffic.requests
            );

            console.log(
                'Analytics API responses:',
                apiTraffic.responses
            );
        }
    );


    /**
     * ========================================================
     * TEST 4
     *
     * Verify backend requests return successful responses.
     *
     * FIX:
     * - Listeners are attached AFTER login() has fully settled,
     *   instead of before, so we don't capture requests from the
     *   dashboard page that get canceled/aborted when we navigate
     *   to /analytics (a common source of Firefox/WebKit flakiness).
     * - 304 Not Modified is treated as a success (it's a valid
     *   conditional-cache response, not a failure), since Firefox's
     *   HTTP cache is more likely than Chromium's to produce these.
     * - requestfailed events are captured and logged separately so
     *   a genuine network abort is distinguishable from a bad
     *   HTTP status if this ever fails again.
     * ========================================================
     */
    test(
        'Food Analytics backend requests return successful responses',
        async ({ page }) => {

            await login(page);

            const apiTraffic =
                collectApiTraffic(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            expect(
                apiTraffic.responses.length
            ).toBeGreaterThan(0);

            const failedResponses =
                apiTraffic.responses.filter(
                    response =>
                        response.status < 200 ||
                        (response.status >= 300 && response.status !== 304)
                );

            console.log(
                'Failed API responses:',
                failedResponses
            );

            console.log(
                'Failed/aborted requests:',
                apiTraffic.failedRequests
            );

            expect(
                failedResponses,
                `Failed API responses:\n${JSON.stringify(
                    failedResponses,
                    null,
                    2
                )}\n\nAborted/failed requests:\n${JSON.stringify(
                    apiTraffic.failedRequests,
                    null,
                    2
                )}`
            ).toHaveLength(0);
        }
    );


    /**
     * ========================================================
     * TEST 5
     *
     * Verify Analytics contains actual information.
     * ========================================================
     */
    test(
        'Food Analytics displays information after loading data',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();

            const content =
                await main.innerText();

            console.log(
                'Analytics page content:',
                content
            );

            expect(
                content.trim().length
            ).toBeGreaterThan(0);

            expect(
                /food|saved|donat|used|impact|progress|report|analytic/i
                    .test(content)
            ).toBeTruthy();
        }
    );


    /**
     * ========================================================
     * TEST 6
     *
     * UC4 requires:
     *
     * - Total food saved from waste
     * - Number of donations made
     * ========================================================
     */
    test(
        'Food Analytics displays food-saving and donation information',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();

            const content =
                await main.innerText();

            /*
             * Your actual page contains information such as:
             *
             * TOTAL SAVED
             * DONATED
             * USED AT HOME
             * DONATION RATE
             */

            expect(
                /saved/i.test(content)
            ).toBeTruthy();

            expect(
                /donat/i.test(content)
            ).toBeTruthy();
        }
    );


    /**
     * ========================================================
     * TEST 7
     *
     * UC4 requires visual reports.
     *
     * Your actual page renders charts using canvas.
     * ========================================================
     */
    test(
        'Food Analytics displays visual reporting elements',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();

            const svgCount =
                await main.locator('svg').count();

            const canvasCount =
                await main.locator('canvas').count();

            const progressCount =
                await main
                    .getByRole('progressbar')
                    .count();

            console.log({
                svgCount,
                canvasCount,
                progressCount,
            });

            /*
             * Your actual implementation uses canvas
             * for the analytics charts.
             */
            expect(
                svgCount +
                canvasCount +
                progressCount
            ).toBeGreaterThan(0);
        }
    );


    /**
     * ========================================================
     * TEST 8
     *
     * Verify the actual Analytics filtering controls.
     *
     * Actual page:
     *
     * 7d
     * 30d
     * 6mo
     * Category select
     * ========================================================
     */
    test(
        'Food Analytics provides report filtering controls',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();


            /*
             * ------------------------------------------------
             * PERIOD FILTERS
             * ------------------------------------------------
             */

            const sevenDays =
                main.getByRole('button', {
                    name: '7d',
                    exact: true,
                });

            const thirtyDays =
                main.getByRole('button', {
                    name: '30d',
                    exact: true,
                });

            const sixMonths =
                main.getByRole('button', {
                    name: '6mo',
                    exact: true,
                });


            await expect(sevenDays).toBeVisible();

            await expect(thirtyDays).toBeVisible();

            await expect(sixMonths).toBeVisible();


            /*
             * ------------------------------------------------
             * CATEGORY FILTER
             * ------------------------------------------------
             */

            const categoryFilter =
                main.locator('select').first();

            await expect(
                categoryFilter
            ).toBeVisible();


            /*
             * Verify category options.
             */

            const options =
                categoryFilter.locator('option');

            const optionCount =
                await options.count();

            expect(
                optionCount
            ).toBeGreaterThan(1);


            const optionTexts =
                await options.allTextContents();

            console.log(
                'Category options:',
                optionTexts
            );


            expect(
                optionTexts.some(
                    text =>
                        /all categories/i.test(text)
                )
            ).toBeTruthy();


            expect(
                optionTexts.some(
                    text =>
                        /vegetables/i.test(text)
                )
            ).toBeTruthy();
        }
    );


    /**
     * ========================================================
     * TEST 9
     *
     * User can change report period.
     * ========================================================
     */
    test(
        'User can change the analytics report period',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();


            const thirtyDays =
                main.getByRole('button', {
                    name: '30d',
                    exact: true,
                });


            await expect(
                thirtyDays
            ).toBeVisible();


            await expect(
                thirtyDays
            ).toBeEnabled();


            /*
             * Change report period.
             */
            await thirtyDays.click();


            /*
             * Page must remain functional.
             */
            await expect(main).toBeVisible();


            const content =
                await main.innerText();


            expect(
                content.trim().length
            ).toBeGreaterThan(0);


            expect(
                /saved|donat|used|impact|category|trend/i
                    .test(content)
            ).toBeTruthy();
        }
    );


    /**
     * ========================================================
     * TEST 10
     *
     * User can filter analytics by category.
     * ========================================================
     */
    test(
        'User can filter analytics by food category',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();


            /*
             * Find the real native select.
             */
            const categoryFilter =
                main.locator('select').first();


            await expect(
                categoryFilter
            ).toBeVisible();


            /*
             * Verify Vegetables exists.
             */
            const vegetables =
                categoryFilter
                    .locator('option')
                    .filter({
                        hasText: 'Vegetables',
                    });


            await expect(
                vegetables
            ).toHaveCount(1);


            /*
             * Select Vegetables.
             */
            await categoryFilter.selectOption({
                label: 'Vegetables',
            });


            /*
             * Verify selection.
             */
            const selectedValue =
                await categoryFilter.inputValue();


            expect(
                selectedValue
            ).not.toBe('');


            console.log(
                'Selected category:',
                selectedValue
            );


            /*
             * Page should remain usable.
             */
            await expect(main).toBeVisible();


            const content =
                await main.innerText();


            expect(
                content.trim().length
            ).toBeGreaterThan(0);
        }
    );


    /**
     * ========================================================
     * TEST 11
     *
     * Apply multiple filters.
     *
     * Period + Category.
     * ========================================================
     */
    test(
        'Analytics report remains functional after applying filters',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();


            /*
             * -----------------------------------------------
             * STEP 1
             * Change period to 7 days.
             * -----------------------------------------------
             */

            const sevenDays =
                main.getByRole('button', {
                    name: '7d',
                    exact: true,
                });


            await expect(
                sevenDays
            ).toBeVisible();


            await sevenDays.click();


            /*
             * -----------------------------------------------
             * STEP 2
             * Change category to Vegetables.
             * -----------------------------------------------
             */

            const categoryFilter =
                main.locator('select').first();


            await expect(
                categoryFilter
            ).toBeVisible();


            await categoryFilter.selectOption({
                label: 'Vegetables',
            });


            /*
             * Allow React to update.
             */
            await page.waitForTimeout(500);


            /*
             * -----------------------------------------------
             * STEP 3
             * Verify Analytics is still functional.
             * -----------------------------------------------
             */

            await expect(
                main
            ).toBeVisible();


            const content =
                await main.innerText();


            expect(
                content.trim().length
            ).toBeGreaterThan(0);


            expect(
                /saved|donat|used|impact|category|trend/i
                    .test(content)
            ).toBeTruthy();


            /*
             * Verify category remains selected.
             */
            const selectedCategory =
                await categoryFilter.inputValue();


            expect(
                selectedCategory
            ).not.toBe('');
        }
    );


    /**
     * ========================================================
     * TEST 12
     *
     * Verify Analytics survives a browser refresh.
     * ========================================================
     */
    test(
        'Food Analytics remains available after refresh',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await expect(
                page
            ).toHaveURL(/analytics/i);


            await page.reload();

            await page.waitForLoadState('networkidle');


            await expect(
                page
            ).toHaveURL(/analytics/i);


            await expect(
                page.getByRole('main')
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * TEST 13
     *
     * User can navigate away and return.
     * ========================================================
     */
    test(
        'User can leave and return to Food Analytics',
        async ({ page }) => {

            await login(page);


            /*
             * Open Analytics.
             */
            await page.goto('/analytics');

            await expect(
                page
            ).toHaveURL(/analytics/i);


            /*
             * Leave Analytics.
             */
            await page.goto('/dashboard');

            await expect(
                page
            ).toHaveURL(/dashboard/i);


            /*
             * Return to Analytics.
             */
            await page.goto('/analytics');

            await expect(
                page
            ).toHaveURL(/analytics/i);


            await expect(
                page.getByRole('main')
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * TEST 14
     *
     * Verify analytics data contains the actual metrics
     * displayed by the application.
     *
     * Your current page displays:
     *
     * - TOTAL SAVED
     * - DONATED
     * - USED AT HOME
     * - DONATION RATE
     * ========================================================
     */
    test(
        'Food Analytics displays the main impact metrics',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();


            const content =
                await main.innerText();


            /*
             * Main metric labels.
             */
            expect(
                /total saved/i.test(content)
            ).toBeTruthy();


            expect(
                /donated/i.test(content)
            ).toBeTruthy();


            expect(
                /used at home/i.test(content)
            ).toBeTruthy();


            expect(
                /donation rate/i.test(content)
            ).toBeTruthy();
        }
    );


    /**
     * ========================================================
     * TEST 15
     *
     * Verify category analytics information exists.
     * ========================================================
     */
    test(
        'Food Analytics displays category information',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();


            const content =
                await main.innerText();


            /*
             * UC4 supports reporting by category.
             */
            expect(
                /by category/i.test(content)
            ).toBeTruthy();


            /*
             * At least one real category should appear.
             */
            expect(
                /vegetables|grains|dairy|beverages|meat/i
                    .test(content)
            ).toBeTruthy();
        }
    );


    /**
     * ========================================================
     * TEST 16
     *
     * Verify the community/donation impact section.
     * ========================================================
     */
    test(
        'Food Analytics displays donation impact information',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            const main =
                page.getByRole('main');

            await expect(main).toBeVisible();


            const content =
                await main.innerText();


            expect(
                /community|pickup|claim|donation/i.test(
                    content
                )
            ).toBeTruthy();
        }
    );


    /**
     * ========================================================
     * NEW NEGATIVE TEST CASES (TESTS 17-19)
     *
     * NOTE: There is no dedicated /analytics API endpoint - the
     * Analytics page computes its metrics client-side from the
     * user's food item data (the same data returned by the
     * inventory endpoint, e.g. /food/getMyFoodItems). Test 17
     * below therefore does NOT hit a separate "analytics" route;
     * instead it intercepts whatever request the Analytics page
     * actually makes for that underlying food-item data and
     * forces it to fail, to verify the page degrades gracefully
     * (rather than crashing to a blank/broken screen) when its
     * data source is unavailable.
     * ========================================================
     */

    /**
     * ========================================================
     * TEST 17 (NEW - NEGATIVE)
     *
     * If the backend request the Analytics page depends on
     * (its food-item data source) fails, the page should show
     * a safe/degraded state - not crash to a blank screen or
     * throw an unhandled client-side error.
     * ========================================================
     */
    test(
        'Food Analytics handles a backend data-fetch failure gracefully',
        async ({ page }) => {

            await login(page);

            // IMPORTANT: scope the intercept precisely to the real backend
            // API host/port (localhost:8500) AND only XHR/fetch requests -
            // NOT '**/*food*', which would also match static assets or JS
            // chunk files served from the frontend dev server (e.g. Vite
            // may bundle foodService.js into its own chunk such as
            // 'foodService-x7f2a1.js'). Intercepting and corrupting a JS
            // chunk instead of an API call would crash the whole app
            // before it even mounts, producing a false failure that looks
            // like a graceful-degradation bug but is actually a test bug.
            await page.route('**/*', async route => {
                const request = route.request();
                const url = request.url();
                const resourceType = request.resourceType();

                const isBackendApiCall =
                    url.startsWith('http://localhost:8500/api/v1/food/') &&
                    (resourceType === 'xhr' || resourceType === 'fetch');

                if (isBackendApiCall) {
                    await route.fulfill({
                        status: 500,
                        contentType: 'application/json',
                        body: JSON.stringify({ message: 'Simulated server error' }),
                    });
                    return;
                }

                // Everything else (JS/CSS chunks, other APIs, images, etc.)
                // passes through untouched.
                await route.continue();
            });

            await page.goto('/analytics');

            await page.waitForLoadState('networkidle');

            // The page itself must still render - not a blank/white screen -
            // even though its underlying data request failed.
            const main = page.getByRole('main');

            await expect(main).toBeVisible();

            // Verify no unhandled client-side crash occurred: the page
            // should still contain SOME content (an error message, an
            // empty state, or the static page chrome), not be empty.
            const content = await main.innerText();

            expect(content.trim().length).toBeGreaterThan(0);
        }
    );


    /**
     * ========================================================
     * TEST 18 (NEW - NEGATIVE)
     *
     * Analytics page should not crash when loaded with an
     * invalid/unsupported "period" value in the URL - it should
     * fall back to a valid default rather than showing a blank
     * or broken page.
     * ========================================================
     */
    test(
        'Food Analytics handles an invalid period query parameter gracefully',
        async ({ page }) => {

            await login(page);

            // Deliberately malformed/unsupported period value
            await page.goto('/analytics?period=not-a-real-period');

            await page.waitForLoadState('networkidle');

            const main = page.getByRole('main');

            // Page must still render, not crash to a blank/error screen
            await expect(main).toBeVisible();

            const content = await main.innerText();

            expect(content.trim().length).toBeGreaterThan(0);

            // One of the real, default period buttons should still be visible
            await expect(
                main.getByRole('button', { name: '7d', exact: true })
            ).toBeVisible();
        }
    );


    /**
     * ========================================================
     * TEST 19 (NEW - NEGATIVE)
     *
     * Analytics page should not crash when loaded with an
     * invalid/unsupported "category" value in the URL.
     * ========================================================
     */
    test(
        'Food Analytics handles an invalid category query parameter gracefully',
        async ({ page }) => {

            await login(page);

            await page.goto('/analytics?category=not-a-real-category');

            await page.waitForLoadState('networkidle');

            const main = page.getByRole('main');

            await expect(main).toBeVisible();

            // The category dropdown should still show the real, valid options
            const categoryFilter = main.locator('select').first();

            await expect(categoryFilter).toBeVisible();

            const optionTexts = await categoryFilter
                .locator('option')
                .allTextContents();

            expect(
                optionTexts.some(text => /all categories/i.test(text))
            ).toBeTruthy();
        }
    );

});