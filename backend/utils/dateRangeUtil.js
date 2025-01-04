/**
 * Utility class for handling date range calculations
 */
class DateRangeUtil {
    static TIME_FILTERS = {
        MONTHLY: 'monthly',
        QUARTERLY: 'quarterly',
        HALF_YEARLY: 'half-yearly',
        YEARLY: 'yearly'
    };

    /**
     * Validates the provided time filter
     * @param {string} timeFilter 
     * @returns {boolean}
     */
    static isValidTimeFilter(timeFilter) {
        return Object.values(this.TIME_FILTERS).includes(timeFilter);
    }

    /**
     * Get date range based on time filter
     * @param {string} timeFilter - 'monthly'|'quarterly'|'half-yearly'|'yearly'
     * @returns {Object} Object containing startDate and endDate
     * @throws {Error} If invalid timeFilter provided
     */
    static getDateRange(timeFilter) {
        if (timeFilter && !this.isValidTimeFilter(timeFilter)) {
            throw new Error(
                `Invalid time filter. Must be one of: ${Object.values(this.TIME_FILTERS).join(', ')}`
            );
        }

        const now = new Date();
        const startDate = new Date(now); // Create new instance to avoid mutation

        switch(timeFilter) {
            case this.TIME_FILTERS.MONTHLY:
                startDate.setMonth(now.getMonth() - 1);
                break;
            case this.TIME_FILTERS.QUARTERLY:
                startDate.setMonth(now.getMonth() - 3);
                break;
            case this.TIME_FILTERS.HALF_YEARLY:
                startDate.setMonth(now.getMonth() - 6);
                break;
            case this.TIME_FILTERS.YEARLY:
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setFullYear(now.getFullYear() - 1); // Default to 1 year
        }
        
        // Set time to start/end of day
        startDate.setHours(0, 0, 0, 0);
        now.setHours(23, 59, 59, 999);
        
        return { startDate, endDate: now };
    }
}

module.exports = DateRangeUtil;
