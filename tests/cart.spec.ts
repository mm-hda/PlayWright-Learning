import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/cart.page';

let cartPage: CartPage;

test.describe('Add To Cart Functionality', () => {
    test.beforeEach(async ({ page }) => {
        cartPage = new CartPage(page);
        await cartPage.goto();
    });

    test('should validate product quantity controls', async () => {
        await test.step('Verify default quantity is one', async () => {
            await cartPage.openAvailableProduct(0);

            expect(await cartPage.getCurrentQuantity()).toBe(1);
        });

        await test.step('Verify quantity can be increased', async () => {
            await cartPage.increaseQuantity();
            await cartPage.increaseQuantity();

            expect(await cartPage.getCurrentQuantity()).toBe(3);
        });

        await test.step('Verify quantity can be decreased', async () => {
            await cartPage.decreaseQuantity();

            expect(await cartPage.getCurrentQuantity()).toBe(2);
        });
    });

    test('should add available products with the correct quantities', async () => {
        await test.step('Add the first product with quantity one', async () => {
            await cartPage.openAvailableProduct(0);
            await cartPage.setQuantity(1);
            await cartPage.addCurrentProductToCart();

            await cartPage.verifyCartQuantity(1);
        });

        await test.step('Add selected quantity of the first product', async () => {
            await cartPage.returnToProducts();
            await cartPage.openAvailableProduct(0);
            await cartPage.setQuantity(3);
            await cartPage.addCurrentProductToCart();

            await cartPage.verifyCartQuantity(4);
        });

        await test.step('Verify success toast after adding a product', async () => {
            await cartPage.verifySuccessToast();
        });

        await test.step('Add the same product twice', async () => {
            await cartPage.returnToProducts();
            await cartPage.openAvailableProduct(0);
            await cartPage.addCurrentProductMultipleTimes(2);

            await cartPage.verifyCartQuantity(6);
        });

        await test.step('Add selected quantity twice for the same product', async () => {
            await cartPage.returnToProducts();
            await cartPage.openAvailableProduct(0);
            await cartPage.setQuantity(2);
            await cartPage.addCurrentProductMultipleTimes(2, 2);

            await cartPage.verifyCartQuantity(10);
        });

        await test.step('Add the second available product', async () => {
            await cartPage.returnToProducts();
            await cartPage.openAvailableProduct(1);
            await cartPage.addCurrentProductToCart();

            await cartPage.verifyCartQuantity(11);
        });
    });

    test('should combine products and preserve cart quantity', async ({ page }) => {
        let firstProductName: string;
        let secondProductName: string;

        await test.step('Add the first and second products', async () => {
            firstProductName = await cartPage.openAvailableProduct(0);

            await cartPage.setQuantity(2);
            await cartPage.addCurrentProductToCart();
            await cartPage.returnToProducts();

            secondProductName = await cartPage.openAvailableProduct(1);

            await cartPage.setQuantity(3);
            await cartPage.addCurrentProductToCart();

            expect(firstProductName).not.toBe(secondProductName);
            await cartPage.verifyCartQuantity(5);
        });

        await test.step('Add both products twice', async () => {
            await cartPage.returnToProducts();

            await cartPage.openAvailableProduct(0);
            await cartPage.addCurrentProductMultipleTimes(2);
            await cartPage.returnToProducts();

            await cartPage.openAvailableProduct(1);
            await cartPage.addCurrentProductMultipleTimes(2);

            await cartPage.verifyCartQuantity(9);
        });

        await test.step('Add repeated quantities from both products', async () => {
            await cartPage.returnToProducts();

            await cartPage.openAvailableProduct(0);
            await cartPage.setQuantity(2);
            await cartPage.addCurrentProductMultipleTimes(2, 2);
            await cartPage.returnToProducts();

            await cartPage.openAvailableProduct(1);
            await cartPage.setQuantity(3);
            await cartPage.addCurrentProductMultipleTimes(2, 3);

            await cartPage.verifyCartQuantity(19);
        });

        await test.step('Verify cart quantity after returning to products', async () => {
            await cartPage.returnToProducts();

            await cartPage.verifyCartQuantity(19);
        });

        await test.step('Verify cart quantity after page reload', async () => {
            await page.reload();

            await cartPage.verifyCartQuantity(19);
        });
    });
});
