import type { IntrinsicElement, PlainElement } from "../types/jsx.types";

/**
 * Finds the first direct plain-text child value within an intrinsic element.
 *
 * This utility performs a shallow scan over the element's immediate
 * `children` collection and returns the value of the first child whose
 * node type is `"plain"`.
 *
 * Only direct children are inspected. Nested descendants are not traversed.
 *
 * Useful for extracting raw textual labels, captions, button titles,
 * or other first-level plain text content from JSX-generated trees.
 *
 * @param {IntrinsicElement} element - The intrinsic element whose direct children should be scanned.
 * @returns {string | undefined}
 * The first plain-text child value, or `undefined` if no direct plain node exists.
 *
 * @example
 * const text = getPlainText(buttonElement);
 * // "Click me"
 */
export function getPlainText(element: IntrinsicElement): string | undefined {
    const children = element.children;

    for (let i = 0; i < children.length; i++) {
        const child = children[i]! as PlainElement;

        if (child.type === "plain") {
            return child.value as string | undefined;
        }
    }
}
