const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape DME Assam website for announcements
 * @param {string} url - Website URL
 * @returns {Promise<Array>} - Array of announcement objects
 */
async function scrapeDMEAssam(url) {
    console.log(`\n🔍 Fetching page: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const announcements = [];
        
        $('tr').each((index, element) => {
            const $row = $(element);
            const $link = $row.find('a[href*=".pdf"]').first();
            
            if ($link.length > 0) {
                const pdfUrl = $link.attr('href');
                const title = $link.text().trim() || $link.attr('title') || 'untitled';
                const fileSize = $row.find('td').eq(1).text().trim();
                
                const fullUrl = pdfUrl.startsWith('http') 
                    ? pdfUrl 
                    : `https://dme.assam.gov.in${pdfUrl}`;
                
                announcements.push({
                    title: title,
                    url: fullUrl,
                    fileSize: fileSize,
                    scrapedDate: new Date().toISOString()
                });
            }
        });

        console.log(`📊 Found ${announcements.length} announcements`);
        return announcements;
        
    } catch (error) {
        console.error(`❌ Error scraping DME Assam:`, error.message);
        throw error;
    }
}

module.exports = { scrapeDMEAssam };
