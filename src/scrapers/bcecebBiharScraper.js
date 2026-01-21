const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape BCECEB Bihar website for announcements
 * @param {string} url - Website URL
 * @returns {Promise<Array>} - Array of announcement objects
 */
async function scrapeBCECEBBihar(url) {
    console.log(`\n🔍 Fetching page: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const announcements = [];
        
        $('li').each((index, element) => {
            const $li = $(element);
            const $link = $li.find('a[href*=".pdf"]');
            
            if ($link.length > 0) {
                const pdfUrl = $link.attr('href');
                const title = $link.clone().children('img').remove().end().text().trim();
                
                const fullUrl = pdfUrl.startsWith('http') 
                    ? pdfUrl 
                    : `https://bceceboard.bihar.gov.in/${pdfUrl}`;
                
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
        console.error(`❌ Error scraping BCECEB Bihar:`, error.message);
        throw error;
    }
}

module.exports = { scrapeBCECEBBihar };
