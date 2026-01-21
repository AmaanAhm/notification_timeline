const path = require('path');

const CONFIG = {
    // Base directories
    dataDir: path.join(__dirname, '..', 'data'),
    downloadsDir: path.join(__dirname, '..', 'downloads'),

    // Websites configuration
    websites: [
        {
            id: 'dme_assam',
            name: 'DME Assam',
            url: 'https://dme.assam.gov.in/latest/admission-notice-ugpgothersnew',
            scraper: 'scrapeDMEAssam',
            enabled: true
        },
        {
            id: 'apdhte',
            name: 'APDHTE',
            url: 'https://apdhte.nic.in/JEE_dhe_24.htm',
            scraper: 'scrapeAPDHTE',
            enabled: true
        },
        {
            id: 'bceceb_bihar',
            name: 'BCECEB Bihar',
            url: 'https://bceceboard.bihar.gov.in/UGMACIndex.php',
            scraper: 'scrapeBCECEBBihar',
            enabled: true
        },
        {
            id: 'gmch',
            name: 'GMCH',
            url: 'https://gmch.gov.in/centralized-admission-prospectus-mbbsbdsbhms-courses-session-2025',
            scraper: 'scrapeGMCH',
            enabled: true
        },
        {
            id: 'hry',
            name: 'Haryana Medical Recruitment',
            url: 'https://hry.online-counselling.co.in/',
            scraper: 'scrapeHRY',
            enabled: true
        }
    ],

    // Scraping settings
    settings: {
        delayBetweenDownloads: 1000, // ms
        requestTimeout: 30000, // ms
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
};

module.exports = CONFIG;
