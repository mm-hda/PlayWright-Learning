import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import locators from '../utils/locators.json';

let loginPage: LoginPage;
let registerPage: RegisterPage;

const VALID_PASSWORD = 'Harsh#9665';
const INVALID_PASSWORD = 'WrongPassword123';

let VALID_EMAIL: string;

test.describe('Login Functionality', () => {
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);

        VALID_EMAIL = `harshdonda.${Date.now()}@gmail.com`;

        await test.step('Register a new customer', async () => {
            await registerPage.goto();

            await registerPage.register({
                firstName: 'Harsh',
                lastName: 'Donda',
                dob: '1998-01-01',
                country: 'India',
                postcode: '390001',
                houseNumber: '42',
                street: 'Sample Street',
                city: 'Vadodara',
                state: 'Gujarat',
                phone: '9876543210',
                email: VALID_EMAIL,
                password: VALID_PASSWORD
            });

            await expect(page).not.toHaveURL(/register/);
        });

        await test.step('Open login page', async () => {
            await loginPage.goto();
            await expect(page).toHaveURL(/login/);
        });
    });

    test('should login successfully', async ({ page }) => {
        await test.step('Enter valid login credentials', async () => {
            await loginPage.fillEmail(VALID_EMAIL);
            await loginPage.fillPassword(VALID_PASSWORD);
        });

        await test.step('Click login button', async () => {
            await loginPage.clickLogin();
        });

        await test.step('Verify successful login', async () => {
            await expect(page).not.toHaveURL(/login/);
        });
    });

    test('should show validation messages for empty form', async ({ page }) => {
        await test.step('Click login without entering credentials', async () => {
            await loginPage.clickLogin();
        });

        await test.step('Verify email validation message', async () => {
            await expect(page.getByText('Email is required')).toBeVisible();
        });

        await test.step('Verify password validation message', async () => {
            await expect(page.getByText('Password is required')).toBeVisible();
        });
    });

    test('should validate invalid email format', async ({ page }) => {
        await test.step('Enter invalid email', async () => {
            await loginPage.fillEmail('invalid-email');
        });

        await test.step('Enter valid password', async () => {
            await loginPage.fillPassword(VALID_PASSWORD);
        });

        await test.step('Click login button', async () => {
            await loginPage.clickLogin();
        });

        await test.step('Verify email field remains visible', async () => {
            await expect(page.locator(locators.login.email)).toBeVisible();
        });
    });

    test('should show invalid credentials message', async ({ page }) => {
        await test.step('Enter valid email and invalid password', async () => {
            await loginPage.fillEmail(VALID_EMAIL);
            await loginPage.fillPassword(INVALID_PASSWORD);
        });

        await test.step('Click login button', async () => {
            await loginPage.clickLogin();
        });

        await test.step('Verify invalid credentials message', async () => {
            await expect(
                page.getByText('Invalid email or password')
            ).toBeVisible();
        });
    });

    test('should show password when eye icon clicked', async () => {
        await test.step('Enter password', async () => {
            await loginPage.fillPassword(VALID_PASSWORD);
        });

        await test.step('Click show password button', async () => {
            await loginPage.clickShowPassword();
        });

        await test.step('Verify password is visible', async () => {
            await loginPage.verifyPasswordVisible();
        });
    });

    test('should show and hide password', async ({ page }) => {
        await test.step('Enter password', async () => {
            await loginPage.fillPassword('Password1@');
        });

        await test.step('Show password', async () => {
            await page
                .locator('[data-test="login-form"]')
                .getByRole('button')
                .filter({ hasText: /^$/ })
                .click();

            await expect(
                page.locator(locators.login.password)
            ).toHaveAttribute('type', 'text');
        });

        await test.step('Hide password', async () => {
            await page
                .locator('[data-test="login-form"]')
                .getByRole('button')
                .filter({ hasText: /^$/ })
                .click();

            await expect(
                page.locator(locators.login.password)
            ).toHaveAttribute('type', 'password');
        });
    });

    test('should navigate to register page', async ({ page }) => {
        await test.step('Click register link', async () => {
            await loginPage.clickRegisterLink();
        });

        await test.step('Verify register page', async () => {
            await expect(page).toHaveURL(/register/);
        });
    });

    test('should navigate to forgot password page', async ({ page }) => {
        await test.step('Click forgot password link', async () => {
            await loginPage.clickForgotPassword();
        });

        await test.step('Verify forgot password URL', async () => {
            await expect(page).toHaveURL(/forgot-password/);
        });
    });

    test('should verify forgot password screen', async ({ page }) => {
        await test.step('Open forgot password page', async () => {
            await loginPage.clickForgotPassword();
        });

        await test.step('Verify forgot password heading', async () => {
            await expect(
                page.getByRole('heading', { name: 'Forgot Password' })
            ).toBeVisible();
        });

        await test.step('Verify set new password button', async () => {
            await expect(
                page.getByRole('button', { name: 'Set New Password' })
            ).toBeVisible();
        });
    });

    test('should validate forgot password email required', async ({ page }) => {
        await test.step('Open forgot password page', async () => {
            await loginPage.clickForgotPassword();
        });

        await test.step('Submit empty forgot password form', async () => {
            await page
                .getByRole('button', { name: 'Set New Password' })
                .click();
        });

        await test.step('Verify email validation message', async () => {
            await expect(page.getByText('Email is required')).toBeVisible();
        });
    });

    test('should open google login page', async ({ page }) => {
        await test.step('Open Google login popup', async () => {
            const popupPromise = page.waitForEvent('popup');

            await loginPage.clickGoogleLogin();

            const googlePage = await popupPromise;

            await googlePage.waitForLoadState();

            await test.step('Verify Google login URL', async () => {
                await expect(googlePage).toHaveURL(
                    /accounts\.google\.com/
                );
            });
        });
    });
});
