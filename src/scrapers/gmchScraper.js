const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape GMCH website for announcements
 * @param {string} url - Website URL
 * @returns {Promise<Array>} - Array of announcement objects
 */
async function scrapeGMCH(url) {
    console.log(`\n🔍 Fetching page: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const announcements = [];
        const baseUrl = 'https://gmch.gov.in';
        
        // Find all links in table rows within the table-responsive div
        $('.table-responsive table tr').each((index, element) => {
            const $row = $(element);
            const $link = $row.find('a[href*=".pdf"], a[href*=".PDF"]');
            
            if ($link.length > 0) {
                const href = $link.attr('href');
                const title = $link.text().trim();
                
                // Skip empty titles
                if (!title || title.length === 0) {
                    return;
                }
                
                // Handle relative URLs
                const fullUrl = href.startsWith('http') 
                    ? href 
                    : `${baseUrl}${href}`;
                
                announcements.push({
                    title: title,
                    url: fullUrl,
                    scrapedDate: new Date().toISOString()
                });
            }
        });

        console.log(`📊 Found ${announcements.length} announcements`);
        return announcements;
        
    } catch (error) {
        console.error(`❌ Error scraping GMCH:`, error.message);
        throw error;
    }
}

module.exports = { scrapeGMCH };
