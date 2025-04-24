import { Page } from 'playwright';
import { waitWhileGoogleLoading } from './utils.js';
import { GoogleHotelsOptions } from './options.js';
import { DEFAULT_NUM_OF_ADULTS, MAX_NUM_OF_PEOPLE } from '../constants.js';

export const fillCheckInDate = async (page: Page, checkInDate: string, checkOutDate: string) => {
    const checkInLocator = page.locator('span#prices input[aria-label="Check-in"]').last();
    await checkInLocator.waitFor();
    await checkInLocator.click();

    const checkInLocatorDialog = page.locator(
        'div[role="dialog"] > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > input[aria-label="Check-in"]',
    );
    const checkOutLocatorDialog = page.locator(
        'div[role="dialog"] > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > input[aria-label="Check-out"]',
    );

    await checkInLocatorDialog.waitFor();
    await checkOutLocatorDialog.waitFor();

    await checkInLocatorDialog.fill(checkInDate);
    await checkOutLocatorDialog.click();
    await page.waitForTimeout(1000);
    await checkOutLocatorDialog.fill(checkOutDate);
    await checkOutLocatorDialog.press('Enter');

    const submitButton = await page.waitForSelector('div[role="dialog"] > div:nth-of-type(4) > div > button:nth-of-type(2)');
    await submitButton.click();
    await page.waitForTimeout(1000);
    await waitWhileGoogleLoading(page);
};

export const fillInputForm = async (page: Page, options: GoogleHotelsOptions) => {
    await fillCheckInDate(page, options.checkInDate, options.checkOutDate);
    const peopleButton = await page.waitForSelector('span#prices div[role="button"][aria-label^="Number of travelers"]');
    await peopleButton.click();
    await page.waitForTimeout(1000);

    let adults = DEFAULT_NUM_OF_ADULTS;

    while (adults > options.numberOfAdults && adults > 0) {
        const removeAdultButton = await page.waitForSelector('span#prices button[aria-label="Remove adult"]');
        await removeAdultButton.click();
        adults--;
    }
    while (adults < options.numberOfAdults && adults <= MAX_NUM_OF_PEOPLE) {
        const addAdultButton = await page.waitForSelector('span#prices button[aria-label="Add adult"]');
        await addAdultButton.click();
        adults++;
    }

    const peopleDoneButton = await page.waitForSelector(
        'span#prices div[data-default-adult-num="2"] > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button',
    );
    await peopleDoneButton.click();
    await page.waitForTimeout(1000);

    const currencyButton = await page.locator('span#prices footer div c-wiz button').last();
    await currencyButton.waitFor();
    await currencyButton.click();
    await page.waitForTimeout(1000);
    const requiredCurrency = options.currencyCode;
    const currencyRadio = page.locator(`div[role="radio"][data-value="${requiredCurrency.toUpperCase()}"]`).first();
    await currencyRadio.waitFor();
    await currencyRadio.click();
    const currencyDoneButton = page.locator('div[aria-label="Select currency"] > div:nth-of-type(3) > div:nth-of-type(2) > button').first();
    await currencyDoneButton.waitFor();
    await currencyDoneButton.click();
    await waitWhileGoogleLoading(page);
    await page.waitForTimeout(1000);
};
