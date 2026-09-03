import { expect, Locator, Page } from '@playwright/test';
import locators from '../utils/locators.json';

export type PaymentMethod =
    | 'cash-on-delivery'
    | 'bank-transfer'
    | 'credit-card'
    | 'buy-now-pay-later'
    | 'gift-card';

export class PaymentPage {
    constructor(private readonly page: Page) { }

    getCheckoutCartProductNames(): Locator {
        return this.page.locator(locators.payment.checkoutCartProductName);
    }

    getProceedFromCartButton(): Locator {
        return this.page.locator(locators.payment.proceedFromCartButton);
    }

    getLoggedInCheckoutMessage(): Locator {
        return this.page.locator(locators.payment.loggedInCheckoutMessage);
    }

    getProceedFromSignInButton(): Locator {
        return this.page.locator(locators.payment.proceedFromSignInButton);
    }

    getCountry(): Locator {
        return this.page.locator(locators.payment.country);
    }

    getPostalCode(): Locator {
        return this.page.locator(locators.payment.postalCode);
    }

    getHouseNumber(): Locator {
        return this.page.locator(locators.payment.houseNumber);
    }

    getStreet(): Locator {
        return this.page.locator(locators.payment.street);
    }

    getCity(): Locator {
        return this.page.locator(locators.payment.city);
    }

    getState(): Locator {
        return this.page.locator(locators.payment.state);
    }

    getPostcodeLookupLoading(): Locator {
        return this.page.locator(locators.payment.postcodeLookupLoading);
    }

    getProceedFromAddressButton(): Locator {
        return this.page.locator(locators.payment.proceedFromAddressButton);
    }

    getPaymentMethod(): Locator {
        return this.page.locator(locators.payment.paymentMethod);
    }

    getBankName(): Locator {
        return this.page.locator(locators.payment.bankName);
    }

    getAccountName(): Locator {
        return this.page.locator(locators.payment.accountName);
    }

    getAccountNumber(): Locator {
        return this.page.locator(locators.payment.accountNumber);
    }

    getCreditCardNumber(): Locator {
        return this.page.locator(locators.payment.creditCardNumber);
    }

    getExpirationDate(): Locator {
        return this.page.locator(locators.payment.expirationDate);
    }

    getCvv(): Locator {
        return this.page.locator(locators.payment.cvv);
    }

    getCardHolderName(): Locator {
        return this.page.locator(locators.payment.cardHolderName);
    }

    getGiftCardNumber(): Locator {
        return this.page.locator(locators.payment.giftCardNumber);
    }

    getValidationCode(): Locator {
        return this.page.locator(locators.payment.validationCode);
    }

    getMonthlyInstallments(): Locator {
        return this.page.locator(locators.payment.monthlyInstallments);
    }

    getFinishButton(): Locator {
        return this.page.locator(locators.payment.finishButton);
    }

    getPaymentSuccessMessage(): Locator {
        return this.page.locator(locators.payment.paymentSuccessMessage);
    }

    getPaymentErrorMessage(): Locator {
        return this.page.locator(locators.payment.paymentErrorMessage);
    }

    getOrderConfirmation(): Locator {
        return this.page.locator(locators.payment.orderConfirmation);
    }

    async openCheckout(): Promise<void> {
        await this.page.goto('/checkout');
        await this.verifyCheckoutCartStep();
    }

    async verifyCheckoutCartStep(): Promise<void> {
        await expect(this.getProceedFromCartButton()).toBeVisible();
    }

    async verifyProductInCheckout(productName: string): Promise<void> {
        await expect(
            this.getCheckoutCartProductNames().filter({ hasText: productName }).first()
        ).toBeVisible();
    }

    async proceedFromCart(): Promise<void> {
        await expect(this.getProceedFromCartButton()).toBeEnabled();
        await this.getProceedFromCartButton().click();
    }

    async verifyUserIsLoggedIn(): Promise<void> {
        await expect(this.getLoggedInCheckoutMessage()).toBeVisible();
        await expect(this.getLoggedInCheckoutMessage()).toContainText('already logged in');
        await expect(this.getProceedFromSignInButton()).toBeVisible();
        await expect(this.getProceedFromSignInButton()).toBeEnabled();
    }

    async proceedFromSignIn(): Promise<void> {
        await this.getProceedFromSignInButton().click();
    }

    async fillBillingAddress(data: {
        country: string;
        postalCode: string;
        houseNumber: string;
        street: string;
        city: string;
        state: string;
    }): Promise<void> {
        await expect(this.getCountry()).toBeVisible();
        await this.getCountry().selectOption({ label: data.country });
        await this.getPostalCode().fill(data.postalCode);
        await this.getHouseNumber().fill(data.houseNumber);

        if (await this.getPostcodeLookupLoading().count()) {
            await expect(this.getPostcodeLookupLoading()).not.toBeVisible();
        }

        await this.getStreet().fill(data.street);
        await this.getCity().fill(data.city);
        await this.getState().fill(data.state);
    }

    async proceedFromBillingAddress(): Promise<void> {
        await expect(this.getProceedFromAddressButton()).toBeEnabled();
        await this.getProceedFromAddressButton().click();
        await expect(this.getPaymentMethod()).toBeVisible();
    }

    async selectPaymentMethod(method: PaymentMethod): Promise<void> {
        await expect(this.getPaymentMethod()).toBeVisible();
        await this.getPaymentMethod().selectOption(method);
    }

    async fillBankTransferDetails(data: {
        bankName: string;
        accountName: string;
        accountNumber: string;
    }): Promise<void> {
        await this.getBankName().fill(data.bankName);
        await this.getAccountName().fill(data.accountName);
        await this.getAccountNumber().fill(data.accountNumber);
    }

    async fillCreditCardDetails(data: {
        cardNumber: string;
        expirationDate: string;
        cvv: string;
        cardHolderName: string;
    }): Promise<void> {
        await this.getCreditCardNumber().fill(data.cardNumber);
        await this.getExpirationDate().fill(data.expirationDate);
        await this.getCvv().fill(data.cvv);
        await this.getCardHolderName().fill(data.cardHolderName);
    }

    async fillGiftCardDetails(data: {
        giftCardNumber: string;
        validationCode: string;
    }): Promise<void> {
        await this.getGiftCardNumber().fill(data.giftCardNumber);
        await this.getValidationCode().fill(data.validationCode);
    }

    async selectMonthlyInstallments(value: '3' | '6' | '9' | '12'): Promise<void> {
        await this.getMonthlyInstallments().selectOption(value);
    }

    async confirmPayment(): Promise<void> {
        await expect(this.getFinishButton()).toBeEnabled();
        await this.getFinishButton().click();
    }

    async verifyPaymentSuccessful(): Promise<void> {
        await expect(this.getPaymentErrorMessage()).not.toBeVisible();
        await expect(this.getPaymentSuccessMessage()).toBeVisible();
        await expect(this.getPaymentSuccessMessage()).toContainText('Payment was successful');
    }







}
