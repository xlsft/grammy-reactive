/**
 * Wraps pre-rendered child content in an intrinsic HTML tag pair.
 *
 * This is a low-level render helper used during the final serialization
 * phase to convert intrinsic text entities into Telegram-compatible
 * HTML markup.
 *
 * The function assumes that `children` has already been fully rendered
 * and sanitized by the caller.
 *
 * @param {string} tag - The tag name to render.
 * @param {string} children - Pre-rendered child HTML content.
 * @returns {string} The serialized HTML tag string.
 *
 * @example
 * createTagElementRender("b", "Hello");
 * // "<b>Hello</b>"
 *
 * @example
 * createTagElementRender("code", "&lt;div&gt;");
 * // "<code>&lt;div&gt;</code>"
 */
export function createTagRender(tag: string, children: string, attributes: Record<string, any> = {}): string {
    const result = `<${tag}${Object.entries(attributes).filter(Boolean).map(([k, v]) => ` ${k}="${v}"`).join('')}>${children}</${tag}>`
    return result;
}
