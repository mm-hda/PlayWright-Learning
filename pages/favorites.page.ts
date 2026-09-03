import { expect, Locator, Page } from '@playwright/test';
import locators from '../utils/locators.json';

export class FavoritesPage {
    constructor(private readonly page: Page) { }

    async registerUser(email: string, password: string): Promise<void> {
        await this.page.goto('/auth/register');
        await expect(this.page.locator(locators.favorites.registerFirstName)).toBeVisible();

        await this.page.locator(locators.favorites.registerFirstName).fill('Harsh');
        await this.page.locator(locators.favorites.registerLastName).fill('Donda');
        await this.page.locator(locators.favorites.registerDob).fill('1995-01-01');

        const country = this.page.locator(locators.favorites.registerCountry);
        await expect(country).toBeVisible();
        if (await country.locator('option').count() > 1) {
            await country.selectOption({ label: 'India' });
        }

        await this.page.locator(locators.favorites.registerPostcode).fill('380001');
        await this.page.locator(locators.favorites.registerHouseNumber).fill('42');
        await this.page.locator(locators.favorites.registerStreet).fill('test street');
        await this.page.locator(locators.favorites.registerCity).fill('Ahmedabad');
        await this.page.locator(locators.favorites.registerState).fill('Gujarat');
        await this.page.locator(locators.favorites.registerPhone).fill('9876543210');
        await this.page.locator(locators.favorites.registerEmail).fill(email);
        await this.page.locator(locators.favorites.registerPassword).fill(password);

        await this.page.locator(locators.favorites.registerButton).click();
        await expect(this.page).toHaveURL(/auth\/login/, { timeout: 5000 });
    }

    async login(email: string, password: string): Promise<void> {
        await this.page.goto('/auth/login');
        await expect(this.page.locator(locators.favorites.loginEmail)).toBeVisible();

        await this.page.locator(locators.favorites.loginEmail).fill(email);
        await this.page.locator(locators.favorites.loginPassword).fill(password);
        await this.page.locator(locators.favorites.loginButton).click();

        await expect(this.page.locator(locators.favorites.homeLink)).toBeVisible();
    }

    async gotoHome(): Promise<void> {
        await this.page.goto('/');
        await expect(this.getProductCards().first()).toBeVisible();
    }

    getProductCards(): Locator {
        return this.page.locator(locators.favorites.productCard);
    }

    async getProductNameByIndex(index: number): Promise<string> {
        const name = await this.getProductCards().nth(index).locator(locators.favorites.productName).textContent();

        if (!name?.trim()) {
            throw new Error(`Product name was not found at index ${index}.`);
        }

        return name.trim();
    }

    async openProductByIndex(index: number): Promise<string> {
        const productCard = this.getProductCards().nth(index);
        const productName = await this.getProductNameByIndex(index);

        await productCard.locator(locators.favorites.productName).click();
        await expect(this.page).toHaveURL(/\/product\//, { timeout: 5000 });
        await expect(this.page.locator(locators.favorites.productDetailHeading)).toBeVisible();

        return productName;
    }

    getAddToFavoritesButton(): Locator {
        return this.page.locator(locators.favorites.addToFavoritesButton);
    }

    getFavoritesToast(): Locator {
        return this.page.locator(locators.favorites.toast);
    }

    async addCurrentProductToFavorites(): Promise<void> {
        await expect(this.getAddToFavoritesButton()).toBeVisible();
        await expect(this.getAddToFavoritesButton()).toBeEnabled();
        await this.getAddToFavoritesButton().click();
        await expect(this.getFavoritesToast()).toBeVisible();
    }

    async addCurrentProductToFavoritesAgain(): Promise<void> {
        await expect(this.getAddToFavoritesButton()).toBeVisible();
        await this.getAddToFavoritesButton().click();
        await expect(this.getFavoritesToast()).toBeVisible();
    }

    async returnToHome(): Promise<void> {
        await this.page.goto('/');
        await expect(this.getProductCards().first()).toBeVisible();
    }

    async openAccountMenu(): Promise<void> {
        const accountButton = this.page.getByRole('button', { name: /Harsh Donda/i });
        await expect(accountButton).toBeVisible();
        await accountButton.click();
        await expect(this.page.getByText('My favorites', { exact: true })).toBeVisible();
    }

    async openFavorites(): Promise<void> {
        await this.openAccountMenu();
        await this.page.getByText('My favorites', { exact: true }).click();
        await expect(this.page).toHaveURL(/\/account\/favorites/);
        await expect(this.page.locator(locators.favorites.favoritesHeading)).toBeVisible();
    }

    getFavoriteItemByName(productName: string): Locator {
        return this.page.locator(locators.favorites.favoriteItems).filter({ hasText: productName }).first();
    }

    async verifyFavoriteProduct(productName: string): Promise<void> {
        await expect(this.getFavoriteItemByName(productName)).toBeVisible();
    }

    async verifyProductIsNotFavorite(productName: string): Promise<void> {
        await expect(this.getFavoriteItemByName(productName)).not.toBeVisible();
    }

    async removeFavorite(productName: string): Promise<void> {
        const item = this.getFavoriteItemByName(productName);
        await expect(item).toBeVisible();
        await item.locator(locators.favorites.removeFavoriteButton).click();
        await expect(item).not.toBeVisible();
    }
}