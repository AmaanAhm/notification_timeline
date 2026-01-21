const axios = require('axios');
const fs = require('fs');

/**
 * Download PDF file from URL
 * @param {string} url - PDF URL
 * @param {string} filepath - Destination file path
 * @returns {Promise} - Promise that resolves when download completes
 */
async function downloadPDF(url, filepath) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            timeout: 30000 // 30 second timeout
        });

        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Failed to download PDF: ${error.message}`);
    }
}

/**
 * Download multiple PDFs with progress tracking
 * @param {Array} announcements - Array of announcement objects
 * @param {string} downloadDir - Download directory path
 * @param {Function} sanitizeFilename - Function to sanitize filenames
 * @returns {Object} - Statistics about downloads
 */
async function downloadAnnouncements(announcements, downloadDir, sanitizeFilename) {
    const stats = {
        total: announcements.length,
        downloaded: 0,
        failed: 0,
        skipped: 0
    };

    for (let i = 0; i < announcements.length; i++) {
        const announcement = announcements[i];
        console.log(`\n[${i + 1}/${announcements.length}] Processing: ${announcement.title}`);
        
        // Create filename from title
        const timestamp = new Date().toISOString().split('T')[0];
        const sanitizedTitle = sanitizeFilename(announcement.title);
        const filename = `${timestamp}_${sanitizedTitle}.pdf`;
        const filepath = require('path').join(downloadDir, filename);
        
        // Store filename in announcement object
        announcement.savedAs = filename;
        
        // Check if file already exists
        if (fs.existsSync(filepath)) {
            console.log(`  ⏭️  Already exists: ${filename}`);
            stats.skipped++;
            continue;
        }
        
        // Download the PDF
        try {
            await downloadPDF(announcement.url, filepath);
            console.log(`  ✅ Downloaded: ${filename}`);
            stats.downloaded++;
        } catch (error) {
            console.error(`  ❌ Failed to download: ${error.message}`);
            stats.failed++;
        }
        
        // Small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return stats;
}

module.exports = {
    downloadPDF,
    downloadAnnouncements
};
