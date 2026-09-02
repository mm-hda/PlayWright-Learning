import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register.page';

import locators from '../utils/locators.json';

let registerPage: RegisterPage;

test.describe('Customer Registration', () => {
    test.beforeEach(async ({ page }) => {
        registerPage = new RegisterPage(page);
        await registerPage.goto();
    });

    test('should register customer', async ({ page }) => {
        const userData = {
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
            email: `harshonda${Date.now()}@test.com`,
            password: 'Harsh#9665'
        };

        await registerPage.register(userData);

        await expect(page).not.toHaveURL(/register/);
    });

    test('should validate email format', async ({ page }) => {
        await registerPage.fillEmail('invalid-email');
        await registerPage.clickRegister();

        await expect(page.getByText('Email format is invalid')).toBeVisible();
    });

    test('should validate phone number', async ({ page }) => {
        await registerPage.fillPhone('abc123');
        await registerPage.clickRegister();
        await expect(page.getByText('Only numbers are allowed.')).toBeVisible();
    });

    test('should validate password rules dynamically', async ({ page }) => {
        await registerPage.fillPassword('password');
        await page.locator('[data-test="password"]').press('Tab');

        await registerPage.verifyPasswordRuleColor('minLengthRule', 'rgb(25, 135, 84)');

        await registerPage.fillPassword('Password');
        await page.locator('[data-test="password"]').press('Tab');

        await registerPage.verifyPasswordRuleColor('upperLowerRule', 'rgb(25, 135, 84)');

        await registerPage.fillPassword('Password1');
        await page.locator('[data-test="password"]').press('Tab');

        await registerPage.verifyPasswordRuleColor('numberRule', 'rgb(25, 135, 84)');

        await registerPage.fillPassword('Password1@');
        await page.locator('[data-test="password"]').press('Tab');
        await registerPage.verifyPasswordRuleColor('specialCharRule', 'rgb(25, 135, 84)');
    });

    test('should show and hide password', async ({ page }) => {
        await registerPage.fillPassword('Password1@');

        await page.locator('[data-test="register-form"]').getByRole('button').filter({ hasText: /^$/ }).click();

        await expect(
            page.locator(locators.register.password)
        ).toHaveAttribute('type', 'text');

        await page.locator('[data-test="register-form"]').getByRole('button').filter({ hasText: /^$/ }).click();

        await expect(page.locator(locators.register.password)).toHaveAttribute('type', 'password');
    });

    test('should validate required fields', async ({ page }) => {
        await registerPage.clickRegister();

        await expect(page.getByText('First name is required')).toBeVisible();
        await expect(page.getByText('Last name is required')).toBeVisible();
        await expect(page.getByText('Please enter a valid date in')).toBeVisible();
        await expect(page.getByText('Country is required')).toBeVisible();
        await expect(page.getByText('Postcode is required')).toBeVisible();
        await expect(page.getByText('House number is required')).toBeVisible();
        await expect(page.getByText('Street is required')).toBeVisible();
        await expect(page.getByText('City is required')).toBeVisible();
        await expect(page.getByText('State is required')).toBeVisible();
        await expect(page.getByText('Phone is required.')).toBeVisible();
        await expect(page.getByText('Email is required')).toBeVisible();
        await expect(page.getByText('Password is required')).toBeVisible();
    });
});