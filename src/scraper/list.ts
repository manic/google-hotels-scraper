import { Page } from 'playwright';
import { LoadedRequest, PlaywrightCrawlingContext, Request } from 'crawlee';
import { waitWhileGoogleLoading } from './utils.js';
import { GoogleHotelsOptions } from './options.js';
import { DEFAULT_NUM_OF_ADULTS, DEFAULT_NUM_OF_CHILDREN, MAX_NUM_OF_PEOPLE } from '../constants.js';

// define type for callback function
type EnqueueDetails = (urls: string[]) => Promise<void>;

export const getDetailsUrls = async <Context extends PlaywrightCrawlingContext>(ctx: Omit<Context, 'request'> & {
    request: LoadedRequest<Request>;
}, options: GoogleHotelsOptions, enqueueDetails: EnqueueDetails) => {
    const { page, log } = ctx;
    // Wait for the input element to be present and the page to be loaded
    const element = await page.waitForSelector('input[aria-label="Search for places, hotels and more"]');
    log.info(await element.inputValue());

    await fillInputForm(page, options);
    await waitWhileGoogleLoading(page);
    await page.waitForTimeout(1000);

    // const nextPageButtonSelector = 'main > c-wiz > span > c-wiz > c-wiz:last-of-type > div > button:nth-of-type(2)';
    let hasNextPage = true;
    let pageNumber = 1;
    let totalItems = 0;
    do {
        const items = await page.$$('main > c-wiz > span > c-wiz > c-wiz > div > a');
        log.info(`Found ${items.length} items on the page ${pageNumber}`);
        const urls = await Promise.all(items.map(async (item) => (
            `https://www.google.com${await item.getAttribute('href')}`
        ))) as string[];

        if (options.maxResults === undefined) {
            await enqueueDetails(urls);
        } else {
            await enqueueDetails(urls.slice(0, options.maxResults - totalItems));
        }

        totalItems += items.length;
        const nextPageButton = page.getByRole('button').filter({ hasText: 'Next' }).first();
        // const nextPageButton = await page.$(nextPageButtonSelector);
        if (nextPageButton !== null && (options.maxResults === undefined || totalItems < options.maxResults!)) {
            await nextPageButton.click();
            await waitWhileGoogleLoading(page);
            await page.waitForTimeout(1000);
            pageNumber++;
        } else {
            hasNextPage = false;
        }
    } while (hasNextPage);
};

export const fillInputForm = async (page: Page, options: GoogleHotelsOptions) => {
    const checkInLocator = page.locator('input[aria-label="Check-in"]').last();
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

    await checkInLocatorDialog.fill(options.checkInDate);
    await checkOutLocatorDialog.click();
    await page.waitForTimeout(1000);
    await checkOutLocatorDialog.fill(options.checkOutDate);
    await checkOutLocatorDialog.press('Enter');

    const submitButton = await page.waitForSelector('div[role="dialog"] > div:nth-of-type(4) > div > button:nth-of-type(2)');
    await submitButton.click();

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
