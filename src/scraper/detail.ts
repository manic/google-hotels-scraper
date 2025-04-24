import { LoadedRequest, PlaywrightCrawlingContext, Request } from 'crawlee';

export interface GoogleHotelItemData {
    url: string;
    title: string;
    prices: { provider: string, price: number, otaUrl: string, label: string }[];
}

export const getHotelItemData = async <Context extends PlaywrightCrawlingContext>(ctx: Omit<Context, 'request'> & {
    request: LoadedRequest<Request>;
}): Promise<GoogleHotelItemData> => {
    const { page, log } = ctx;

    const title = await page.locator('h1.QORQHb').last().innerText();
    const url = page.url();
    const currency = await page.locator('span.twocKe').first().innerText();
    log.info(`Check`, { currency });
    log.info(`Parsed detail (${title})`, { url: page.url() });

    const pricesLinks = await page.locator('span#prices div[data-partner-id] a[data-hveid][data-is-organic="true"]').all();
    log.info(`Got pricesLinks`, { pricesLinks: pricesLinks.length });
    const prices = (await Promise.all(pricesLinks.map(async (link) => {
        const otaUrl = await link.getAttribute('href');
        const provider = await link.locator('div.lUblwd.kFOiFc span[data-click-type="268"]').first().innerText();
        let price = null;
        if (await link.locator('span.QoBrxc span.nDkDDb').count()) {
            const priceLocator = link.locator('span.QoBrxc span.nDkDDb').first();
            const unwantedLocator = priceLocator.locator('span.UVn6Tc');
            const originalText = await priceLocator.innerText();
            const unwantedText = (await unwantedLocator.count()) > 0 ? await unwantedLocator.innerText() : '';
            log.info(`Got price`, { provider, originalText, unwantedText });
            const priceText = originalText.replace(unwantedText, '').trim();
            price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        } else {
            log.info(`No price found for provider`, { provider });
        }

        let label = 'ota';
        if (await link.locator('span.Dwqcqd').count()) {
            label = 'official';
        }
        return { provider, price, otaUrl, label };
    }))).filter((price, i, arr) => price !== null && arr.findIndex((o) => o?.provider === price.provider) === i) as GoogleHotelItemData['prices'];
    log.info(`Got`, { prices });

    return {
        url,
        title,
        prices,
    };
};
