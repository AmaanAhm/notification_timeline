const { scrapeDMEAssam } = require('./dmeAssamScraper');
const { scrapeAPDHTE } = require('./apdhteScraper');
const { scrapeBCECEBBihar } = require('./bcecebBiharScraper');
const { scrapeGMCH } = require('./gmchScraper');
const { scrapeHRY } = require('./dmerScraper');

module.exports = {
    scrapeDMEAssam,
    scrapeAPDHTE,
    scrapeBCECEBBihar,
    scrapeGMCH,
    scrapeHRY
};
