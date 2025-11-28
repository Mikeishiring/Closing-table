/**
 * Core mechanism for the Closing Table negotiation
 * Pure function that computes the outcome based on company max and candidate min
 */
function computeOutcome(cMax, cMin) {
    const BRIDGE_ZONE_PCT = 0.10;
    const ROUNDING_GRANULARITY = 1000;

    if (cMin <= cMax) {
        // Success: Overlap found. Split the difference.
        const surplus = cMax - cMin;
        const rawFinal = cMin + surplus / 2;
        const final = Math.round(rawFinal / ROUNDING_GRANULARITY) * ROUNDING_GRANULARITY;
        return { status: 'success', final, surplus, gap: null };
    } else if (cMin <= cMax * (1 + BRIDGE_ZONE_PCT)) {
        // Close failure: within bridge zone -> Recommendation to Talk
        const gap = cMin - cMax;
        return { status: 'close', final: null, surplus: null, gap };
    } else {
        // Hard failure
        const gap = cMin - cMax;
        return { status: 'fail', final: null, surplus: null, gap };
    }
}

module.exports = { computeOutcome };

