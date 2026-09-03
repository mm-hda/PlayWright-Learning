import { expect, Locator, Page } from '@playwright/test';
import locators from '../utils/locators.json';

export class CartPage {
    constructor(private readonly page: Page) { }

    async goto(): Promise<void> {
        await this.page.goto('/');
        await expect(this.getProductCards().first()).toBeVisible();
    }

    getProductCards(): Locator {
        return this.page.locator(locators.cart.productCards);
    }

    getQuantityValue(): Locator {
        return this.page.locator(locators.cart.quantityValue);
    }

    getDecreaseQuantityButton(): Locator {
        return this.page.locator(locators.cart.decreaseQuantityButton);
    }

    getIncreaseQuantityButton(): Locator {
        return this.page.locator(locators.cart.increaseQuantityButton);
    }

    getAddToCartButton(): Locator {
        return this.page.locator(locators.cart.addToCartButton);
    }

    getCartNavigation(): Locator {
        return this.page.locator(locators.cart.cartNavigation);
    }

    getCartQuantityBadge(): Locator {
        return this.page.locator(locators.cart.cartQuantityBadge);
    }

    getSuccessToast(): Locator {
        return this.page.getByText(locators.cart.successToast, { exact: true });
    }

    getProductCardByDisplayedIndex(displayedIndex: number): Locator {
        return this.getProductCards().nth(displayedIndex);
    }

    async getDisplayedProductName(displayedIndex: number): Promise<string> {
        const productCard = this.getProductCardByDisplayedIndex(displayedIndex);
        const productName = await productCard.locator(locators.cart.productName).textContent();

        return productName?.trim() || '';
    }

    async isDisplayedProductOutOfStock(displayedIndex: number): Promise<boolean> {
        const productCard = this.getProductCardByDisplayedIndex(displayedIndex);
        const productFooter = productCard.locator(locators.cart.productFooter);
        const footerText = await productFooter.textContent();

        return footerText?.toLowerCase().includes(locators.cart.outOfStockText.toLowerCase()) ?? false;
    }

    async getAvailableProductIndexes(requiredCount = 1): Promise<number[]> {
        if (!Number.isInteger(requiredCount) || requiredCount < 1) {
            throw new Error(`Required product count must be a positive integer. Received ${requiredCount}.`);
        }

        const displayedProductCount = await this.getProductCards().count();
        const availableProductIndexes: number[] = [];

        for (let displayedIndex = 0; displayedIndex < displayedProductCount; displayedIndex++) {
            const isOutOfStock = await this.isDisplayedProductOutOfStock(displayedIndex);

            if (!isOutOfStock) {
                availableProductIndexes.push(displayedIndex);
            }

            if (availableProductIndexes.length === requiredCount) {
                break;
            }
        }

        if (availableProductIndexes.length < requiredCount) {
            throw new Error(`Expected ${requiredCount} in-stock products but found ${availableProductIndexes.length}.`);
        }

        return availableProductIndexes;
    }

    async getAvailableProductDisplayedIndex(availablePosition: number): Promise<number> {
        if (!Number.isInteger(availablePosition) || availablePosition < 0) {
            throw new Error(`Available product position must be zero or greater. Received ${availablePosition}.`);
        }

        const availableProductIndexes = await this.getAvailableProductIndexes(availablePosition + 1);

        return availableProductIndexes[availablePosition];
    }

    async openAvailableProduct(availablePosition = 0): Promise<string> {
        const displayedIndex = await this.getAvailableProductDisplayedIndex(availablePosition);
        const productCard = this.getProductCardByDisplayedIndex(displayedIndex);
        const productName = await this.getDisplayedProductName(displayedIndex);

        await productCard.locator(locators.cart.productName).click();
        await expect(this.page.locator(locators.cart.productDetailHeading)).toHaveText(productName);
        await expect(this.getAddToCartButton()).toBeVisible();
        await expect(this.getAddToCartButton()).toBeEnabled();

        return productName;
    }

    async getCurrentQuantity(): Promise<number> {
        const quantityElement = this.getQuantityValue();
        await expect(quantityElement).toBeVisible();
        const elementTagName = await quantityElement.evaluate(element => element.tagName.toLowerCase());
        const quantityText = elementTagName === 'input' ? await quantityElement.inputValue() : await quantityElement.textContent();
        const quantity = Number(quantityText?.trim());

        if (!Number.isInteger(quantity)) {
            throw new Error(`Product quantity "${quantityText ?? ''}" is not a valid integer.`);
        }

        return quantity;
    }

    async increaseQuantity(): Promise<void> {
        await this.getIncreaseQuantityButton().click();
    }

    async decreaseQuantity(): Promise<void> {
        const currentQuantity = await this.getCurrentQuantity();

        if (currentQuantity <= 1) {
            throw new Error('Quantity cannot be less than 1.');
        }

        await this.getDecreaseQuantityButton().click();
        await expect.poll(async () => this.getCurrentQuantity()).toBe(currentQuantity - 1);
    }

    async setQuantity(targetQuantity: number): Promise<void> {
        if (targetQuantity < 1) {
            throw new Error(
                `Invalid quantity ${targetQuantity}`
            );
        }
        let currentQuantity = await this.getCurrentQuantity();
        while (currentQuantity < targetQuantity) {
            await this.increaseQuantity();
            currentQuantity = await this.getCurrentQuantity();
        }
        while (currentQuantity > targetQuantity) {
            await this.decreaseQuantity();
            currentQuantity = await this.getCurrentQuantity();
        }
        expect(currentQuantity).toBe(targetQuantity);
    }

    async getCartQuantity(): Promise<number> {
        const badge = this.getCartQuantityBadge();

        if (await badge.count() === 0 || !(await badge.isVisible())) {
            return 0;
        }

        const text = await badge.textContent();
        const match = text?.match(/\d+/);

        if (!match) {
            return 0;
        }

        return Number(match[0]);
    }

    async addCurrentProductToCart(): Promise<void> {
        await expect(this.getAddToCartButton()).toBeEnabled();
        await this.getAddToCartButton().click();
        await expect(this.getSuccessToast()).toBeVisible({ timeout: 5000 });
    }

    async addCurrentProductMultipleTimes(times: number, quantityPerClick = 1): Promise<void> {
        const initialCartQuantity = await this.getCartQuantity();

        for (let clickNumber = 1; clickNumber <= times; clickNumber++) {
            const expectedQuantity = initialCartQuantity + clickNumber * quantityPerClick;
            await this.getAddToCartButton().click();
            await expect.poll(async () => await this.getCartQuantity(), { timeout: 5000 }).toBe(expectedQuantity);
        }
    }

    async addAvailableProduct(availablePosition: number, quantity: number): Promise<string> {
        const initialCartQuantity = await this.getCartQuantity();

        const productName = await this.openAvailableProduct(availablePosition);
        await this.setQuantity(quantity);
        await this.addCurrentProductToCart();
        return productName;
    }

    async returnToProducts(): Promise<void> {
        await this.page.goto('/');
        await expect(this.getProductCards().first()).toBeVisible();
    }

    async verifyCartQuantity(expectedQuantity: number): Promise<void> {
        await expect.poll(async () => await this.getCartQuantity()).toBe(expectedQuantity);
    }

    async verifySuccessToast(): Promise<void> {
        await expect(this.getSuccessToast()).toBeVisible({ timeout: 5000 });
    }
}