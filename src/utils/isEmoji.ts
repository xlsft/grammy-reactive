/**
 * Checks whether a string is exactly one emoji symbol.
 *
 * The check validates that the entire string consists of a single
 * Unicode RGI emoji grapheme, including complex emoji sequences such as:
 * - skin tone modifiers
 * - ZWJ sequences
 * - flags
 * - family emojis
 * - keycap emojis
 *
 * Requires JavaScript support for the `v` regular expression flag.
 *
 * @param {string} str - The string to validate.
 * @returns {boolean} `true` if the string is exactly one emoji symbol.
 *
 * @example
 * isEmoji("🔥"); // true
 * isEmoji("👨‍👩‍👧‍👦"); // true
 * isEmoji("🇱🇻"); // true
 * isEmoji("🔥🔥"); // false
 * isEmoji("🔥 hi"); // false
 */
export function isEmoji(str: string): boolean {
    return /^\p{RGI_Emoji}$/v.test(str);
}
