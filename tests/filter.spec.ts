import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';

let productsPage: ProductsPage;

test.describe('Product Filters Functionality', () => {
    test.beforeEach(async ({ page }) => {
        productsPage = new ProductsPage(page);
        await productsPage.goto();
    });

    test('should display filter section', async ({ page }) => {
        await expect(page.getByText('By category:')).toBeVisible();
        await expect(page.getByText('By brand:')).toBeVisible();
        await expect(page.getByText('Sustainability:')).toBeVisible();
    });

    test('should select Hand Tools category', async ({ page }) => {
        await productsPage.selectCategory('Hand Tools');

        await expect(page.getByLabel('Hand Tools')).toBeChecked();
    });

    test('should select all child categories when Hand Tools is checked', async ({ page }) => {
        await productsPage.selectCategory('Hand Tools');

        await expect(page.getByLabel('Hammer')).toBeChecked();
        await expect(page.getByLabel('Hand Saw')).toBeChecked();
        await expect(page.getByLabel('Wrench')).toBeChecked();
        await expect(page.getByLabel('Screwdriver')).toBeChecked();
        await expect(page.getByLabel('Pliers')).toBeChecked();
        await expect(page.getByLabel('Chisels')).toBeChecked();
        await expect(page.getByLabel('Measures')).toBeChecked();
    });

    test('should unselect all child categories when Hand Tools is unchecked', async ({ page }) => {
        await page.getByLabel('Hand Tools').check();
        await page.getByLabel('Hand Tools').uncheck();

        await expect(page.getByLabel('Hammer')).not.toBeChecked();
        await expect(page.getByLabel('Hand Saw')).not.toBeChecked();
        await expect(page.getByLabel('Wrench')).not.toBeChecked();
        await expect(page.getByLabel('Screwdriver')).not.toBeChecked();
        await expect(page.getByLabel('Pliers')).not.toBeChecked();
        await expect(page.getByLabel('Chisels')).not.toBeChecked();
        await expect(page.getByLabel('Measures')).not.toBeChecked();
    });

    test('should filter by Screwdriver category', async () => {
        const initialCount = await productsPage.getProductCount();
        await productsPage.selectCategory('Screwdriver');
        const filteredCount = await productsPage.getProductCount();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('should filter by brand', async () => {
        const initialCount = await productsPage.getProductCount();
        await productsPage.selectBrand('ForgeFlex Tools');
        const filteredCount = await productsPage.getProductCount();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('should enable eco friendly products filter', async ({ page }) => {
        await productsPage.enableEcoFriendlyFilter();
        await expect(page.getByLabel('Show only eco-friendly products')).toBeChecked();
    });

    test('should combine category and brand filters', async () => {
        await productsPage.selectCategory('Hand Tools');
        await productsPage.selectBrand('ForgeFlex Tools');
        const products = await productsPage.getProductNames();
        expect(products.length).toBeGreaterThan(0);
    });

    test('should combine category, brand and eco filters', async () => {
        await productsPage.selectCategory('Hand Tools');
        await productsPage.selectBrand('ForgeFlex Tools');
        await productsPage.enableEcoFriendlyFilter();
        const products = await productsPage.getProductNames();
        expect(products.length).toBeGreaterThan(0);
    });

    test('should clear category filter', async ({ page }) => {
        await page.getByLabel('Screwdriver').check();
        await page.getByLabel('Screwdriver').uncheck();
        await expect(page.getByLabel('Screwdriver')).not.toBeChecked();
        const products = await productsPage.getProductNames();
        expect(products.length).toBeGreaterThan(0);
    });
});