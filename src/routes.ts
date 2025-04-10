import { Dataset, createPlaywrightRouter } from 'crawlee';
import { skipGoogleConsent, waitWhileGoogleLoading } from './scraper/utils.js';
import { GoogleHotelsOptions } from './scraper/options.js';
import { fillInputForm } from './scraper/list.js';
import { getHotelItemData } from './scraper/detail.js';

export const createGoogleHotelsRouter = (options: GoogleHotelsOptions) => {
    const router = createPlaywrightRouter();

    router.addDefaultHandler(async (ctx) => {
        const { request, page, log, enqueueLinks } = ctx;
        log.info(`parsing Google Hotel`, { url: request.loadedUrl });
        log.info(`Got options`, options);

        // Get rid of the Google consent dialog
        await skipGoogleConsent(request, page);

        await fillInputForm(page, options);
        await waitWhileGoogleLoading(page);
        await page.waitForTimeout(1000);

        const item = await getHotelItemData(ctx);
        await Dataset.pushData(item);
    });

    return router;
};
