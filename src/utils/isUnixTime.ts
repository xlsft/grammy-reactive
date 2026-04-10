/**
 * Checks whether a numeric value is a valid Unix timestamp.
 *
 * Supports both:
 * - Unix time in **seconds**
 * - Unix time in **milliseconds**
 *
 * Millisecond timestamps are automatically normalized to seconds
 * before range validation.
 *
 * @remarks
 * The accepted range is:
 * - minimum: Unix epoch (`0`)
 * - maximum: year `3000-01-01T00:00:00Z`
 *
 * @param {number} time - The timestamp value to validate.
 * @returns {boolean} `true` if the value is a finite valid Unix timestamp.
 *
 * @example
 * isUnixTime(1712745600); // true
 *
 * @example
 * isUnixTime(1712745600000); // true
 *
 * @example
 * isUnixTime(NaN); // false
 *
 * @example
 * isUnixTime(-1); // false
 */
export function isUnixTime(time: number): boolean {
    if (typeof time !== "number" || !Number.isFinite(time)) return false;
    const min = 0, max = 32503680000;
    const t = time > 1e12 ? Math.floor(time / 1000) : time;
    return t >= min && t <= max;
}
