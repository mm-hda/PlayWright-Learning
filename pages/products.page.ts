import { expect, Page } from '@playwright/test';
import locators from '../utils/locators.json';

export class ProductsPage {
    constructor(private page: Page) { }

    async goto() {
        await this.page.goto('/');
    }

    async selectSort(option: string) {
        await this.page.locator(locators.products.sortDropdown).selectOption({ label: option });
    }

    async getProductNames(): Promise<string[]> {
        const names = await this.page.locator('h5.card-title').allTextContents();
        return names.map(name => name.trim()).filter(name => name.length > 0);
    }

    async getProductPrices(): Promise<number[]> {
        const footerTexts = await this.page
            .locator('.card-footer')
            .allTextContents();

        return footerTexts.map(text => {
            const match = text.match(/\$([\d.]+)/);
            return match ? Number(match[1]) : null;
        }).filter((price): price is number => price !== null);
    }

    async verifyAscendingNames() {
        const actual = await this.getProductNames();
        const expected = [...actual].sort((a, b) => a.localeCompare(b));
        expect(actual).toEqual(expected);
    }

    async verifyDescendingNames() {
        const actual = await this.getProductNames();
        const expected = [...actual].sort((a, b) => b.localeCompare(a));
        expect(actual).toEqual(expected);
    }

    async verifyAscendingPrices() {
        const actual = await this.getProductPrices();
        const expected = [...actual].sort((a, b) => a - b);
        expect(actual).toEqual(expected);
    }

    async verifyDescendingPrices() {
        const actual = await this.getProductPrices();
        const expected = [...actual].sort((a, b) => b - a);
        expect(actual).toEqual(expected);
    }

    async verifySortDropdownVisible() {
        await expect(this.page.locator(locators.products.sortDropdown)).toBeVisible();
    }

    async printProducts() {
        const names = await this.getProductNames();
        console.log('Products:');
        names.forEach((name, index) => { console.log(`${index + 1}. ${name}`); });
    }

    async printPrices() {
        const prices = await this.getProductPrices();
        console.log('Prices:');
        prices.forEach((price, index) => {
            console.log(`${index + 1}. $${price}`);
        });
    }

    async selectCategory(category: string) {
        await this.page.getByLabel(category).check();
    }

    async selectBrand(brand: string) {
        await this.page.getByLabel(brand).check();
    }

    async enableEcoFriendlyFilter() {
        await this.page.getByLabel('Show only eco-friendly products').check();
    }

    async getProductCount(): Promise<number> {
        return await this.page.locator('h5.card-title').count();
    }

    async getPageCount(): Promise<number> {
        const buttons = await this.page.locator('.pagination button').allTextContents();
        return buttons.filter(text => !text.includes('«') && !text.includes('»')).length;
    }

    async getFirstProductPrice(): Promise<number> {
        const price = await this.page.locator('.card-footer').first().textContent();
        if (!price) {
            throw new Error('Price not found');
        }
        return Number(price.replace('$', '').trim());
    }

    async waitForProductsToUpdate(): Promise<void> {
        await expect(this.page.locator('h5.card-title').first()).toBeVisible();
        await this.page.waitForTimeout(1000);
    }

    async expectAllProductsWithinPriceRange(minPrice: number, maxPrice: number): Promise<void> {
        const prices = await this.getProductPrices();
        expect(prices.length, 'Expected at least one product after applying price filter').toBeGreaterThan(0);

        for (const price of prices) {
            expect(price, `Expected price ${price} to be >= ${minPrice}`).toBeGreaterThanOrEqual(minPrice);
            expect(price, `Expected price ${price} to be <= ${maxPrice}`).toBeLessThanOrEqual(maxPrice);
        }
    }

    async setMaxPrice(maxPrice: number): Promise<void> {
        const maxSlider = this.page.getByRole('slider').last();
        await maxSlider.focus();
        const currentValue = Number(
            await maxSlider.getAttribute('aria-valuenow')
        );
        if (Number.isNaN(currentValue)) {
            throw new Error(
                'Maximum price slider value could not be determined.'
            );
        }
        const key = currentValue > maxPrice ? 'ArrowLeft' : 'ArrowRight';

        const steps = Math.abs(currentValue - maxPrice);
        for (let i = 0; i < steps; i++) {
            await this.page.keyboard.press(key);
        }
        await expect(maxSlider).toHaveAttribute('aria-valuenow', String(maxPrice));
        await this.waitForProductsToUpdate();
    }

    async setMinPrice(minPrice: number): Promise<void> {
        const minSlider = this.page.getByRole('slider').first();

        await minSlider.focus();

        const currentValue = Number(
            await minSlider.getAttribute('aria-valuenow')
        );

        if (Number.isNaN(currentValue)) {
            throw new Error('Minimum price slider value could not be determined.');
        }

        const difference = minPrice - currentValue;
        const key = difference > 0 ? 'ArrowRight' : 'ArrowLeft';
        const steps = Math.abs(difference);

        for (let i = 0; i < steps; i++) {
            await this.page.keyboard.press(key);
        }
        await this.waitForProductsToUpdate();
    }

    //search product
    async searchProduct(searchText: string) {
        await this.page.locator(locators.products.searchInput).fill(searchText);

        await this.page.locator(locators.products.searchButton)
            .click();
    }

    async clearSearch() {
        await this.page.locator(locators.products.clearSearchButton).click();
    }

    async getSearchHeading(): Promise<string> {
        const heading = await this.page.locator('h2').textContent();

        return heading?.trim() ?? '';
    }

    async getVisibleProductNames(): Promise<string[]> {
        const names = await this.page.locator(locators.products.productName).allTextContents();

        return names.map(name => name.trim()).filter(Boolean);
    }

    async verifyProductsContainSearchText(searchText: string) {
        const names = await this.getVisibleProductNames();

        expect(names.length).toBeGreaterThan(0);

        for (const name of names) {
            expect(name.toLowerCase()).toContain(searchText.toLowerCase());
        }
    }

    // pagination
    async getFirstProductName(): Promise<string> {
        const name = await this.page.locator('h5.card-title').first().textContent();
        return name?.trim() ?? '';
    }

    async clickPage(pageNumber: number) {
        await this.page.getByRole('button', { name: `Page-${pageNumber}` }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickNextPage() {
        await this.page
            .locator('[data-test="pagination-next"]')
            .click();
    }

    async clickPreviousPage() {
        await this.page
            .getByRole('listitem').filter({ hasText: '«' })
            .click();
    }
}
