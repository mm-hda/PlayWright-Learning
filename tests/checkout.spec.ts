import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';

let cartPage: CartPage;
let checkoutPage: CheckoutPage;
let firstProductName: string;
let secondProductName: string;

test.describe('Checkout Cart Functionality', () => {
    test.beforeEach(async ({ page }) => {
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);

        await cartPage.goto();

        firstProductName = await cartPage.openAvailableProduct(0);
        await cartPage.addCurrentProductToCart();

        await cartPage.returnToProducts();

        secondProductName = await cartPage.openAvailableProduct(1);
        await cartPage.addCurrentProductToCart();

        await checkoutPage.openCart();
    });

    test('should validate cart controls and quantity behavior', async () => {
        await test.step('Verify cart controls', async () => {
            await checkoutPage.verifyCartPage();
        });

        await test.step('Verify default quantities', async () => {
            expect(await checkoutPage.getQuantityByProductName(firstProductName)).toBe(1);
            expect(await checkoutPage.getQuantityByProductName(secondProductName)).toBe(1);
        });

        await test.step('Verify zero quantity changes to one for first product', async () => {
            await checkoutPage.updateQuantityByProductName(firstProductName, 0);

            expect(await checkoutPage.getQuantityByProductName(firstProductName)).toBe(1);
            await checkoutPage.verifyProductLineTotalByName(firstProductName);
            await checkoutPage.verifyGrandTotal();
        });

        await test.step('Verify zero quantity changes to one for second product', async () => {
            await checkoutPage.updateQuantityByProductName(secondProductName, 0);

            expect(await checkoutPage.getQuantityByProductName(secondProductName)).toBe(1);
            await checkoutPage.verifyProductLineTotalByName(secondProductName);
            await checkoutPage.verifyGrandTotal();
        });

        await test.step('Verify negative quantity changes to one', async () => {
            await checkoutPage.updateQuantityByProductName(firstProductName, -5);

            expect(await checkoutPage.getQuantityByProductName(firstProductName)).toBe(1);
            await checkoutPage.verifyProductLineTotalByName(firstProductName);
            await checkoutPage.verifyGrandTotal();
        });
    });

    test('should calculate product prices and cart totals correctly', async () => {
        const firstUnitPrice = await checkoutPage.getUnitPriceByProductName(firstProductName);
        const secondUnitPrice = await checkoutPage.getUnitPriceByProductName(secondProductName);
        const originalGrandTotal = await checkoutPage.getGrandTotal();

        await test.step('Verify first product quantity and line total', async () => {
            const originalLineTotal = await checkoutPage.getLineTotalByProductName(firstProductName);

            await checkoutPage.updateQuantityByProductName(firstProductName, 3);

            const updatedLineTotal = await checkoutPage.getLineTotalByProductName(firstProductName);
            const expectedLineTotal = Number((firstUnitPrice * 3).toFixed(2));

            expect(await checkoutPage.getQuantityByProductName(firstProductName)).toBe(3);
            expect(updatedLineTotal).toBeGreaterThan(originalLineTotal);
            expect(updatedLineTotal).toBe(expectedLineTotal);
            await checkoutPage.verifyProductLineTotalByName(firstProductName);
        });

        await test.step('Verify second product quantity and line total', async () => {
            const originalLineTotal = await checkoutPage.getLineTotalByProductName(secondProductName);

            await checkoutPage.updateQuantityByProductName(secondProductName, 4);

            const updatedLineTotal = await checkoutPage.getLineTotalByProductName(secondProductName);
            const expectedLineTotal = Number((secondUnitPrice * 4).toFixed(2));

            expect(await checkoutPage.getQuantityByProductName(secondProductName)).toBe(4);
            expect(updatedLineTotal).toBeGreaterThan(originalLineTotal);
            expect(updatedLineTotal).toBe(expectedLineTotal);
            await checkoutPage.verifyProductLineTotalByName(secondProductName);
        });

        await test.step('Verify combined grand total', async () => {
            const expectedGrandTotal = Number((firstUnitPrice * 3 + secondUnitPrice * 4).toFixed(2));
            const actualGrandTotal = await checkoutPage.getGrandTotal();

            expect(actualGrandTotal).toBe(expectedGrandTotal);
            expect(actualGrandTotal).toBeGreaterThan(originalGrandTotal);
            await checkoutPage.verifyGrandTotal();
        });

        await test.step('Verify both quantities can be changed to two and three', async () => {
            await checkoutPage.updateQuantityByProductName(firstProductName, 2);
            await checkoutPage.updateQuantityByProductName(secondProductName, 3);

            const expectedGrandTotal = Number((firstUnitPrice * 2 + secondUnitPrice * 3).toFixed(2));
            const actualGrandTotal = await checkoutPage.getGrandTotal();

            expect(actualGrandTotal).toBe(expectedGrandTotal);
            await checkoutPage.verifyProductLineTotalByName(firstProductName);
            await checkoutPage.verifyProductLineTotalByName(secondProductName);
            await checkoutPage.verifyGrandTotal();
        });

        await test.step('Verify grand total decreases when quantities are reduced', async () => {
            await checkoutPage.updateQuantityByProductName(firstProductName, 4);
            await checkoutPage.updateQuantityByProductName(secondProductName, 3);

            const increasedGrandTotal = await checkoutPage.getGrandTotal();

            await checkoutPage.updateQuantityByProductName(firstProductName, 1);
            await checkoutPage.updateQuantityByProductName(secondProductName, 1);

            const reducedGrandTotal = await checkoutPage.getGrandTotal();

            expect(reducedGrandTotal).toBeLessThan(increasedGrandTotal);
            await checkoutPage.verifyProductLineTotalByName(firstProductName);
            await checkoutPage.verifyProductLineTotalByName(secondProductName);
            await checkoutPage.verifyGrandTotal();
        });

        await test.step('Verify unit prices remain unchanged', async () => {
            const firstUnitPriceAfter = await checkoutPage.getUnitPriceByProductName(firstProductName);
            const secondUnitPriceAfter = await checkoutPage.getUnitPriceByProductName(secondProductName);

            expect(firstUnitPriceAfter).toBe(firstUnitPrice);
            expect(secondUnitPriceAfter).toBe(secondUnitPrice);
        });
    });
});
