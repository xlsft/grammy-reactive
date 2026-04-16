import type { PlainElement } from "../../../types/jsx.types";
import { sanitizeHtmlString } from "../../../utils";

/**
 * Renders a {@link PlainElement} into a sanitized HTML-safe string.
 *
 * This function serializes plain text render nodes during the final
 * render phase of the message AST pipeline.
 *
 * Supported value handling:
 * - `null`, `undefined`, and boolean values render as an empty string
 * - `string` values are HTML-sanitized directly
 * - numeric values are stringified before sanitization
 *
 * The resulting string is always safe to embed into Telegram HTML output.
 *
 * @param {PlainElement} element - The plain text node to render.
 * @returns {string} The sanitized rendered string.
 *
 * @example
 * plainElementRender({ type: "plain", value: "Hello <world>" });
 * // "Hello &lt;world&gt;"
 *
 * @example
 * plainElementRender({ type: "plain", value: 42 });
 * // "42"
 */
export function createPlainElementRender(element: PlainElement): string {
    const value = element.value;
    if (value == null || value === false || value === true) return "";
    return typeof value === "string" ? sanitizeHtmlString(value) : sanitizeHtmlString("" + value);
}
