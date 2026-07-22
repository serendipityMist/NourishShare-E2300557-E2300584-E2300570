import { test, expect } from '@playwright/test';

test.describe('UC1 - User Login', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('Login page should display all required elements', async ({ page }) => {

        await expect(
            page.getByRole('heading', { name: 'Welcome Back' })
        ).toBeVisible();

        await expect(
            page.getByLabel('Email or Phone Number')
        ).toBeVisible();

        await expect(
            page.getByLabel('Password')
        ).toBeVisible();

        await expect(
            page.getByLabel('Keep me logged in')
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: /log in/i })
        ).toBeVisible();

        await expect(
            page.getByRole('link', { name: /forgot password/i })
        ).toBeVisible();

        await expect(
            page.getByRole('link', { name: /register your pantry/i })
        ).toBeVisible();
    });


    test('Login should show validation error when fields are empty', async ({ page }) => {

        await page.getByRole('button', { name: /log in/i }).click();

        await expect(
            page.getByText(
                'Please enter your email/phone and password.',
                { exact: true }
            )
        ).toBeVisible();
    });


    test('Login should show validation error when only email is entered', async ({ page }) => {

        await page.getByLabel('Email or Phone Number')
            .fill('test@example.com');

        await page.getByRole('button', { name: /log in/i }).click();

        await expect(
            page.getByText(
                'Please enter your email/phone and password.',
                { exact: true }
            )
        ).toBeVisible();
    });


    test('Login should show validation error when only password is entered', async ({ page }) => {

        await page.getByLabel('Password')
            .fill('Password123');

        await page.getByRole('button', { name: /log in/i }).click();

        await expect(
            page.getByText(
                'Please enter your email/phone and password.',
                { exact: true }
            )
        ).toBeVisible();
    });


    test('Login should show error for invalid credentials', async ({ page }) => {

        await page.getByLabel('Email or Phone Number')
            .fill('invalid@example.com');

        await page.getByLabel('Password')
            .fill('WrongPassword123');

        await page.getByRole('button', { name: /log in/i }).click();

        await expect(
            page.getByText(
                /user is not registered|login failed|password doesn't match/i
            )
        ).toBeVisible({ timeout: 10000 });
    });


    test('Password visibility toggle should work', async ({ page }) => {

        const passwordInput = page.getByLabel('Password');

        await passwordInput.fill('Password123');

        await expect(passwordInput)
            .toHaveAttribute('type', 'password');

        // Click visibility button
        await page.locator('button[type="button"]')
            .click();

        await expect(passwordInput)
            .toHaveAttribute('type', 'text');

        // Click again
        await page.locator('button[type="button"]')
            .click();

        await expect(passwordInput)
            .toHaveAttribute('type', 'password');
    });


    test('Forgot password link should navigate to forgot password page', async ({ page }) => {

        await page.getByRole('link', {
            name: /forgot password/i
        }).click();

        await expect(page)
            .toHaveURL(/forgot-password/);
    });


    test('Register link should navigate to registration page', async ({ page }) => {

        await page.getByRole('link', {
            name: /register your pantry/i
        }).click();

        await expect(page)
            .toHaveURL(/register/);
    });


    test('Remember me checkbox should be selectable', async ({ page }) => {

        const rememberCheckbox = page.getByLabel('Keep me logged in');

        await expect(rememberCheckbox)
            .not.toBeChecked();

        await rememberCheckbox.check();

        await expect(rememberCheckbox)
            .toBeChecked();

        await rememberCheckbox.uncheck();

        await expect(rememberCheckbox)
            .not.toBeChecked();
    });

});