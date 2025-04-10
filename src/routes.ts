import { Dataset, createPlaywrightRouter } from 'crawlee';
import { skipGoogleConsent } from './scraper/utils.js';
import { GoogleHotelsOptions } from './scraper/options.js';
import { getDetailsUrls } from './scraper/list.js';
import { getHotelItemData } from './scraper/detail.js';

export const createGoogleHotelsRouter = (options: GoogleHotelsOptions) => {
    const router = createPlaywrightRouter();

    router.addDefaultHandler(async (ctx) => {
        const { request, page, log, enqueueLinks } = ctx;
        log.info(`parsing Google Hotel`, { url: request.loadedUrl });

        // Get rid of the Google consent dialog
        await skipGoogleConsent(request, page);

        const item = await getHotelItemData(ctx);
        await Dataset.pushData(item);
    });

    router.addHandler('detail', async (ctx) => {
        const { request, page } = ctx;
        // Get rid of the Google consent dialog
        await skipGoogleConsent(request, page);
        const item = await getHotelItemData(ctx);
        await Dataset.pushData(item);
    });

    return router;
};
