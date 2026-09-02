import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';

let productsPage: ProductsPage;

test.describe('Product Search Functionality', () => {
    test.beforeEach(async ({ page }) => {
        productsPage = new ProductsPage(page);
        await productsPage.goto();
    });

    test('should display search section', async ({ page }) => {
        await expect(page.locator('input[placeholder="Search"]')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    });

    test('should search hammer products', async ({ page }) => {
        await productsPage.searchProduct('hammer');

        await expect(page.getByText('Searched for: hammer')).toBeVisible();

        await productsPage.verifyProductsContainSearchText('hammer');
    });

    test('should search pliers products', async ({ page }) => {
        await productsPage.searchProduct('pliers');

        await expect(page.getByText('Searched for: pliers')).toBeVisible();

        await productsPage.verifyProductsContainSearchText('pliers');
    });

    test('should show no results for invalid search', async ({ page }) => {
        await productsPage.searchProduct('harsh');

        await expect(page.getByText('Searched for: harsh')).toBeVisible();

        await expect(page.getByText('There are no products found.')).toBeVisible();
    });

    test('should be case insensitive', async ({ page }) => {
        await productsPage.searchProduct('HAMMER');

        await expect(page.getByText('Searched for: HAMMER')).toBeVisible();

        await productsPage.verifyProductsContainSearchText('hammer');
    });

    test('should search using partial text', async ({ page }) => {
        await productsPage.searchProduct('ham');

        const products = await productsPage.getVisibleProductNames();

        expect(products.length).toBeGreaterThan(0);
    });

    test('should clear search results using X button', async ({ page }) => {
        const initialProductCount = await productsPage.getProductCount();

        await productsPage.searchProduct('hammer');

        await productsPage.clearSearch();

        const finalProductCount = await productsPage.getProductCount();

        expect(finalProductCount).toBeGreaterThanOrEqual(initialProductCount);
    });

    test('should clear search textbox using X button', async ({ page }) => {
        await productsPage.searchProduct('hammer');

        await productsPage.clearSearch();

        await expect(page.locator('input[placeholder="Search"]')).toHaveValue('');
    });

    test('should search by pressing Enter key', async ({ page }) => {
        await page.locator('input[placeholder="Search"]').fill('hammer');

        await page.keyboard.press('Enter');

        await expect(page.getByText('Searched for: hammer')).toBeVisible();
    });

    test('should trim leading and trailing spaces', async ({ page }) => {
        await productsPage.searchProduct('   hammer   ');

        await productsPage.verifyProductsContainSearchText('hammer');
    });

    test('should restore all products after clearing search', async ({ page }) => {
        await productsPage.searchProduct('hammer');
        await productsPage.clearSearch();
        const productNames = await productsPage.getVisibleProductNames();
        expect(productNames.length).toBeGreaterThan(0);
    });
});