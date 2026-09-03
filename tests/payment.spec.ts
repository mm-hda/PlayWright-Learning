import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { CartPage } from '../pages/cart.page';
import { PaymentPage } from '../pages/payment.page';

let loginPage: LoginPage;
let registerPage: RegisterPage;
let cartPage: CartPage;
let paymentPage: PaymentPage;
let selectedProductName = '';

const billingAddress = {
    country: 'India',
    postalCode: '390001',
    houseNumber: '42',
    street: 'Sample Street',
    city: 'Vadodara',
    state: 'Gujarat'
};

const bankTransferData = {
    bankName: 'Test Bank',
    accountName: 'Harsh Donda',
    accountNumber: '123456789'
};

const creditCardData = {
    cardNumber: '1234-5678-9012-3456',
    expirationDate: '12/2030',
    cvv: '123',
    cardHolderName: 'Harsh Donda'
};

const giftCardData = {
    giftCardNumber: '1234567891234567',
    validationCode: '2365'
};

const userData = {
    firstName: 'Harsh',
    lastName: 'Donda',
    dob: '1998-01-01',
    country: 'India',
    postcode: '390001',
    houseNumber: '42',
    street: 'Sample Street',
    city: 'Vadodara',
    state: 'Gujarat',
    phone: '9876543210',
    email: `harsh.payment.${Date.now()}${Math.floor(Math.random() * 10000)}@test.com`,
    password: 'Harsh#9665'
};

test.describe('Payment Functionality', () => {
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);
        cartPage = new CartPage(page);
        paymentPage = new PaymentPage(page);


        await test.step('Register customer', async () => {
            await registerPage.goto();
            await registerPage.register(userData);
            await expect(page).not.toHaveURL(/register/);
        });

        await test.step('Login customer', async () => {
            await loginPage.goto();
            await loginPage.login(userData.email, userData.password);
            await expect(page).not.toHaveURL(/login/);
        });

        await test.step('Open products and add product to cart', async () => {
            await cartPage.goto();
            selectedProductName = await cartPage.addAvailableProduct(0, 1);
        });

        await test.step('Open cart and start checkout', async () => {
            await cartPage.getCartNavigation().click();
            await paymentPage.verifyCheckoutCartStep();
        });

        await test.step('Verify selected product in checkout cart', async () => {
            await paymentPage.verifyProductInCheckout(selectedProductName);
        });

        await test.step('Proceed from cart to sign in step', async () => {
            await paymentPage.proceedFromCart();
        });

        await test.step('Verify user is already logged in', async () => {
            await paymentPage.verifyUserIsLoggedIn();
        });

        await test.step('Proceed to billing address', async () => {
            await paymentPage.proceedFromSignIn();
        });

        await test.step('Fill billing address', async () => {
            await paymentPage.fillBillingAddress(billingAddress);
        });

        await test.step('Proceed to payment', async () => {
            await paymentPage.proceedFromBillingAddress();
        });
    });

    test('should complete payment using cash on delivery', async () => {
        await test.step('Select Cash on Delivery', async () => {
            await paymentPage.selectPaymentMethod('cash-on-delivery');
        });

        await test.step('Confirm payment', async () => {
            await paymentPage.confirmPayment();
        });

        await test.step('Verify payment successful', async () => {
            await paymentPage.verifyPaymentSuccessful();
        });
    });

    test('should complete payment using bank transfer', async () => {
        await test.step('Select Bank Transfer', async () => {
            await paymentPage.selectPaymentMethod('bank-transfer');
        });

        await test.step('Fill bank transfer details', async () => {
            await paymentPage.fillBankTransferDetails(bankTransferData);
        });

        await test.step('Confirm payment', async () => {
            await paymentPage.confirmPayment();
        });

        await test.step('Verify payment successful', async () => {
            await paymentPage.verifyPaymentSuccessful();
        });
    });

    test('should complete payment using credit card', async () => {
        await test.step('Select Credit Card', async () => {
            await paymentPage.selectPaymentMethod('credit-card');
        });

        await test.step('Fill credit card details', async () => {
            await paymentPage.fillCreditCardDetails(creditCardData);
        });

        await test.step('Confirm payment', async () => {
            await paymentPage.confirmPayment();
        });

        await test.step('Verify payment successful', async () => {
            await paymentPage.verifyPaymentSuccessful();
        });
    });

    test('should complete payment using gift card', async () => {
        await test.step('Select Gift Card', async () => {
            await paymentPage.selectPaymentMethod('gift-card');
        });

        await test.step('Fill gift card details', async () => {
            await paymentPage.fillGiftCardDetails(giftCardData);
        });

        await test.step('Confirm payment', async () => {
            await paymentPage.confirmPayment();
        });

        await test.step('Verify payment successful', async () => {
            await paymentPage.verifyPaymentSuccessful();
        });
    });

    for (const installments of ['3', '6', '9', '12'] as const) {
        test(`should complete payment using Buy Now Pay Later with ${installments} monthly installments`, async () => {
            await test.step('Select Buy Now Pay Later', async () => {
                await paymentPage.selectPaymentMethod('buy-now-pay-later');
            });

            await test.step(`Select ${installments} monthly installments`, async () => {
                await paymentPage.selectMonthlyInstallments(installments);
            });

            await test.step('Confirm payment', async () => {
                await paymentPage.confirmPayment();
            });

            await test.step('Verify payment successful', async () => {
                await paymentPage.verifyPaymentSuccessful();
            });
        });
    }
});
