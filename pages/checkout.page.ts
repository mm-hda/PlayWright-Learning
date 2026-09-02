import { expect, Locator, Page } from '@playwright/test';
import locators from '../utils/locators.json';

export class CheckoutPage {
    constructor(private readonly page: Page) { }

    getCartNavigation(): Locator {
        return this.page.locator(locators.checkout.cartNavigation);
    }

    getCartTable(): Locator {
        return this.page.locator(locators.checkout.cartTable).first();
    }

    getProductRows(): Locator {
        return this.getCartTable().locator(
            `${locators.checkout.cartRows}:has(${locators.checkout.quantityInput})`
        );
    }

    getContinueShoppingButton(): Locator {
        return this.page.locator(locators.checkout.continueShoppingButton).first();
    }

    getProceedToCheckoutButton(): Locator {
        return this.page.locator(locators.checkout.proceedToCheckoutButton);
    }

    async openCart(): Promise<void> {
        await expect(this.getCartNavigation()).toBeVisible();
        await this.getCartNavigation().click();
        await expect(this.getCartTable()).toBeVisible();
        await expect(this.getProductRows().first()).toBeVisible();
    }

    async getProductCount(): Promise<number> {
        return this.getProductRows().count();
    }

    async getProductRowByIndex(productIndex: number): Promise<Locator> {
        const productCount = await this.getProductCount();

        if (productIndex < 0 || productIndex >= productCount) {
            throw new Error(`Product index ${productIndex} is invalid. Cart contains ${productCount} products.`);
        }

        const row = this.getProductRows().nth(productIndex);

        await expect(row).toBeVisible();

        return row;
    }

    async getProductRowByName(productName: string): Promise<Locator> {
        const productRows = this.getProductRows();
        const productCount = await productRows.count();

        for (let rowIndex = 0; rowIndex < productCount; rowIndex++) {
            const row = productRows.nth(rowIndex);
            const name = (await row.locator('td').first().innerText()).trim();

            if (name === productName) {
                await expect(row).toBeVisible();
                return row;
            }
        }

        throw new Error(`Product "${productName}" was not found in the cart.`);
    }

    async getProductName(productIndex: number): Promise<string> {
        const row = await this.getProductRowByIndex(productIndex);
        const productName = await row.locator('td').first().innerText();

        if (!productName?.trim()) {
            throw new Error(`Product name was not found at cart row ${productIndex}.`);
        }

        return productName.trim();
    }

    async getQuantityInput(productIndex: number): Promise<Locator> {
        const row = await this.getProductRowByIndex(productIndex);
        const quantityInput = row.locator(locators.checkout.quantityInput);

        await expect(quantityInput).toBeVisible();

        return quantityInput;
    }

    async getQuantityInputByProductName(productName: string): Promise<Locator> {
        const row = await this.getProductRowByName(productName);
        const quantityInput = row.locator(locators.checkout.quantityInput);

        await expect(quantityInput).toBeVisible();

        return quantityInput;
    }

    async getQuantity(productIndex: number): Promise<number> {
        const quantityInput = await this.getQuantityInput(productIndex);
        const quantityText = await quantityInput.inputValue();
        const quantity = Number(quantityText);

        if (!Number.isInteger(quantity)) {
            throw new Error(`Quantity "${quantityText}" at cart row ${productIndex} is not a valid integer.`);
        }

        return quantity;
    }

    async getQuantityByProductName(productName: string): Promise<number> {
        const quantityInput = await this.getQuantityInputByProductName(productName);
        const quantityText = await quantityInput.inputValue();
        const quantity = Number(quantityText);

        if (!Number.isInteger(quantity)) {
            throw new Error(`Quantity "${quantityText}" for "${productName}" is not a valid integer.`);
        }

        return quantity;
    }

    async updateQuantity(productIndex: number, quantity: number): Promise<void> {
        const quantityInput = await this.getQuantityInput(productIndex);
        const expectedQuantity = quantity < 1 ? 1 : quantity;

        await quantityInput.fill(quantity.toString());
        await quantityInput.press('Tab');

        await expect.poll(
            async () => this.getQuantity(productIndex),
            {
                message: `Expected quantity at row ${productIndex} to become ${expectedQuantity}`
            }
        ).toBe(expectedQuantity);
    }

    async updateQuantityByProductName(productName: string, quantity: number): Promise<void> {
        const quantityInput = await this.getQuantityInputByProductName(productName);
        const expectedQuantity = quantity < 1 ? 1 : quantity;

        await quantityInput.fill(quantity.toString());
        await quantityInput.press('Tab');

        await expect.poll(
            async () => this.getQuantityByProductName(productName),
            {
                message: `Expected quantity for "${productName}" to become ${expectedQuantity}`
            }
        ).toBe(expectedQuantity);
    }

    async getUnitPrice(productIndex: number): Promise<number> {
        const row = await this.getProductRowByIndex(productIndex);
        const priceText = await row.locator(locators.checkout.unitPrice).innerText();

        return this.parseCurrency(priceText, `unit price at cart row ${productIndex}`);
    }

    async getUnitPriceByProductName(productName: string): Promise<number> {
        const row = await this.getProductRowByName(productName);
        const priceText = await row.locator(locators.checkout.unitPrice).innerText();

        return this.parseCurrency(priceText, `unit price for "${productName}"`);
    }

    async getLineTotal(productIndex: number): Promise<number> {
        const row = await this.getProductRowByIndex(productIndex);
        const totalText = await row.locator(locators.checkout.lineTotal).innerText();

        return this.parseCurrency(totalText, `line total at cart row ${productIndex}`);
    }

    async getLineTotalByProductName(productName: string): Promise<number> {
        const row = await this.getProductRowByName(productName);
        const totalText = await row.locator(locators.checkout.lineTotal).innerText();

        return this.parseCurrency(totalText, `line total for "${productName}"`);
    }

    async verifyProductLineTotal(productIndex: number): Promise<void> {
        const quantity = await this.getQuantity(productIndex);
        const unitPrice = await this.getUnitPrice(productIndex);
        const expectedLineTotal = this.roundCurrency(quantity * unitPrice);

        await expect.poll(
            async () => this.getLineTotal(productIndex),
            {
                message: `Expected line total at row ${productIndex} to be $${expectedLineTotal}`
            }
        ).toBe(expectedLineTotal);
    }

    async verifyProductLineTotalByName(productName: string): Promise<void> {
        const quantity = await this.getQuantityByProductName(productName);
        const unitPrice = await this.getUnitPriceByProductName(productName);
        const expectedLineTotal = this.roundCurrency(quantity * unitPrice);

        await expect.poll(
            async () => this.getLineTotalByProductName(productName),
            {
                message: `Expected line total for "${productName}" to be $${expectedLineTotal}`
            }
        ).toBe(expectedLineTotal);
    }

    async getGrandTotal(): Promise<number> {
        const footerRows = this.getCartTable().locator('tfoot tr');

        if (await footerRows.count() > 0) {
            const totalRow = footerRows.last();
            const totalText = await totalRow.innerText();
            const totalValue = this.tryParseCurrency(totalText);

            if (totalValue !== null) {
                return totalValue;
            }
        }

        const totalRows = this.getCartTable()
            .locator('tr')
            .filter({ hasText: /\btotal\b/i });

        const rowCount = await totalRows.count();

        for (let rowIndex = rowCount - 1; rowIndex >= 0; rowIndex--) {
            const row = totalRows.nth(rowIndex);
            const cellTexts = await row.locator('td, th').allInnerTexts();

            for (let cellIndex = cellTexts.length - 1; cellIndex >= 0; cellIndex--) {
                const value = this.tryParseCurrency(cellTexts[cellIndex]);

                if (value !== null) {
                    return value;
                }
            }
        }

        throw new Error('Cart grand total could not be found in the cart table.');
    }

    async calculateExpectedGrandTotal(): Promise<number> {
        const productCount = await this.getProductCount();
        let expectedGrandTotal = 0;

        for (let productIndex = 0; productIndex < productCount; productIndex++) {
            const quantity = await this.getQuantity(productIndex);
            const unitPrice = await this.getUnitPrice(productIndex);

            expectedGrandTotal += quantity * unitPrice;
        }

        return this.roundCurrency(expectedGrandTotal);
    }

    async verifyGrandTotal(): Promise<void> {
        const expectedGrandTotal = await this.calculateExpectedGrandTotal();

        await expect.poll(
            async () => this.getGrandTotal(),
            {
                message: `Expected cart grand total to be $${expectedGrandTotal}`
            }
        ).toBe(expectedGrandTotal);
    }

    async removeProduct(productIndex: number): Promise<void> {
        const row = await this.getProductRowByIndex(productIndex);
        const productName = await this.getProductName(productIndex);
        const currentProductCount = await this.getProductCount();
        const removeButton = row.locator(locators.checkout.removeButton).first();

        await expect(removeButton).toBeVisible();
        await removeButton.click();

        await expect(this.getProductRows()).toHaveCount(currentProductCount - 1);
        await this.verifyProductDoesNotExist(productName);
    }



    async verifyProductDoesNotExist(productName: string): Promise<void> {
        const productRows = this.getProductRows();
        const productCount = await productRows.count();

        for (let rowIndex = 0; rowIndex < productCount; rowIndex++) {
            const row = productRows.nth(rowIndex);
            const name = (await row.locator('td').first().innerText()).trim();

            if (name === productName) {
                throw new Error(`Product "${productName}" still exists in the cart.`);
            }
        }
    }

    async verifyCartPage(): Promise<void> {
        await expect(this.getCartTable()).toBeVisible();
        await expect(this.getContinueShoppingButton()).toBeVisible();
        await expect(this.getProceedToCheckoutButton()).toBeVisible();
        await expect(this.getProceedToCheckoutButton()).toBeEnabled();
    }

    async clickContinueShopping(): Promise<void> {
        await this.getContinueShoppingButton().click();
        await expect(this.page).toHaveURL('/');
    }

    async clickProceedToCheckout(): Promise<void> {
        await expect(this.getProceedToCheckoutButton()).toBeEnabled();
        await this.getProceedToCheckoutButton().click();
    }

    private parseCurrency(text: string | null, fieldName: string): number {
        const currencyValue = this.tryParseCurrency(text);

        if (currencyValue === null) {
            throw new Error(`Could not read ${fieldName} from "${text ?? ''}".`);
        }

        return currencyValue;
    }

    private tryParseCurrency(text: string | null): number | null {
        if (!text?.trim()) {
            return null;
        }

        const normalizedText = text.replace(/,/g, '').trim();
        const currencyMatch = normalizedText.match(/\$\s*(-?\d+(?:\.\d{1,2})?)/);

        if (!currencyMatch) {
            return null;
        }

        const currencyValue = Number(currencyMatch[1]);

        return Number.isNaN(currencyValue) ? null : currencyValue;
    }

    private roundCurrency(value: number): number {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }
}
