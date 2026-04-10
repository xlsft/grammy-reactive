/**
 * Escapes unsafe characters in a string for safe HTML rendering.
 *
 * This utility replaces the core HTML-sensitive characters:
 * - `&` → `&amp;`
 * - `<` → `&lt;`
 * - `>` → `&gt;`
 *
 * It is primarily used during the final message serialization phase
 * to ensure that plain text content cannot break Telegram HTML markup.
 *
 * @param {string} unsafe - The raw string to sanitize.
 * @returns {string} The escaped HTML-safe string.
 *
 * @example
 * sanitizeHtmlString("<b>Hello</b>");
 * // "&lt;b&gt;Hello&lt;/b&gt;"
 *
 * @example
 * sanitizeHtmlString("Tom & Jerry");
 * // "Tom &amp; Jerry"
 */
export function sanitizeHtmlString(unsafe: string): string {
    return unsafe
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
