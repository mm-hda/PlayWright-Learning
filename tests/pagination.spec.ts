import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';

let productsPage: ProductsPage;

test.describe('Pagination Functionality', () => {
    test.beforeEach(async ({ page }) => {
        productsPage = new ProductsPage(page);
        await productsPage.goto();
    });

    test('should navigate from page 1 to page 2', async () => {
        const page1Product =
            await productsPage.getFirstProductName();

        await productsPage.clickPage(2);

        const page2Product =
            await productsPage.getFirstProductName();

        expect(page2Product)
            .not.toEqual(page1Product);
    });

    test('should navigate from page 1 to page 3', async () => {
        const page1Product =
            await productsPage.getFirstProductName();

        await productsPage.clickPage(3);

        const page3Product =
            await productsPage.getFirstProductName();

        expect(page3Product)
            .not.toEqual(page1Product);
    });

    test('should navigate using next button', async () => {
        const firstProduct = await productsPage.getFirstProductName();
        await productsPage.clickNextPage();

        const secondProduct = await productsPage.getFirstProductName();

        expect(secondProduct).not.toEqual(firstProduct);
    });

    test('should navigate using previous button', async () => {
        await productsPage.clickPage(2);
        const page2Product = await productsPage.getFirstProductName();

        await productsPage.clickPreviousPage();
        const page1Product = await productsPage.getFirstProductName();

        expect(page2Product).not.toEqual(page1Product);
    });

    test('should return same first product when navigating back to page 1', async () => {
        const originalProduct =
            await productsPage.getFirstProductName();

        await productsPage.clickPage(2);
        await productsPage.clickPage(1);

        const currentProduct =
            await productsPage.getFirstProductName();

        expect(currentProduct)
            .toEqual(originalProduct);
    });

});