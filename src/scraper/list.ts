import { Page } from 'playwright';
import { waitWhileGoogleLoading } from './utils.js';
import { GoogleHotelsOptions } from './options.js';

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
    /*
    const peopleButton = await page.waitForSelector('div[role="button"][aria-label^="Number of travelers"]');
    await peopleButton.click();
    await page.waitForTimeout(1000);

    let adults = DEFAULT_NUM_OF_ADULTS;
    let children = DEFAULT_NUM_OF_CHILDREN;

    while (adults > options.numberOfAdults && adults > 0) {
        const removeAdultButton = await page.waitForSelector('button[aria-label="Remove adult"]');
        await removeAdultButton.click();
        adults--;
    }
    while (adults < options.numberOfAdults && (adults + children) <= MAX_NUM_OF_PEOPLE) {
        const addAdultButton = await page.waitForSelector('button[aria-label="Add adult"]');
        await addAdultButton.click();
        adults++;
    }
    while (children > options.numberOfChildren && children >= 0) {
        const removeChildButton = await page.waitForSelector('button[aria-label="Remove child"]');
        await removeChildButton.click();
        children--;
    }
    while (children < options.numberOfChildren && (adults + children) <= MAX_NUM_OF_PEOPLE) {
        const addChildButton = await page.waitForSelector('button[aria-label="Add child"]');
        await addChildButton.click();
        children++;
    }

    const peopleDoneButton = await page.waitForSelector(
        'div[data-default-adult-num="2"] > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button',
    );
    await peopleDoneButton.click();
    */
    const currencyButton = await page.locator('footer div c-wiz button').last();
    await currencyButton.waitFor();
    await currencyButton.click();
    await page.waitForTimeout(1000);
    const requiredCurrency = options.currencyCode;
    const currencyRadio = await page.waitForSelector(`div[role="radio"][data-value="${requiredCurrency.toUpperCase()}"]`);
    await currencyRadio.click();
    const currencyDoneButton = await page.waitForSelector('div[aria-label="Select currency"] > div:nth-of-type(3) > div:nth-of-type(2) > button');
    await currencyDoneButton.click();
};
