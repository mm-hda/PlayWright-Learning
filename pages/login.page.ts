import { expect, Page } from '@playwright/test';
import locators from '../utils/locators.json';

export class LoginPage {
    constructor(private page: Page) { }

    async goto() {
        await this.page.goto('/auth/login');
    }

    async fillEmail(email: string) {
        await this.page
            .locator(locators.login.email)
            .fill(email);
    }

    async fillPassword(password: string) {
        await this.page
            .locator(locators.login.password)
            .fill(password);
    }

    async clickLogin() {
        await this.page.locator(locators.login.loginButton).click();
    }

    async clickShowPassword() {
        await this.page
            .locator(locators.login.showPasswordButton)
            .click();
    }
    async clickGoogleLogin() {
        await this.page.locator(locators.login.googleLoginButton).click();
    }

    async clickForgotPassword() {
        await this.page
            .locator(locators.login.forgotPasswordLink)
            .click();
    }

    async clickRegisterLink() {
        await this.page
            .locator(locators.login.registerLink)
            .click();
    }

    async login(email: string, password: string) {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.clickLogin();
    }

    async verifyPasswordVisible() {
        await expect(
            this.page.locator(locators.login.password)
        ).toHaveAttribute('type', 'text');
    }

    async verifyPasswordHidden() {
        await expect(
            this.page.locator(locators.login.password)
        ).toHaveAttribute('type', 'password');
    }
}