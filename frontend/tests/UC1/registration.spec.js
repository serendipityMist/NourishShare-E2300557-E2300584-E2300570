import { test, expect } from '@playwright/test';

test.describe('UC1 - User Registration', () => {

    test('Registration page displays all required fields', async ({ page }) => {

        // Navigate to the registration page
        await page.goto('http://localhost:5173/register');

        // Check page title/header
        await expect(
            page.getByRole('heading', { name: 'Create Account' })
        ).toBeVisible();

        // Check Full Name field
        await expect(
            page.getByLabel('Full Name', { exact: true })
        ).toBeVisible();

        // Check Phone Number field
        await expect(
            page.getByLabel('Phone Number', { exact: true })
        ).toBeVisible();

        // Check Email Address field
        await expect(
            page.getByLabel('Email Address', { exact: true })
        ).toBeVisible();

        // Check Password field
        // exact: true is important because
        // "Password" and "Confirm Password" are both present
        await expect(
            page.getByLabel('Password', { exact: true })
        ).toBeVisible();

        // Check Confirm Password field
        await expect(
            page.getByLabel('Confirm Password', { exact: true })
        ).toBeVisible();

        // Check Address field
        await expect(
            page.getByLabel('Address', { exact: true })
        ).toBeVisible();

        // Check Age field
        await expect(
            page.getByLabel('Age', { exact: true })
        ).toBeVisible();

        // Check Household Size field
        await expect(
            page.getByLabel('Household Size', { exact: true })
        ).toBeVisible();

        // Check Gender field
        await expect(
            page.getByText('Gender', { exact: true })
        ).toBeVisible();

        // Check Occupation field
        await expect(
            page.getByLabel('Occupation', { exact: true })
        ).toBeVisible();

        // Check Malaysian Resident checkbox
        await expect(
            page.getByText('I am a Malaysian resident', { exact: true })
        ).toBeVisible();

        // Check Two-Factor Authentication option
        await expect(
            page.getByText('Enable Two-Factor Authentication', { exact: true })
        ).toBeVisible();

        // Check Profile Photo section
        await expect(
            page.getByText('Profile Photo', { exact: true })
        ).toBeVisible();

        // Check Terms of Service and Privacy Policy text
        await expect(
            page.getByText('Terms of Service', { exact: true })
        ).toBeVisible();

        await expect(
            page.getByText('Privacy Policy', { exact: true })
        ).toBeVisible();

        // Check Continue button
        await expect(
            page.getByRole('button', { name: 'Continue' })
        ).toBeVisible();

        // Check login link
        await expect(
            page.getByRole('link', { name: 'Sign In Here' })
        ).toBeVisible();

    });


    test('Registration shows validation errors when required fields are missing', async ({ page }) => {

        // Navigate to registration page
        await page.goto('http://localhost:5173/register');

        // Click Continue without entering any information
        await page.getByRole('button', { name: 'Continue' }).click();

        // Check Full Name validation error
        await expect(
            page.getByText('Please complete all required fields', { exact: true })
        ).toBeVisible();

        // Check phone validation error
        await expect(
            page.getByText('Enter a valid phone number', { exact: true })
        ).toBeVisible();

        // Check email validation error
        await expect(
            page.getByText('Enter a valid email address', { exact: true })
        ).toBeVisible();

        // Check password validation error
        await expect(
            page.locator('span.text-error', { hasText: 'Password must be at least 8 characters' })
        ).toBeVisible();

        // Check confirm password validation error
        // Confirm password is empty, so the password mismatch
        // validation should not appear
        await expect(
            page.getByText('Passwords do not match', { exact: true })
        ).not.toBeVisible();

        // Check address validation error
        await expect(
            page.getByText('Address is required', { exact: true })
        ).toBeVisible();

        // Check age validation error
        await expect(
            page.getByText('Enter a valid age', { exact: true })
        ).toBeVisible();

        // Check gender validation error
        await expect(
            page.getByText('Please select a gender', { exact: true })
        ).toBeVisible();

        // Check occupation validation error
        await expect(
            page.getByText('Occupation is required', { exact: true })
        ).toBeVisible();

        // Check household size validation error
        await expect(
            page.getByText('Enter a valid household size', { exact: true })
        ).toBeVisible();

        // Check profile photo validation error
        await expect(
            page.getByText('Please upload a profile photo', { exact: true })
        ).toBeVisible();

        // Check Terms and Privacy Policy validation error
        await expect(
            page.getByText(
                'Please accept the Terms of Service and Privacy Policy',
                { exact: true }
            )
        ).toBeVisible();

    });


    test('Registration validates invalid email address', async ({ page }) => {

        // Navigate to registration page
        await page.goto('http://localhost:5173/register');

        // Enter invalid email
        await page.getByLabel('Email Address', { exact: true })
            .fill('invalid-email');

        // Fill password
        await page.getByLabel('Password', { exact: true })
            .fill('Password123');

        // Fill confirm password
        await page.getByLabel('Confirm Password', { exact: true })
            .fill('Password123');

        // Click Continue
        await page.getByRole('button', { name: 'Continue' }).click();

        // Check email validation error
        await expect(
            page.getByText('Enter a valid email address', { exact: true })
        ).toBeVisible();

    });


    test('Registration validates password confirmation', async ({ page }) => {

        // Navigate to registration page
        await page.goto('http://localhost:5173/register');

        // Enter password
        await page.getByLabel('Password', { exact: true })
            .fill('Password123');

        // Enter different confirm password
        await page.getByLabel('Confirm Password', { exact: true })
            .fill('DifferentPassword123');

        // Click Continue
        await page.getByRole('button', { name: 'Continue' }).click();

        // Check password mismatch error
        await expect(
            page.getByText('Passwords do not match', { exact: true })
        ).toBeVisible();

    });


    test('Registration requires Terms of Service and Privacy Policy agreement', async ({ page }) => {

        // Navigate to registration page
        await page.goto('http://localhost:5173/register');

        // Fill valid basic information
        await page.getByLabel('Full Name', { exact: true })
            .fill('Test User');

        await page.getByLabel('Phone Number', { exact: true })
            .fill('+60123456789');

        await page.getByLabel('Email Address', { exact: true })
            .fill('testuser@example.com');

        await page.getByLabel('Password', { exact: true })
            .fill('Password123');

        await page.getByLabel('Confirm Password', { exact: true })
            .fill('Password123');

        await page.getByLabel('Address', { exact: true })
            .fill('Kuala Lumpur');

        await page.getByLabel('Age', { exact: true })
            .fill('25');

        await page.getByLabel('Household Size', { exact: true })
            .fill('4');

        await page.getByLabel('Occupation', { exact: true })
            .fill('Student');

        // Select gender
        await page.locator('select').selectOption('Male');

        // Upload profile photo
        await page.locator('input[type="file"]').setInputFiles({
            name: 'profile.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake image content'),
        });

        // Do NOT accept Terms and Privacy Policy

        // Click Continue
        await page.getByRole('button', { name: 'Continue' }).click();

        // Check Terms validation error
        await expect(
            page.getByText(
                'Please accept the Terms of Service and Privacy Policy',
                { exact: true }
            )
        ).toBeVisible();

    });


    test('User can accept Terms and Privacy Policy', async ({ page }) => {

        // Navigate to registration page
        await page.goto('http://localhost:5173/register');

        // Find Terms checkbox
        const termsCheckbox = page.locator('#tos');

        // Verify checkbox is initially unchecked
        await expect(termsCheckbox).not.toBeChecked();

        // Check Terms and Privacy Policy
        await termsCheckbox.check();

        // Verify checkbox is checked
        await expect(termsCheckbox).toBeChecked();

    });


    test('User can enable Two-Factor Authentication during registration', async ({ page }) => {

        // Navigate to registration page
        await page.goto('http://localhost:5173/register');

        // Find the 2FA checkbox
        const twoFACheckbox = page.locator(
            'input[type="checkbox"]'
        ).nth(1);

        // Check 2FA checkbox
        await twoFACheckbox.check();

        // Verify 2FA is enabled
        await expect(twoFACheckbox).toBeChecked();

    });


    test('User can navigate from registration page to login page', async ({ page }) => {

        // Navigate to registration page
        await page.goto('http://localhost:5173/register');

        // Click Sign In Here
        await page.getByRole('link', { name: 'Sign In Here' }).click();

        // Verify navigation to login page
        await expect(page).toHaveURL(/\/login/);

    });

});

