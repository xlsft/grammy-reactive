import type { IntrinsicElement, IntrinsicElements } from "../types/jsx.types";

/**
 * Finds the first direct emoji intrinsic child entity within an element.
 *
 * This utility performs a shallow scan over the element's immediate
 * `children` collection and returns the first child whose intrinsic
 * entity type is `"emoji"`.
 *
 * Only direct children are inspected. Nested descendants inside child
 * branches are not traversed.
 *
 * Useful for extracting decorative or semantic emoji metadata from
 * JSX-generated intrinsic trees.
 *
 * @param {IntrinsicElement} element - The intrinsic element whose direct children should be scanned.
 * @returns {IntrinsicElements["emoji"] | undefined}
 * The first matching emoji entity, or `undefined` if none is found.
 *
 * @example
 * const emoji = getEmoji(element);
 * if (emoji) {
 *     console.log(emoji.id);
 * }
 */
export function getEmoji(element: IntrinsicElement): IntrinsicElements["emoji"] | undefined {
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i]! as IntrinsicElement;

        if (child.type === "intrinsic" && child.entity.type === "emoji") {
            return child.entity as IntrinsicElements["emoji"];
        }
    }
}
