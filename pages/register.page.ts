import { expect, Page } from '@playwright/test';
import locators from '../utils/locators.json';

export class RegisterPage {
    constructor(private page: Page) { }

    async goto() {
        await this.page.goto('/auth/register');
    }

    async fillFirstName(value: string) {
        await this.page.locator(locators.register.firstName).fill(value);
    }

    async fillLastName(value: string) {
        await this.page.locator(locators.register.lastName).fill(value);
    }

    async fillDob(value: string) {
        await this.page.locator(locators.register.dob).fill(value);
    }

    async selectCountry(value: string) {
        await this.page.locator(locators.register.country).selectOption({
            label: value,
        });
    }

    async fillPostcode(value: string) {
        await this.page.locator(locators.register.postcode).fill(value);
    }

    async fillHouseNumber(value: string) {
        await this.page.locator(locators.register.houseNumber).fill(value);
    }

    async fillStreet(value: string) {
        await this.page.locator(locators.register.street).fill(value);
    }

    async fillCity(value: string) {
        await this.page.locator(locators.register.city).fill(value);
    }

    async fillState(value: string) {
        await this.page.locator(locators.register.state).fill(value);
    }

    async fillPhone(value: string) {
        await this.page.locator(locators.register.phone).fill(value);
    }

    async fillEmail(value: string) {
        await this.page.locator(locators.register.email).fill(value);
    }

    async fillPassword(value: string) {
        await this.page.locator(locators.register.password).fill(value);
    }

    async clickRegister() {
        await this.page.locator(locators.register.registerButton).click();
    }

    async register(data: any) {
        await this.fillFirstName(data.firstName);
        await this.fillLastName(data.lastName);
        await this.fillDob(data.dob);

        await this.selectCountry(data.country);

        await this.fillPostcode(data.postcode);
        await this.fillHouseNumber(data.houseNumber);
        await this.fillStreet(data.street);
        await this.fillCity(data.city);
        await this.fillState(data.state);

        await this.fillPhone(data.phone);
        await this.fillEmail(data.email);
        await this.fillPassword(data.password);

        await this.clickRegister();
    }

    async verifyPasswordRuleColor(
        rule: | 'minLengthRule'
            | 'upperLowerRule'
            | 'numberRule'
            | 'specialCharRule',
        color: string) {
        await expect(this.page.locator(locators.register[rule])).toHaveCSS('color', color);
    }
}