const path = require('path');
const CONFIG = require('./websitesConfig');
const scrapers = require('./scrapers');
const { ensureDirectoryExists, sanitizeFilename, saveMetadata } = require('./utils/fileSystemManager');
const { filterNewAnnouncements, saveHashes } = require('./utils/hashComparisonManager');
const { downloadAnnouncements } = require('./utils/pdfDownloader');
const { processAnnouncements } = require('./utils/notificationProcessor');

/**
 * Process a single website
 * @param {Object} website - Website configuration object
 */
async function processWebsite(website) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🌐 Processing: ${website.name}`);
    console.log(`${'='.repeat(60)}`);

    try {
        // Get the appropriate scraper function
        const scraperFunction = scrapers[website.scraper];
        if (!scraperFunction) {
            throw new Error(`Scraper function '${website.scraper}' not found`);
        }

        // Scrape the website
        const announcements = await scraperFunction(website.url);

        if (announcements.length === 0) {
            console.log('⚠️  No announcements found');
            return;
        }

        // Setup directories
        const downloadDir = path.join(CONFIG.downloadsDir, website.id);
        const dataDir = path.join(CONFIG.dataDir, website.id);
        ensureDirectoryExists(downloadDir);
        ensureDirectoryExists(dataDir);

        // Hash comparison to find new announcements
        const hashFile = path.join(dataDir, 'hashes.json');

        // Load existing metadata to check for missing files
        const { loadMetadata } = require('./utils/fileSystemManager');
        const existingMetadata = loadMetadata(dataDir);

        // Process notifications (Filter & Transform into Timeline)
        const { timeline, latestUpdates } = processAnnouncements(announcements, website.name);

        if (latestUpdates.length > 0) {
            // Save Timeline JSON
            const timelineFilePath = path.join(dataDir, 'timeline.json');
            require('fs').writeFileSync(timelineFilePath, JSON.stringify(timeline, null, 2));
            console.log(`✨ Generated timeline with ${latestUpdates.length} items`);

            // Save flat processed list (optional but good for debugging)
            const processedFilePath = path.join(dataDir, 'processed_notifications.json');
            require('fs').writeFileSync(processedFilePath, JSON.stringify(latestUpdates, null, 2));
        } else {
            console.log('⚠️  No relevant notifications found after filtering.');
            return;
        }

        // Use the classified/filtered list for deduplication and downloading
        // This ensures we don't download things we discarded (e.g. Tenders)
        const hashResult = filterNewAnnouncements(latestUpdates, hashFile, downloadDir, existingMetadata);

        console.log(`\n📈 Statistics:`);
        console.log(`   Total relevant: ${hashResult.totalScraped}`);
        console.log(`   Previously seen: ${hashResult.totalPrevious}`);
        console.log(`   New announcements: ${hashResult.totalNew}`);

        if (hashResult.totalNew === 0) {
            console.log('✅ No new announcements to download');
            return;
        }

        console.log(`\n📥 Downloading ${hashResult.totalNew} new PDFs...`);

        // Download only new announcements
        const downloadStats = await downloadAnnouncements(
            hashResult.newAnnouncements,
            downloadDir,
            sanitizeFilename
        );

        console.log(`\n📊 Download Summary:`);
        console.log(`   ✅ Downloaded: ${downloadStats.downloaded}`);
        console.log(`   ⏭️  Skipped: ${downloadStats.skipped}`);
        console.log(`   ❌ Failed: ${downloadStats.failed}`);

        // Save updated hashes
        saveHashes(hashFile, hashResult.currentHashes);
        console.log(`\n💾 Updated hash database`);

        // Save metadata with statistics
        saveMetadata(dataDir, announcements, {
            hashComparison: hashResult,
            downloads: downloadStats
        });

    } catch (error) {
        console.error(`❌ Failed to process ${website.name}:`, error.message);
    }
}

/**
 * Main function to run scraper
 */
async function main() {
    console.log('🚀 Government Announcement Scraper');
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`${'='.repeat(60)}\n`);

    // Create base directories
    ensureDirectoryExists(CONFIG.dataDir);
    ensureDirectoryExists(CONFIG.downloadsDir);

    // Process each enabled website
    const enabledWebsites = CONFIG.websites.filter(w => w.enabled);

    for (const website of enabledWebsites) {
        await processWebsite(website);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✨ Scraping completed!');
    console.log(`📅 Finished at: ${new Date().toLocaleString()}`);
    console.log(`${'='.repeat(60)}\n`);
}

// Run the scraper
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { processWebsite, main };
