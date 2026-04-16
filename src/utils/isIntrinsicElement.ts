import { intrinsicElements, type IntrinsicElements } from "../types/jsx.types";

/**
 * Checks whether a string is a valid intrinsic JSX element name.
 *
 * This utility acts as a runtime type guard for intrinsic JSX tags
 * supported by the renderer.
 *
 * When the check succeeds, TypeScript narrows `name` to
 * `keyof IntrinsicElements`, making it safe to use in intrinsic
 * element factories, render dispatchers, and JSX runtime pipelines.
 *
 * @param {string} name - The element name to validate.
 * @returns {name is keyof IntrinsicElements}
 * `true` if the name is a supported intrinsic element.
 *
 * @example
 * if (isIntrinsicElement(tag)) {
 *     // tag is narrowed to keyof IntrinsicElements
 *     createIntrinsicElement({ tag, props });
 * }
 */
export function isIntrinsicElement(name: string): name is keyof IntrinsicElements {
    return name in intrinsicElements;
}
