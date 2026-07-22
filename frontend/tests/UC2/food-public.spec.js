import { test, expect } from '@playwright/test';

test.describe('UC2 - Food Inventory Public and Security Tests', () => {

  // =========================================================
  // TEST 1 - Food page should load successfully
  // =========================================================
  test('Food page loads successfully', async ({ page }) => {

    // Open the food page
    const response = await page.goto('/food');

    // Verify that the page responded
    expect(response).not.toBeNull();

    // Verify HTTP response is successful
    expect(response.status()).toBeLessThan(400);

    // Verify page is not completely blank
    await expect(page.locator('body')).not.toBeEmpty();

  });


  // =========================================================
  // TEST 2 - Unauthenticated user cannot access food API
  // =========================================================
  test('Unauthenticated user cannot access food inventory API', async ({ request }) => {

    // Call the protected food inventory API
    const response = await request.get(
      'http://localhost:8500/api/v1/food/getMyFoodItems'
    );

    // The API should reject unauthenticated users
    expect(response.status()).toBe(401);

  });


  // =========================================================
  // TEST 3 - Unauthenticated user cannot access food details API
  // =========================================================
  test('Unauthenticated user cannot access food details API', async ({ request }) => {

    // Use a dummy MongoDB ID
    const foodId = '507f1f77bcf86cd799439011';

    // Call the protected food details API
    const response = await request.get(
      `http://localhost:8500/api/v1/food/getFoodDetails/${foodId}`
    );

    // The API should reject unauthenticated users
    expect(response.status()).toBe(401);

  });

});

