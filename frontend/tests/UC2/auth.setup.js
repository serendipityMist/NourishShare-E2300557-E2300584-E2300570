import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

const TEST_USER_EMAIL = 'gfcgffghhhhgg53@gmail.com';
const TEST_USER_PASSWORD = 'Spriha@123';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder(/example@gmail.com/i).fill(TEST_USER_EMAIL);
  await page.locator('#login-password').fill(TEST_USER_PASSWORD);

  await page.getByRole('button', { name: /log in/i }).click();

  // Wait for redirect after successful login
  await page.waitForURL('**/dashboard');

  await page.context().storageState({ path: authFile });
});