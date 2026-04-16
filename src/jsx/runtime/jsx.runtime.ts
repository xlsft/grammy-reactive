import type {
    Element as _Element,
    IntrinsicElements as _IntrinsicElements,
    Component as _Component,
} from '~/types/jsx.types.ts'
import { createRoot, createFragment } from './jsx.ts'

export {
    createFragment as Fragment,
    createRoot as jsx,
    createRoot as jsxDEV,
    createRoot as jsxs,
}

/**
 * Global JSX runtime type declarations.
 *
 * This namespace defines the TypeScript JSX contract used by the
 * custom reactive render runtime, including supported element types,
 * intrinsic tags, props inference, and children handling.
 */
export namespace JSX {
    export type Element = _Element | Promise<_Element>
    export type ElementType = keyof _IntrinsicElements | _Component
    export interface ElementAttributesProperty { props: {} }
    export interface ElementChildrenAttribute { children: {} }
    export interface IntrinsicElements extends _IntrinsicElements {}
    export interface IntrinsicAttributes {}
}
