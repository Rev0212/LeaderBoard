/**
 * Utility class for handling student year calculations and MongoDB queries
 */
class StudentYearUtil {
    static ACADEMIC_YEAR_START_MONTH = 7; // July
    static REGISTRATION_YEAR_START_INDEX = 2;
    static REGISTRATION_YEAR_LENGTH = 2;

    /**
     * Validates the target year
     * @param {number} targetYear 
     * @returns {boolean}
     */
    static isValidYear(targetYear) {
        return Number.isInteger(targetYear) && targetYear > 0;
    }

    /**
     * Generate MongoDB match expression for student year
     * @param {number} targetYear - Target academic year
     * @returns {Object} MongoDB match expression
     */
    static getStudentYearMatch(targetYear) {
        if (!targetYear || !this.isValidYear(targetYear)) {
            return {};
        }

        return {
            $expr: {
                $eq: [
                    {
                        $add: [
                            1,
                            {
                                $subtract: [
                                    {
                                        $cond: [
                                            { 
                                                $lt: [
                                                    { $month: new Date() }, 
                                                    this.ACADEMIC_YEAR_START_MONTH
                                                ]
                                            },
                                            { $subtract: [{ $year: new Date() }, 1] },
                                            { $year: new Date() }
                                        ]
                                    },
                                    {
                                        $toInt: {
                                            $substr: [
                                                '$student.registerNo',
                                                this.REGISTRATION_YEAR_START_INDEX,
                                                this.REGISTRATION_YEAR_LENGTH
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    targetYear
                ]
            }
        };
    }

    /**
     * Helper method to extract year from registration number
     * @param {string} registerNo 
     * @returns {number|null}
     */
    static extractYearFromRegisterNo(registerNo) {
        if (!registerNo || typeof registerNo !== 'string') {
            return null;
        }

        const yearStr = registerNo.substr(
            this.REGISTRATION_YEAR_START_INDEX, 
            this.REGISTRATION_YEAR_LENGTH
        );
        
        const year = parseInt(yearStr, 10);
        return isNaN(year) ? null : year;
    }
}

module.exports = StudentYearUtil;