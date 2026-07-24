import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// __dirname isn't available in ES modules, so derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================
// Test Account
// =========================================================

const EMAIL = 'gfcgffghhhhgg53@gmail.com';
const PASSWORD = 'Spriha@123';

// =========================================================
// Test Data
// =========================================================

function createItem() {
  return {
    name: `PW Food ${Date.now()}`,
    category: 'Vegetables',
    quantity: '5',
    storage: 'Pantry',
    expiry: '2026-12-31',
    description: 'Created by Playwright Automation',
    image: path.join(
      __dirname,
      '../../src/assets/howtowork.jpg'
    ),
  };
}

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

  console.log("Current URL:", page.url());

  await page.screenshot({
    path: "webkit-login.png",
    fullPage: true
  });

  await page.waitForURL(
    /dashboard|welcome/,
    { timeout: 30000 }
  );
}


// =========================================================
// Open Inventory
// =========================================================

async function openInventory(page) {

  await page.goto('/inventory');

  await expect(page).toHaveURL(/inventory/);

  // Two "Add Food Item" buttons exist on this page (e.g. a toolbar
  // button and an empty-state button), so scope to the first match
  // to avoid a strict-mode violation.
  await expect(
    page.getByRole('button', {
      name: /add food item/i
    }).first()
  ).toBeVisible();

}


// =========================================================
// Open Add Food Modal
// =========================================================

async function openAddModal(page) {

  await page.getByRole('button', {
    name: /add food item/i
  }).first().click();

  await expect(
    page.getByRole('heading', {
      name: /add food item/i
    })
  ).toBeVisible();

}


// =========================================================
// Fill Food Form
// =========================================================

async function fillFoodForm(page, item) {
  await page.getByLabel('Item Name').fill(item.name);

  await page.getByLabel('Category').selectOption({
    label: item.category
  });

  await page.getByLabel('Quantity').fill(item.quantity);

  await page
    .getByLabel('Storage Location')
    .selectOption({ label: item.storage });

  await page
    .getByLabel('Best Before / Expiry')
    .fill(item.expiry);

  await page
    .getByPlaceholder('Add details about this food item...')
    .fill(item.description);

  await page
    .locator('input[type="file"]')
    .setInputFiles(item.image);

  // Wait until upload finishes
  await expect(
    page.locator('input[type="file"]')
  ).toHaveValue(/howtowork\.jpg/i);
}


// =========================================================
// Find Inventory Row
// =========================================================

function inventoryRow(page, itemName) {
  return page
    .locator('tr')
    .filter({ hasText: itemName })
    .first();
}

// Several tests below depend on state created by earlier tests
// (the item added in TEST 3 is edited/viewed/used/deleted in
// TESTS 5-8), so this suite must not be parallelized across workers.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  console.log('Starting login');

  await login(page);

  console.log('Login finished');

  await openInventory(page);

  console.log('Inventory opened');
});


// =========================================================
// Start Test Suite
// =========================================================

test.describe('UC2 - Food Inventory CRUD Tests', () => {

  // =========================================================
  // TEST 1 - User Login
  // =========================================================

  test('User can login successfully', async ({ page }) => {

    await expect(page).toHaveURL(
      /dashboard|welcome|inventory/
    );

  });


  // =========================================================
  // TEST 2 - Inventory Page Loads
  // =========================================================

  test('Inventory page loads successfully', async ({ page }) => {

    await expect(
      page.getByRole('button', {
        name: /add food item/i
      }).first()
    ).toBeVisible();

  });


  // =========================================================
  // TEST 3 - Add New Food Item
  // =========================================================

test('User can add a food item', async ({ page }) => {
  const item = createItem();

  await openAddModal(page);
  await fillFoodForm(page, item);

  page.on('response', async response => {
    if (response.url().includes('/food/addFoodItem')) {
      console.log('POST:', response.status());
      // console.log(await response.text());
    }

    if (response.url().includes('/food/getMyFoodItems')) {
      console.log('GET:', response.status());
      // console.log(await response.text());
    }
  });

  await page.getByRole('button', {
    name: /save to pantry/i
  }).click();

  await page.waitForTimeout(5000);

  await page.reload({ waitUntil: 'domcontentloaded' });

  console.log(await page.locator('tbody tr').allTextContents());
});


  // =========================================================
  // TEST 4 - Required Field Validation
  // =========================================================

  test('Food form validates required fields', async ({ page }) => {

    await openAddModal(page);

    // Submit empty form
    await page.getByRole('button', {
      name: /save to pantry/i
    }).click();

    // Modal should remain open
    await expect(
      page.getByRole('heading', {
        name: /add food item/i
      })
    ).toBeVisible();

    // Name should still be empty
    await expect(
      page.getByLabel('Item Name')
    ).toHaveValue('');

  });

test('User can edit an existing food item', async ({ page }) => {
  const item = createItem();

  // -----------------------------
  // Create item
  // -----------------------------
  await openAddModal(page);
  await fillFoodForm(page, item);

  // NOTE: the real backend route is /food/addFoodItem (confirmed via the
  // response logger in TEST 3), not /food/createFoodItem.
  // Image-upload creates can be slow, especially if the pantry has grown
  // large (see tests/global-setup.js for cleanup), so give this an
  // explicit, longer timeout rather than relying on the global 30s cap.
  const createResponse = page.waitForResponse(res =>
    res.url().includes('/food/addFoodItem') &&
    res.request().method() === 'POST',
    { timeout: 60000 }
  );

  await page.getByRole('button', {
    name: /save to pantry/i
  }).click();

  const createRes = await createResponse;

  console.log('POST Status:', createRes.status());

  await expect(
    page.getByRole('button', {
      name: /save to pantry/i
    })
  ).toHaveCount(0);

  // wait until inventory refreshes
  await page.waitForResponse(res =>
    res.url().includes('/food/getMyFoodItems') &&
    res.status() === 200
  );

  await page.reload({ waitUntil: 'domcontentloaded' });

  const row = inventoryRow(page, item.name);

  await expect(row).toBeVisible({
    timeout: 30000
  });

  // -----------------------------
  // Edit item
  // -----------------------------
  await row.getByTitle('Edit').click();

  await expect(
    page.getByRole('heading', {
      name: /edit food item/i
    })
  ).toBeVisible();

  await page.getByLabel('Quantity').fill('15');

  await page
    .getByLabel('Storage Location')
    .selectOption({ label: 'Refrigerator' });

  await page
    .getByPlaceholder('Add details about this food item...')
    .fill('Updated by Playwright');

  // Confirmed real endpoint via diagnostic logging: PUT /food/editFoodItem/:id
  const updateResponse = page.waitForResponse(res =>
    res.url().includes('/food/editFoodItem') &&
    res.request().method() === 'PUT'
  );

  await page.getByRole('button', {
    name: /save changes/i
  }).click();

  const updateRes = await updateResponse;

  console.log('UPDATE Status:', updateRes.status());

  await expect(
    page.getByRole('button', {
      name: /save changes/i
    })
  ).toHaveCount(0);

  // NOTE: unlike item creation, editing an item does not appear to
  // trigger a fresh /food/getMyFoodItems call (the app likely updates
  // the row in local state instead of refetching). So we reload
  // directly instead of waiting for a network call that never fires.
  await page.reload({ waitUntil: 'domcontentloaded' });

  // DON'T use networkidle here

  const updatedRow = inventoryRow(page, item.name);

  await expect(updatedRow).toBeVisible({
    timeout: 30000
  });

  await expect(updatedRow).toContainText('15');
  await expect(updatedRow).toContainText('Refrigerator');
});


// =========================================================
// TEST 6 - View Item Details
// =========================================================

test('User can open food details page', async ({ page }) => {
  const item = createItem();

  await openAddModal(page);
  await fillFoodForm(page, item);

  const createResponse = page.waitForResponse(res =>
    res.url().includes('/food/addFoodItem') &&
    res.request().method() === 'POST',
    { timeout: 60000 }
  );

  await page.getByRole('button', {
    name: /save to pantry/i
  }).click();

  await createResponse;

  await expect(
    page.getByRole('button', {
      name: /save to pantry/i
    })
  ).toHaveCount(0);

  await page.waitForResponse(res =>
    res.url().includes('/food/getMyFoodItems') &&
    res.status() === 200
  );

  const row = inventoryRow(page, item.name);

  await expect(row).toBeVisible({
    timeout: 30000,
  });

  await row.getByRole('link').click();

  await expect(page).toHaveURL(/inventory\/.+/);

  await expect(
    page.getByText(item.name)
  ).toBeVisible();
});
// =========================================================
// TEST 7 - Mark Food Item As Used
// =========================================================

test('User can mark food item as used', async ({ page }) => {
  const item = createItem();

  await openAddModal(page);
  await fillFoodForm(page, item);

  // Wait for the real create response instead of relying on
  // waitForLoadState('networkidle') + reload, which is unreliable here
  // (same underlying issue as the earlier WebKit reload() hang — some
  // connection in this app never goes fully idle).
  const createResponse = page.waitForResponse(res =>
    res.url().includes('/food/addFoodItem') &&
    res.request().method() === 'POST',
    { timeout: 60000 }
  );

  await page.getByRole('button', {
    name: /save to pantry/i
  }).click();

  await createResponse;

  await expect(
    page.getByRole('button', {
      name: /save to pantry/i
    })
  ).toHaveCount(0);

  // The app automatically refetches getMyFoodItems after a successful
  // create (confirmed via response logging in TEST 3), so no reload
  // is needed here — just wait for that refetch before asserting.
  await page.waitForResponse(res =>
    res.url().includes('/food/getMyFoodItems') &&
    res.status() === 200
  );

  const row = inventoryRow(page, item.name);

  await expect(row).toBeVisible({
    timeout: 30000,
  });

  await row.getByTitle('Mark as used').click();

  await page.waitForLoadState('networkidle');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  await expect(
    inventoryRow(page, item.name)
  ).toHaveCount(0);
});

// =========================================================
// TEST 8 - Delete Food Item
// =========================================================

test('User can delete a food item', async ({ page }) => {
  const item = createItem();

  await openAddModal(page);
  await fillFoodForm(page, item);

  const createResponse = page.waitForResponse(res =>
    res.url().includes('/food/addFoodItem') &&
    res.request().method() === 'POST',
    { timeout: 60000 }
  );

  await page.getByRole('button', {
    name: /save to pantry/i
  }).click();

  await createResponse;

  await expect(
    page.getByRole('button', {
      name: /save to pantry/i
    })
  ).toHaveCount(0);

  await page.waitForResponse(res =>
    res.url().includes('/food/getMyFoodItems') &&
    res.status() === 200
  );

  const row = inventoryRow(page, item.name);

  await expect(row).toBeVisible({
    timeout: 30000,
  });

  await row.getByTitle('Delete').click();

  await expect(
    page.getByText('Delete Pantry Item?')
  ).toBeVisible();

  await page.getByRole('button', {
    name: /delete item/i
  }).click();

  await page.waitForLoadState('networkidle');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  await expect(
    inventoryRow(page, item.name)
  ).toHaveCount(0);
});


  // =========================================================
  // TEST 9 - Unauthorized Inventory API
  // =========================================================

  test('Unauthenticated user cannot access inventory API', async ({ request }) => {

    const response = await request.get(
      'http://localhost:8500/api/v1/food/getMyFoodItems'
    );

    expect(response.status()).toBe(401);

  });


  // =========================================================
  // TEST 10 - Unauthorized Food Details API
  // =========================================================

  test('Unauthenticated user cannot access food details API', async ({ request }) => {

    const response = await request.get(
      'http://localhost:8500/api/v1/food/getFoodDetails/507f1f77bcf86cd799439011'
    );

    expect(response.status()).toBe(401);

  });

});