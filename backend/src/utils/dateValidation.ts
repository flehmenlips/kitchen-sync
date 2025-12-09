/**
 * Validates and parses a YYYY-MM-DD date string as UTC midnight.
 * 
 * This function ensures that:
 * 1. The date format matches YYYY-MM-DD
 * 2. The date is semantically valid (e.g., February 30 is rejected)
 * 3. The date is parsed as UTC midnight to avoid timezone issues
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Object with { valid: boolean, date?: Date, error?: string }
 */
export function validateAndParseUTCDate(dateStr: string): { valid: boolean; date?: Date; error?: string } {
    // Validate format
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
        return { valid: false, error: 'Invalid date format. Use YYYY-MM-DD format.' };
    }

    const [, yearStr, monthStr, dayStr] = dateMatch;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    // Validate numeric ranges
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return { valid: false, error: 'Invalid date value.' };
    }

    // Validate month range (1-12)
    if (month < 1 || month > 12) {
        return { valid: false, error: 'Invalid month. Month must be between 01 and 12.' };
    }

    // Validate day range (1-31, but will check semantic validity below)
    if (day < 1 || day > 31) {
        return { valid: false, error: 'Invalid day. Day must be between 01 and 31.' };
    }

    // Parse as UTC midnight
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    // Check if date is invalid (shouldn't happen with our checks, but safety check)
    if (isNaN(parsedDate.getTime())) {
        return { valid: false, error: 'Invalid date value.' };
    }

    // CRITICAL: Verify semantic validity by checking if the parsed date components
    // match the input. Date.UTC() silently rolls over invalid dates (e.g., Feb 30 -> Mar 2),
    // so we need to verify the components match.
    const parsedYear = parsedDate.getUTCFullYear();
    const parsedMonth = parsedDate.getUTCMonth() + 1; // getUTCMonth() returns 0-11
    const parsedDay = parsedDate.getUTCDate();

    if (parsedYear !== year || parsedMonth !== month || parsedDay !== day) {
        return { valid: false, error: 'Invalid date. Date does not exist (e.g., February 30, April 31).' };
    }

    return { valid: true, date: parsedDate };
}

