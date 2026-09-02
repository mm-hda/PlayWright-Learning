import { test, expect } from '@playwright/test';
import { FavoritesPage } from '../pages/favorites.page';

let favoritesPage: FavoritesPage;

test.describe('Favorites Functionality', () => {
    const password = 'Harsh#9665';

    test.beforeEach(async ({ page }) => {
        favoritesPage = new FavoritesPage(page);
        const email = `harsh.donda.${Date.now()}@example.com`;

        await test.step('Register a new user', async () => {
            await favoritesPage.registerUser(email, password);
        });

        await test.step('Login with the registered user', async () => {
            await favoritesPage.login(email, password);
        });

        await test.step('Open the home page', async () => {
            await favoritesPage.gotoHome();
        });
    });

    test('should add a product to favorites', async () => {
        let productName = '';

        await test.step('Open the first product', async () => {
            productName = await favoritesPage.openProductByIndex(0);
        });

        await test.step('Add the product to favorites', async () => {
            await favoritesPage.addCurrentProductToFavorites();
        });

        await test.step('Open My favorites from the account menu', async () => {
            await favoritesPage.openFavorites();
        });

        await test.step('Verify the product is in favorites', async () => {
            await favoritesPage.verifyFavoriteProduct(productName);
        });
    });

    test('should show toast when adding the same product to favorites again', async () => {
        await test.step('Open the first product', async () => {
            await favoritesPage.openProductByIndex(0);
        });

        await test.step('Add the product to favorites', async () => {
            await favoritesPage.addCurrentProductToFavorites();
        });

        await test.step('Add the same product again', async () => {
            await favoritesPage.addCurrentProductToFavoritesAgain();
        });

        await test.step('Verify the favorite toast', async () => {
            await expect(favoritesPage.getFavoritesToast()).toBeVisible();
        });
    });

    test('should remove a product from favorites', async () => {
        let productName = '';

        await test.step('Open the first product', async () => {
            productName = await favoritesPage.openProductByIndex(0);
        });

        await test.step('Add the product to favorites', async () => {
            await favoritesPage.addCurrentProductToFavorites();
        });

        await test.step('Open My favorites', async () => {
            await favoritesPage.openFavorites();
        });

        await test.step('Verify the product is in favorites', async () => {
            await favoritesPage.verifyFavoriteProduct(productName);
        });

        await test.step('Remove the product from favorites', async () => {
            await favoritesPage.removeFavorite(productName);
        });

        await test.step('Verify the product was removed', async () => {
            await favoritesPage.verifyProductIsNotFavorite(productName);
        });
    });

    test('should keep two different products in favorites at the same time', async () => {
        let firstProductName = '';
        let secondProductName = '';

        await test.step('Open and add the first product', async () => {
            firstProductName = await favoritesPage.openProductByIndex(0);
            await favoritesPage.addCurrentProductToFavorites();
        });

        await test.step('Return to the home page', async () => {
            await favoritesPage.returnToHome();
        });

        await test.step('Open and add the second product', async () => {
            secondProductName = await favoritesPage.openProductByIndex(1);
            await favoritesPage.addCurrentProductToFavorites();
        });

        await test.step('Open My favorites', async () => {
            await favoritesPage.openFavorites();
        });

        await test.step('Verify both products are in favorites', async () => {
            expect(firstProductName).not.toBe(secondProductName);
            await favoritesPage.verifyFavoriteProduct(firstProductName);
            await favoritesPage.verifyFavoriteProduct(secondProductName);
        });

        await test.step('Remove the first product', async () => {
            await favoritesPage.removeFavorite(firstProductName);
        });

        await test.step('Verify the first is removed and second remains', async () => {
            await favoritesPage.verifyProductIsNotFavorite(firstProductName);
            await favoritesPage.verifyFavoriteProduct(secondProductName);
        });
    });
});