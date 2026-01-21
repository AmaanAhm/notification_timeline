const fs = require('fs');
const path = require('path');

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path to create
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
    }
}

/**
 * Sanitize filename to remove invalid characters
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9_\-\.]/gi, '_')
        .replace(/_+/g, '_')
        .substring(0, 200); // Limit filename length
}

/**
 * Save metadata to JSON file
 * @param {string} dirPath - Directory path
 * @param {Array} announcements - Array of announcements
 * @param {Object} stats - Statistics object
 */
function saveMetadata(dirPath, announcements, stats) {
    const metadataPath = path.join(dirPath, 'metadata.json');
    
    const metadata = {
        lastUpdated: new Date().toISOString(),
        totalAnnouncements: announcements.length,
        statistics: stats,
        announcements: announcements
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📄 Saved metadata to: ${metadataPath}`);
}

/**
 * Load existing metadata
 * @param {string} dirPath - Directory path
 * @returns {Object|null} - Metadata object or null if not found
 */
function loadMetadata(dirPath) {
    const metadataPath = path.join(dirPath, 'metadata.json');
    
    try {
        if (fs.existsSync(metadataPath)) {
            const data = fs.readFileSync(metadataPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading metadata:', error.message);
    }
    
    return null;
}

module.exports = {
    ensureDirectoryExists,
    sanitizeFilename,
    saveMetadata,
    loadMetadata
};
