/**
 * Classification Utility for Counseling Notifications
 * Uses regular expressions to categorize notifications into Rounds and Types.
 */

// Regex patterns for Rounds
const ROUND_PATTERNS = {
    'round_1': /\b(round[- ]?1|first[- ]?round|1st[- ]?round)\b/i,
    'round_2': /\b(round[- ]?2|second[- ]?round|2nd[- ]?round)\b/i,
    'round_3': /\b(round[- ]?3|third[- ]?round|3rd[- ]?round)\b/i,
    'mop_up': /\b(mop[- ]?up)\b/i,
    'stray': /\b(stray[- ]?vacancy)\b/i,
    'special_stray': /\b(special[- ]?stray)\b/i
};

// Regex patterns for Event Types
const TYPE_PATTERNS = {
    'merit_list': /\b(merit[- ]?list|rank[- ]?card|eligible[- ]?candidates)\b/i,
    'allotment': /\b(allotment|selection[- ]?list|result)\b/i,
    'seat_matrix': /\b(seat[- ]?matrix|vacancy[- ]?position|seat[- ]?distribution)\b/i,
    'schedule': /\b(schedule|date|time[- ]?table|calendar)\b/i,
    'notice': /\b(notice|notification|advertisement|advt)\b/i
};

/**
 * Classify a notification title into a Round and Type
 * @param {string} title - The notification title
 * @returns {object} - { round: string, type: string }
 */
function classifyNotification(title) {
    let detectedRound = 'general';
    let detectedType = 'other';

    // check keys in specific order to handle overlaps (e.g. Special Stray vs Stray)
    // "special_stray" should be checked before "stray"
    if (ROUND_PATTERNS.special_stray.test(title)) detectedRound = 'special_stray';
    else if (ROUND_PATTERNS.stray.test(title)) detectedRound = 'stray';
    else if (ROUND_PATTERNS.mop_up.test(title)) detectedRound = 'mop_up';
    else if (ROUND_PATTERNS.round_3.test(title)) detectedRound = 'round_3';
    else if (ROUND_PATTERNS.round_2.test(title)) detectedRound = 'round_2';
    else if (ROUND_PATTERNS.round_1.test(title)) detectedRound = 'round_1';

    // Check Type
    for (const [key, regex] of Object.entries(TYPE_PATTERNS)) {
        if (regex.test(title)) {
            detectedType = key;
            break; // Stop at first match or define priority? usually first match is fine if ordered
        }
    }

    return { round: detectedRound, type: detectedType };
}

module.exports = {
    classifyNotification,
    ROUND_PATTERNS,
    TYPE_PATTERNS
};
