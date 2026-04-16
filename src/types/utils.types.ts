import type { Node } from "./jsx.types";

/**
 * Excludes `undefined` from a union type.
 *
 * Commonly used to normalize optional generic parameters
 * into a required variant for internal render pipelines.
 *
 * @template T
 */
export type RequiredUnion<T> = T extends undefined ? never : T;

/**
 * Adds optional JSX children support to a props object.
 *
 * This is the base utility used for intrinsic elements and custom
 * component props that may receive renderable child nodes.
 *
 * @template P
 */
export type WithChildren<P = {}> = P & {
    children?: Node
};

/**
 * Extracts the props type from a {@link WithChildren}-compatible shape.
 *
 * If the target type does not use `WithChildren`, the original type
 * is returned unchanged.
 *
 * @template T
 */
export type PropsOf<T> = T extends WithChildren<infer P> ? P : T;

/**
 * Represents a value that can be provided either as a single item
 * or as an array of items of the same type.
 *
 * Useful for APIs that accept both:
 * - a single value
 * - multiple values
 *
 * @template T
 *
 * @example
 * type Input = MaybeArray<string>;
 * // string | string[]
 */
export type MaybeArray<T> = T | T[]

export type AllKeys<T> = T extends any ? keyof T : never

export type StrictUnion<T> = T extends any
    ? T & { [K in Exclude<AllKeys<T>, keyof T>]?: never }
    : never
