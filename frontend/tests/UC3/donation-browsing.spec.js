import { test, expect } from '@playwright/test';

// =========================================================
// Test Account
// =========================================================
// Reused from UC2 so this suite can log in the same way.
const EMAIL = 'gfcgffghhhhgg53@gmail.com';
const PASSWORD = 'Spriha@123';

// =========================================================
// Login Helper
// =========================================================
async function login(page) {
  await page.goto('/login');

  await expect(
    page.getByRole('button', { name: /log in/i })
  ).toBeVisible();

  await page.getByLabel('Email or Phone Number').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /log in/i }).click(),
  ]);

  await page.waitForURL(/dashboard|welcome/, { timeout: 30000 });
}

test.describe('UC3 - Browse Public Donations', () => {

  // =========================================================
  // TEST 1
  // Public Donations API can be accessed without login
  // =========================================================
  test('Unauthenticated user can access public donations API', async ({
    request
  }) => {
    const response = await request.get(
      'http://localhost:8500/api/v1/donation/publicDonations'
    );
    // API should be accessible without authentication
    expect(response.status()).toBe(200);
    // Check response body
    const responseBody = await response.json();
    console.log('Public Donations Response:', responseBody);
    // Verify API response exists
    expect(responseBody).toBeTruthy();
  });

  // =========================================================
  // TEST 2
  // Public Donations API returns donation data
  // =========================================================
  test('Public donations API returns donation data successfully', async ({
    request
  }) => {
    const response = await request.get(
      'http://localhost:8500/api/v1/donation/publicDonations'
    );
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(
      'Donation API Data:',
      responseBody.data
    );
    // Verify response has data
    expect(responseBody).toHaveProperty('data');
  });

  // =========================================================
  // TEST 3
  // Donation browsing page requires login
  // (matches current App.jsx: /donations is wrapped in ProtectedRoute,
  // even though the underlying API is public — so the frontend page
  // itself is only reachable once authenticated.)
  // =========================================================
  test('Logged-in user can access the donation browsing page', async ({
    page
  }, testInfo) => {
    await login(page);

    await page.goto('/donations', { waitUntil: 'domcontentloaded' });

    // NOTE: waitForLoadState('networkidle') is unreliable in this app
    // (same issue seen in UC2 — some connection never goes fully idle,
    // so this times out on every browser). Wait for the URL to settle
    // and something concrete on the page instead.
    //
    // TODO: replace this selector with something that actually exists
    // on your BrowseDonations page — e.g. a heading, a donation card,
    // or an empty-state message. Using the URL alone below as a
    // placeholder gate; tighten this once you confirm the real markup.
    await expect(page).toHaveURL(/donations/i);

    // Attach via testInfo instead of page.screenshot({ path }) so this
    // shows up in the HTML report's Attachments panel, not just as a
    // loose file on disk.
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('donations-logged-in', {
      body: screenshot,
      contentType: 'image/png',
    });
  });

  // =========================================================
  // TEST 4 (NEW)
  // Unauthenticated visit to the donation browsing page redirects
  // to login, documenting the current ProtectedRoute behavior.
  // If /donations is later made public in App.jsx, this test should
  // be updated (or removed) to match the new expected behavior.
  // =========================================================
  test('Unauthenticated user is redirected to login from the donation page', async ({
    page
  }, testInfo) => {
    await page.goto('/donations', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/login/i);

    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('donations-unauthenticated-redirect', {
      body: screenshot,
      contentType: 'image/png',
    });
  });

});