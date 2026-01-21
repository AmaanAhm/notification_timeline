const crypto = require('crypto');

// Keywords configuration
const KEYWORDS = {
    KEEP: ['Round 1', 'Round 2', 'Mop-up', 'Merit List', 'Seat Matrix', 'Schedule'],
    DISCARD: ['Tender', 'Recruitment', 'Quotation', 'Walk-in', 'Corrigendum']
};

/**
 * Generate a unique ID for the notification
 * @param {string} url - The URL of the file
 * @param {string} title - The title of the notification
 * @returns {string} - Unique hash ID
 */
function generateNotificationId(url, title) {
    let urlToHash = url;

    // Strip temporary tokens from S3 URLs for stable ID
    if (urlToHash.includes('s3.ap-south-1.amazonaws.com') || urlToHash.includes('X-Amz-Signature')) {
        try {
            const urlObj = new URL(urlToHash);
            urlToHash = urlObj.origin + urlObj.pathname;
        } catch (e) { }
    }

    const data = `${urlToHash}|${title}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Determine the round tag based on the title
 * @param {string} title - The notification title
 * @returns {string} - The detected tag or 'General'
 */
function getRoundTag(title) {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('round 1')) return 'Round 1';
    if (titleLower.includes('round 2')) return 'Round 2';
    if (titleLower.includes('mop-up')) return 'Mop-up';
    if (titleLower.includes('merit list')) return 'Merit List';
    if (titleLower.includes('seat matrix')) return 'Seat Matrix';
    if (titleLower.includes('schedule')) return 'Schedule';

    return 'General';
}

const { classifyNotification } = require('./classifier');

/**
 * Process announcements: Filter and Transform into a Timeline
 * @param {Array} announcements - Raw announcements from scraper
 * @param {string} websiteName - Name of the website/state
 * @returns {object} - { timeline: object, latestUpdates: array }
 */
function processAnnouncements(announcements, websiteName) {
    const timeline = {
        website: websiteName,
        updatedAt: new Date().toISOString(),
        rounds: {
            round_1: { label: "Round 1 Counselling", events: [] },
            round_2: { label: "Round 2 Counselling", events: [] },
            round_3: { label: "Round 3 Counselling", events: [] },
            mop_up: { label: "Mop-Up Round", events: [] },
            stray: { label: "Stray Vacancy Round", events: [] },
            special_stray: { label: "Special Stray Vacancy Round", events: [] },
            general: { label: "General Notices", events: [] }
        }
    };

    const latestUpdates = [];

    for (const item of announcements) {
        const title = item.title;
        const titleLower = title.toLowerCase();

        // 1. Check Discard Keywords
        const shouldDiscard = KEYWORDS.DISCARD.some(keyword =>
            titleLower.includes(keyword.toLowerCase())
        );
        if (shouldDiscard) continue;

        // 2. Classify
        const { round, type } = classifyNotification(title);

        // 3. Create Event Object
        const event = {
            id: generateNotificationId(item.url, title),
            title: title,
            date: item.date || item.scrapedDate, // Prefer explicit date if available
            type: type,
            url: item.url,
            isNew: false // Can be updated by comparing with previous state if needed
        };

        // 4. Add to Timeline
        if (timeline.rounds[round]) {
            timeline.rounds[round].events.push(event);
        } else {
            // Fallback for unexpected rounds, though 'general' catches most
            timeline.rounds.general.events.push(event);
        }

        // Add to latest updates (flat list for quick access)
        latestUpdates.push(event);
    }

    // Sort events in each round by date (descending) if possible, or keep scraped order
    // Assuming announcements come in order, but we can enforce it here if needed.

    return { timeline, latestUpdates };
}

module.exports = {
    processAnnouncements,
    KEYWORDS
};
