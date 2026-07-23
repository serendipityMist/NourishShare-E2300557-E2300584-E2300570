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

const ITEM = {
  name: `PW Food ${Date.now()}`,
  category: 'Vegetables',
  quantity: '5',
  storage: 'Pantry',
  expiry: '2026-12-31',
  description: 'Created by Playwright Automation',
  image: path.join(
    __dirname,
    '../../src/assets/howtowork.jpg'
  )
};

// =========================================================
// Login Helper
// =========================================================

async function login(page) {

  await page.goto('/login');

  // Wait until page finishes loading
  await expect(
    page.getByRole('button', { name: /log in/i })
  ).toBeVisible();

  await page.getByLabel('Email or Phone Number')
    .fill(EMAIL);

  await page.getByLabel('Password')
    .fill(PASSWORD);

  await page.getByRole('button', {
    name: /log in/i
  }).click();

  // Successful login redirects here
  await page.waitForURL(
    /dashboard|welcome/,
    { timeout: 20000 }
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

async function fillFoodForm(page, item = ITEM) {

  await page.getByLabel('Item Name')
    .fill(item.name);

  await page.getByLabel('Category')
    .selectOption({
      label: item.category
    });

  await page.getByLabel('Quantity')
    .fill(item.quantity);

  // Storage Location is a <select> dropdown, not a text input
  await page.getByLabel('Storage Location')
    .selectOption({ label: item.storage });

  await page.getByLabel('Best Before / Expiry')
    .fill(item.expiry);

  // NOTE: the Description <label> in AddEditItemModal.jsx has no
  // htmlFor/id linking it to the <textarea> (a real accessibility bug
  // in the app), so getByLabel() can't find it. Using the placeholder
  // text as a workaround until that's fixed in the component.
  await page.getByPlaceholder('Add details about this food item...')
    .fill(item.description);

  await page
    .locator('input[type="file"]')
    .setInputFiles(item.image);

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
  await login(page);
  await openInventory(page);
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

    await openAddModal(page);

    await fillFoodForm(page);

    await page.getByRole('button', {
      name: /save to pantry/i
    }).click();

    // Wait until modal disappears
    await expect(
      page.getByRole('button', {
        name: /save to pantry/i
      })
    ).toBeHidden();

    // Verify item exists in inventory
    await expect(
      inventoryRow(page, ITEM.name)
    ).toBeVisible();

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

  // =========================================================
  // TEST 5 - Edit Food Item
  // =========================================================

  test('User can edit an existing food item', async ({ page }) => {

    // Create item if it doesn't exist (e.g. running this test in isolation)
    if (await inventoryRow(page, ITEM.name).count() === 0) {

      await openAddModal(page);

      await fillFoodForm(page);

      await page.getByRole('button', {
        name: /save to pantry/i
      }).click();

      await expect(
        inventoryRow(page, ITEM.name)
      ).toBeVisible();
    }

    const row = inventoryRow(page, ITEM.name);

    await row.getByTitle('Edit').click();

    await expect(
      page.getByRole('heading', {
        name: /edit food item/i
      })
    ).toBeVisible();

    // Update quantity
    const quantityInput = page.getByLabel('Quantity');

    await quantityInput.fill('15');

    console.log(
      'Quantity before save:',
      await quantityInput.inputValue()
    );

    await expect(quantityInput).toHaveValue('15');

    // Update storage
    await page
      .getByLabel('Storage Location')
      .selectOption({ label: 'Refrigerator' });

    // Update description
    await page
      .getByPlaceholder('Add details about this food item...')
      .fill('Updated by Playwright');

    // Save
    await page.getByRole('button', {
      name: /save changes/i
    }).click();

    // Wait for modal to close
    await expect(
      page.getByRole('button', {
        name: /save changes/i
      })
    ).toHaveCount(0);

    console.log(
      'Row after save:',
      await inventoryRow(page, ITEM.name).innerText()
    );

    // Verify that the item still exists after editing
    await expect(
      inventoryRow(page, ITEM.name)
    ).toBeVisible();

  });


  // =========================================================
  // TEST 6 - View Item Details
  // =========================================================

  test('User can open food details page', async ({ page }) => {

    const row = inventoryRow(page, ITEM.name);

    await expect(row).toBeVisible();

    // Click item name
    await row.getByRole('link').click();

    // Verify URL
    await expect(page).toHaveURL(/inventory\/.+/);

    // Verify page loaded
    await expect(
      page.locator('body')
    ).not.toBeEmpty();

    // Item name should appear
    await expect(
      page.getByText(ITEM.name)
    ).toBeVisible();

  });


  // =========================================================
  // TEST 7 - Mark Food Item As Used
  // =========================================================

 test('User can mark food item as used', async ({ page }) => {
  const row = inventoryRow(page, ITEM.name);

  await expect(row).toBeVisible();

  await row
    .getByTitle('Mark as used')
    .click();

  // Wait for the item to be removed from activeItems
  await expect(
    inventoryRow(page, ITEM.name)
  ).toHaveCount(0);
});

  // =========================================================
  // TEST 8 - Delete Food Item
  // =========================================================

  test('User can delete a food item', async ({ page }) => {

    const row = inventoryRow(page, ITEM.name);

    await expect(row).toBeVisible();

    // Click delete
    await row.getByTitle('Delete').click();

    // Delete confirmation dialog
    await expect(
      page.getByText('Delete Pantry Item?')
    ).toBeVisible();

    // Confirm delete
    await page.getByRole('button', {
      name: /delete item/i
    }).click();

    // Wait until row disappears
    await expect(
      inventoryRow(page, ITEM.name)
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