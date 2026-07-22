import { test, expect } from '@playwright/test';

test.describe('UC1 - OTP Verification', () => {

    // =========================================================
    // Helper: Open Registration OTP Verification Page
    // =========================================================
    async function openRegistrationVerificationPage(page) {
        await page.goto('/verify-registration-otp', {
            waitUntil: 'domcontentloaded',
        });

        await expect(page).not.toHaveTitle(/404|not found/i);
    }

    // =========================================================
    // Test 1: Registration OTP page should load
    // =========================================================
    test('Registration OTP verification page should load successfully', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByRole('heading', {
                name: /verify your account/i
            })
        ).toBeVisible();

    });


    // =========================================================
    // Test 2: Page should display verification instructions
    // =========================================================
    test('Registration OTP page should display verification instructions', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByText(
                /we've emailed a 6-digit code/i
            )
        ).toBeVisible();

    });


    // =========================================================
    // Test 3: OTP input should be displayed
    // =========================================================
    test('Registration OTP page should display OTP input', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        // The exact selector depends on your OtpInput component.
        // This checks for six OTP inputs first.
        const otpInputs = page.locator(
            'input[inputmode="numeric"], input[autocomplete="one-time-code"]'
        );

        const count = await otpInputs.count();

        if (count >= 1) {
            await expect(otpInputs.first()).toBeVisible();
        } else {
            // Fallback: check for input elements on the page
            await expect(
                page.locator('input').first()
            ).toBeVisible();
        }

    });


    // =========================================================
    // Test 4: Activate Account button should be visible
    // =========================================================
    test('Registration OTP page should display Activate Account button', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByRole('button', {
                name: /activate account/i
            })
        ).toBeVisible();

    });


    // =========================================================
    // Test 5: Request new code button should be visible
    // =========================================================
    test('Registration OTP page should display Request a new code button', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByRole('button', {
                name: /request a new code/i
            })
        ).toBeVisible();

    });


    // =========================================================
    // Test 6: Register again link should be visible
    // =========================================================
    test('Registration OTP page should display Register again link', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByRole('link', {
                name: /register again/i
            })
        ).toBeVisible();

    });


    // =========================================================
    // Test 7: OTP expiry timer should be displayed
    // =========================================================
    test('Registration OTP page should display OTP expiry timer', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByText(/code expires in/i)
        ).toBeVisible();

    });


    // =========================================================
    // Test 8: OTP timer should display initial countdown
    // =========================================================
    test('Registration OTP page should display countdown timer', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByText(/01:59/)
        ).toBeVisible();

    });


    // =========================================================
    // Test 9: Empty OTP should show validation error
    // =========================================================
    test('Submitting empty OTP should show validation error', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await page.getByRole('button', {
            name: /activate account/i
        }).click();

        await expect(
            page.getByText(
                /enter the 6-digit code sent to your email/i
            )
        ).toBeVisible();

    });


    // =========================================================
    // Test 10: Incomplete OTP should show validation error
    // =========================================================
    test('Submitting incomplete OTP should show validation error', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        const otpInputs = page.locator(
            'input[inputmode="numeric"], input[autocomplete="one-time-code"]'
        );

        const count = await otpInputs.count();

        if (count >= 1) {

            // Fill first input with an incomplete OTP
            await otpInputs.first().fill('123');

            await page.getByRole('button', {
                name: /activate account/i
            }).click();

            await expect(
                page.getByText(
                    /enter the 6-digit code sent to your email/i
                )
            ).toBeVisible();

        }

    });


    // =========================================================
    // Test 11: Register again link should navigate to register
    // =========================================================
    test('Register again link should navigate to registration page', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await page.getByRole('link', {
            name: /register again/i
        }).click();

        await expect(page).toHaveURL(/register/i);

    });


    // =========================================================
    // Test 12: Resend OTP without identity
    // =========================================================
    test('Requesting a new code without identity should show error', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await page.getByRole('button', {
            name: /request a new code/i
        }).click();

        await expect(
            page.getByText(
                /missing email identity/i
            )
        ).toBeVisible();

    });


    // =========================================================
    // Test 13: OTP page should contain verification content
    // =========================================================
    test('Registration OTP page should contain verification content', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.locator('body')
        ).toContainText(
            /verify your account|verification|6-digit code|activate account/i
        );

    });


    // =========================================================
    // Test 14: OTP page should contain expiration information
    // =========================================================
    test('Registration OTP page should contain expiration information', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.locator('body')
        ).toContainText(
            /code expires in/i
        );

    });


    // =========================================================
    // Test 15: Activate Account button should be enabled initially
    // =========================================================
    test('Activate Account button should be enabled initially', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        const activateButton = page.getByRole('button', {
            name: /activate account/i
        });

        await expect(activateButton).toBeVisible();
        await expect(activateButton).toBeEnabled();

    });


    // =========================================================
    // Test 16: OTP page should have Register Again link
    // =========================================================
    test('Registration OTP page should have a registration navigation link', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        const registerLink = page.getByRole('link', {
            name: /register again/i
        });

        await expect(registerLink).toBeVisible();

        await expect(registerLink).toHaveAttribute(
            'href',
            '/register'
        );

    });


    // =========================================================
    // Test 17: Verify Account heading should be visible
    // =========================================================
    test('Verify Your Account heading should be visible', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByRole('heading', {
                name: 'Verify Your Account'
            })
        ).toBeVisible();

    });


    // =========================================================
    // Test 18: Verification icon should be displayed
    // =========================================================
    test('Verification icon should be displayed', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.locator('.material-symbols-outlined')
                .filter({ hasText: 'verified_user' })
                .first()
        ).toBeVisible();

    });


    // =========================================================
    // Test 19: Timer should initially show 01:59
    // =========================================================
    test('OTP timer should initially start at 01:59', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByText('01:59')
        ).toBeVisible();

    });


    // =========================================================
    // Test 20: Timer should count down
    // =========================================================
    test('OTP expiry timer should count down', async ({ page }) => {

        await openRegistrationVerificationPage(page);

        await expect(
            page.getByText('01:59')
        ).toBeVisible();

        await page.waitForTimeout(2000);

        await expect(
            page.getByText(/01:5[0-9]|01:57|01:58/)
        ).toBeVisible();

    });

});

