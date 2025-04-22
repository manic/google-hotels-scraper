import { Dataset, createPlaywrightRouter } from 'crawlee';
import { addOneDayToDate, skipGoogleConsent, waitWhileGoogleLoading } from './scraper/utils.js';
import { GoogleHotelsOptions } from './scraper/options.js';
import { fillCheckInDate, fillInputForm } from './scraper/list.js';
import { getHotelItemData } from './scraper/detail.js';

export const createGoogleHotelsRouter = (options: GoogleHotelsOptions) => {
    const router = createPlaywrightRouter();

    router.addDefaultHandler(async (ctx) => {
        const { request, page, log } = ctx;
        let { checkInDate, checkOutDate } = options;
        log.info(`parsing Google Hotel`, { url: request.loadedUrl });
        log.info(`Got options`, options);

        // Get rid of the Google consent dialog
        await skipGoogleConsent(request, page);

        log.info(`[1st] fill checkin-date: ${checkInDate}, checkout-date: ${checkOutDate}`);
        await fillInputForm(page, options);
        await waitWhileGoogleLoading(page);
        await page.waitForTimeout(1000);

        const item = await getHotelItemData(ctx);
        await Dataset.pushData({ ...item, checkInDate, checkOutDate });

        // TODO: get next 10 days data, would try to get 60 days
        for (let i = 0; i < 10; i++) {
            checkInDate = addOneDayToDate(checkInDate);
            checkOutDate = addOneDayToDate(checkOutDate);
            log.info(`[${i + 2}] fill checkin-date: ${checkInDate}, checkout-date: ${checkOutDate}`);
            await fillCheckInDate(page, checkInDate, checkOutDate);
            await waitWhileGoogleLoading(page);
            await page.waitForTimeout(1000);

            const hotelItem = await getHotelItemData(ctx);
            await Dataset.pushData({ ...hotelItem, checkInDate, checkOutDate });
        }
    });

    return router;
};
