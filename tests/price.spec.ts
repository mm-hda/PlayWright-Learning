import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';

let productsPage: ProductsPage;

test.describe('Price Range Filter', () => {

    test.beforeEach(async ({ page }) => {
        productsPage = new ProductsPage(page);

        await productsPage.goto();
    });

    test('should display price range filter', async ({ page }) => {

        await expect(page.getByText('Price Range')).toBeVisible();
        await expect(page.getByRole('slider').first()).toBeVisible();
        await expect(page.getByRole('slider').last()).toBeVisible();
    });

    test('should filter products between 1 and 105', async () => {

        await productsPage.setMaxPrice(105);

        await productsPage.expectAllProductsWithinPriceRange(
            1,
            105
        );
    });

    test('should filter products between 1 and 95', async () => {

        await productsPage.setMaxPrice(95);

        await productsPage.expectAllProductsWithinPriceRange(
            1,
            95
        );
    });

    test('should filter products between 5 and 95', async () => {
        await productsPage.setMinPrice(5);
        await productsPage.setMaxPrice(95);
        await productsPage.expectAllProductsWithinPriceRange(
            5,
            95
        );
    });
});