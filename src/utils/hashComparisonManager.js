const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate SHA-256 hash from announcement data
 * @param {Object} announcement - Announcement object containing url and title
 * @returns {string} - SHA-256 hash
 */
function generateHash(announcement) {
    let urlToHash = announcement.url;

    // For AWS S3 URLs, the query parameters (tokens/signatures) change constantly
    // We strip them to get a stable identifier for the same file
    if (urlToHash.includes('s3.ap-south-1.amazonaws.com') || urlToHash.includes('X-Amz-Signature')) {
        try {
            const urlObj = new URL(urlToHash);
            urlToHash = urlObj.origin + urlObj.pathname;
        } catch (e) {
            // If URL parsing fails, fall back to title-only or original URL
        }
    }

    const data = `${urlToHash}|${announcement.title}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Load previously seen hashes from file
 * @param {string} hashFilePath - Path to hash storage file
 * @returns {Set} - Set of previously seen hashes
 */
function loadSeenHashes(hashFilePath) {
    try {
        if (fs.existsSync(hashFilePath)) {
            const data = fs.readFileSync(hashFilePath, 'utf8');
            const hashes = JSON.parse(data);
            return new Set(hashes);
        }
    } catch (error) {
        console.error('Error loading hash file:', error.message);
    }
    return new Set();
}

/**
 * Save current hashes to file
 * @param {string} hashFilePath - Path to hash storage file
 * @param {Set} hashes - Set of hashes to save
 */
function saveHashes(hashFilePath, hashes) {
    try {
        const hashArray = Array.from(hashes);
        fs.writeFileSync(hashFilePath, JSON.stringify(hashArray, null, 2));
    } catch (error) {
        console.error('Error saving hash file:', error.message);
    }
}

/**
 * Filter new announcements based on hash comparison and physical file existence
 * @param {Array} announcements - Array of announcement objects
 * @param {string} hashFilePath - Path to hash storage file
 * @param {string} [downloadDir] - Optional path to check if file physically exists
 * @param {Object} [existingMetadata] - Optional existing metadata to find saved filename
 * @returns {Object} - Object containing newAnnouncements and updatedHashes
 */
function filterNewAnnouncements(announcements, hashFilePath, downloadDir = null, existingMetadata = null) {
    const seenHashes = loadSeenHashes(hashFilePath);
    const newAnnouncements = [];
    const currentHashes = new Set();

    // Map existing hashes to filenames for quick lookup
    const hashToFileMap = new Map();
    if (existingMetadata && existingMetadata.announcements) {
        for (const ann of existingMetadata.announcements) {
            if (ann.hash && ann.savedAs) {
                hashToFileMap.set(ann.hash, ann.savedAs);
            }
        }
    }

    for (const announcement of announcements) {
        const hash = generateHash(announcement);
        currentHashes.add(hash);

        let shouldDownload = !seenHashes.has(hash);

        // If it's "seen", but we have download directory, check if physical file is missing
        if (!shouldDownload && downloadDir) {
            const savedFilename = hashToFileMap.get(hash);
            if (savedFilename) {
                const filePath = path.join(downloadDir, savedFilename);
                if (!fs.existsSync(filePath)) {
                    console.log(`  🔍 Hash exists but file is missing: ${savedFilename}. Marking for re-download.`);
                    shouldDownload = true;
                }
            }
        }

        if (shouldDownload) {
            announcement.hash = hash;
            newAnnouncements.push(announcement);
        }
    }

    return {
        newAnnouncements,
        currentHashes,
        totalScraped: announcements.length,
        totalNew: newAnnouncements.length,
        totalPrevious: seenHashes.size
    };
}

module.exports = {
    generateHash,
    loadSeenHashes,
    saveHashes,
    filterNewAnnouncements
};
