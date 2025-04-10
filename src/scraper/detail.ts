import { LoadedRequest, PlaywrightCrawlingContext, Request } from 'crawlee';

export interface GoogleHotelItemData {
    url: string;
    title: string;
    prices: { provider: string, price: number }[];
}

export const getHotelItemData = async <Context extends PlaywrightCrawlingContext>(ctx: Omit<Context, 'request'> & {
    request: LoadedRequest<Request>;
}): Promise<GoogleHotelItemData> => {
    const { page, log } = ctx;

    const title = await page.locator('h1.QORQHb').last().innerText();
    const url = page.url();
    const currency = await page.locator('span.twocKe').first().innerText();
    log.info(`Check`, { currency: currency });
    log.info(`Parsed detail (${title})`, { url: page.url() });
    const [pricesTab] = await Promise.all([
        page.waitForSelector('div[id="prices"]'),
    ]);

    await pricesTab.click();

    const pricesDivs = await page.locator('div.ADs2Tc div.zIL9xf.xIAdxb').all();
    const prices = (await Promise.all(pricesDivs.map(async (div) => {
        const provider = await div.locator('div.lUblwd.kFOiFc span[data-click-type="268"]').first().innerText();
        const textPrice = await div.locator('span.QoBrxc span.nDkDDb').first().innerText();
        const price = parseFloat(textPrice.replace(/[^0-9.]/g, ''));
        return { provider, price }
    }))).filter((price, i, arr) => price !== null && arr.findIndex((o) => o?.provider === price.provider) === i) as GoogleHotelItemData['prices'];
    log.info(`Got`, { prices: prices })

    return {
        url,
        title,
        prices,
    };
};
