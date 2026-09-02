import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';
import locators from '../utils/locators.json';

let productsPage: ProductsPage;

test.describe('Products Sort Functionality', () => {

    test.beforeEach(async ({ page }) => {
        productsPage = new ProductsPage(page);
        await productsPage.goto();
    });

    test('should display sort section', async ({ page }) => {
        await expect(
            page.locator(locators.products.sortDropdown)
        ).toBeVisible();
    });

    test('should sort by name ascending', async () => {
        await productsPage.selectSort(
            locators.products.nameAscending
        );

        await productsPage.verifyAscendingNames();
    });

    test('should sort by name descending', async () => {
        await productsPage.selectSort(
            locators.products.nameDescending
        );

        await productsPage.verifyDescendingNames();
    });

    test('should sort by price low to high', async () => {
        await productsPage.selectSort(
            locators.products.priceLowToHigh
        );

        await productsPage.verifyAscendingPrices();
    });

    test('should sort by price high to low', async () => {
        await productsPage.selectSort(
            locators.products.priceHighToLow
        );

        await productsPage.verifyDescendingPrices();
    });
});