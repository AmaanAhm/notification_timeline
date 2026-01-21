const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/**
 * Scrape Haryana Medical Recruitment Online Counselling website for announcements
 * Fetches data directly from their dynamic API to get valid pre-signed S3 PDF links.
 * @param {string} url - Website URL (for logging)
 * @returns {Promise<Array>} - Array of announcement objects
 */
async function scrapeHRY(url) {
    const API_URL = 'https://hryapi.online-counselling.co.in/v1/api/notifications';
    console.log(`\n🔍 Fetching notifications from API: ${API_URL}`);

    let browser;
    try {
        // Launch browser - we use Puppeteer to handle any environment-related fetch issues 
        // and to keep consistency with other scrapers.
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Use page.evaluate to perform the fetch within the browser context
        // to handle any potential CORS or session issues automatically.
        const responseData = await page.evaluate(async (apiUrl) => {
            const response = await fetch(apiUrl);
            return response.json();
        }, API_URL);

        const announcements = [];

        if (responseData && responseData.body && Array.isArray(responseData.body.notice)) {
            const notices = responseData.body.notice;

            for (const item of notices) {
                // The 'extension' field contains the actual pre-signed S3 URL for the PDF
                const pdfUrl = item.extension;
                const title = item.content || item.subject || 'Untitled Notification';
                const type = item.subject || 'Notification';
                const date = item.publishDate || '';

                if (pdfUrl) {
                    announcements.push({
                        title: title,
                        type: type,
                        date: date,
                        url: pdfUrl, // Use the actual S3 URL
                        description: title,
                        scrapedDate: new Date().toISOString()
                    });
                }
            }
        }

        console.log(`📊 Found ${announcements.length} valid notifications from API`);
        return announcements;

    } catch (error) {
        console.error(`❌ Error scraping HRY via API:`, error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeHRY };
