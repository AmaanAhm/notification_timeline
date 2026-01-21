const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape APDHTE website for announcements
 * @param {string} url - Website URL
 * @returns {Promise<Array>} - Array of announcement objects
 */
async function scrapeAPDHTE(url) {
    console.log(`\n🔍 Fetching page: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const announcements = [];
        const baseUrl = 'https://apdhte.nic.in/';
        
        $('li').each((index, element) => {
            const $li = $(element);
            
            $li.find('a').each((linkIndex, linkElement) => {
                const $link = $(linkElement);
                const href = $link.attr('href');
                
                if (href && href.toLowerCase().includes('.pdf')) {
                    const title = $link.text().trim() || 'untitled';
                    
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
        });

        console.log(`📊 Found ${announcements.length} announcements`);
        return announcements;
        
    } catch (error) {
        console.error(`❌ Error scraping APDHTE:`, error.message);
        throw error;
    }
}

module.exports = { scrapeAPDHTE };
