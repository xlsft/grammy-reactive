import { withComponentScope } from '../../utils';
import type {
    Component,
    IntrinsicElements,
    FragmentElement,
    Node,
    IntrinsicElementOptions,
    PlainNode,
    EntityPropsMap,
    EntityFactoryMap,
    JSX,
} from '../../types/jsx.types.ts'
import { isIntrinsicElement } from 'src/utils';
import { InternalError } from '../../lib/render/components/Error.tsx';
import type { WithChildren } from '../../types/utils.types.ts';

/**
 * Resolves an arbitrary JSX node into a normalized element array.
 *
 * Supports:
 * - primitive text nodes
 * - nested arrays
 * - async nodes
 * - component-scoped child traversal
 *
 * Primitive values are converted into plain text elements.
 *
 * @param {Node} node - The input JSX-compatible node.
 * @returns {Promise<JSX.Element[]>}
 * A normalized flat array of JSX elements.
 */
export async function createChildren(node: Node): Promise<JSX.Element[]> {
    return withComponentScope(async () => {
        const resolved = await node; if (resolved == null) return []
        const type = typeof resolved;
        if (type === "string" || type === "number" || typeof resolved === "boolean") {
            return [{ type: "plain", value: (resolved as PlainNode)?.toString() }];
        }
        if (Array.isArray(resolved)) {
            const children = await Promise.all(resolved.map(createChildren))
            return children.flat();
        }
        return [resolved as JSX.Element];
    });
}

/**
 * Creates an intrinsic entity descriptor from a JSX tag and props.
 *
 * This converts a tag definition into the internal entity shape
 * used by the render pipeline.
 *
 * @template K
 * @param {K} tag - The intrinsic JSX tag name.
 * @param {EntityPropsMap[K]} props - Props associated with the tag.
 * @returns {EntityFactoryMap[K]}
 * The normalized intrinsic entity object.
 */
export function createEntity<K extends keyof IntrinsicElements>(tag: K, props: EntityPropsMap[K]): EntityFactoryMap[K] {
    return {
        type: tag,
        ...props,
    } as EntityFactoryMap[K];
}

/**
 * Creates a normalized intrinsic JSX element.
 *
 * Validates the intrinsic tag, extracts children, generates
 * a stable internal element ID, and resolves child nodes.
 *
 * @template T
 * @param {T} options - Intrinsic element creation options.
 * @returns {Promise<JSX.Element>}
 * A fully normalized intrinsic JSX element.
 */
export async function createIntrinsicElement<T extends IntrinsicElementOptions>(options: T): Promise<JSX.Element> {
    if (!isIntrinsicElement(options.tag)) throw new Error(`Invalid intrinsic element: ${options.tag}`);
    const children = "children" in options.props ? options.props.children ?? [] : [];
    const { children: _, ...props } = (options.props as WithChildren);
    return {
        type: "intrinsic",
        entity: createEntity(options.tag, props as EntityPropsMap[T["tag"]]),
        children: await createChildren(children),
    };
}

/**
 * Creates either an intrinsic JSX element or executes a component.
 *
 * Intrinsic tags are normalized into internal renderable elements.
 * Function components are executed inside an isolated component scope.
 *
 * If a component throws during render, an internal error fallback
 * component is returned instead.
 *
 * @template T
 * @param {T | Component} type - Intrinsic tag or component function.
 * @param {any} props - Component props.
 * @param {Node} children - JSX children.
 * @returns {JSX.Element | Promise<JSX.Element>}
 * The created JSX element tree root.
 */
export function createElement<T extends keyof IntrinsicElements>(type: T, props: IntrinsicElements[T], children: Node): JSX.Element | Promise<JSX.Element>;
export function createElement(type: Component, props: any, children: Node): JSX.Element | Promise<JSX.Element> {
    const intrinsicElementProps = children === undefined ? props : { ...props, children };
    if (typeof type === "string") {
        if (!isIntrinsicElement(type)) throw new Error(`Invalid JSX component: ${type}.`);
        return createIntrinsicElement({ tag: type, props: intrinsicElementProps });
    }
    if (typeof type === "function") {
        return withComponentScope(async () => {
            try {
                return await type(intrinsicElementProps as JSX.Element | Promise<JSX.Element>)
            } catch (e) {
                console.error(e)
                return await InternalError({ error: e as Error })
            }
        });
    }
    throw new Error(`Invalid JSX component: ${type}.`);
}

/**
 * Creates a fragment element from child nodes.
 *
 * Fragments allow grouping multiple JSX children without
 * introducing an intrinsic wrapper node.
 *
 * @param {{ children?: Node }} [props]
 * Optional fragment props with children.
 * @returns {Promise<FragmentElement>}
 * The normalized fragment element.
 */
export async function createFragment(props?: { children?: Node }): Promise<FragmentElement> {
    return {
        type: 'fragment',
        children: await createChildren(props?.children ?? []),
    }
}

/**
 * Creates the root JSX tree entry point.
 *
 * This is the main runtime factory used by the JSX transform.
 * It normalizes props, extracts children, applies an optional key,
 * and delegates element creation to the core factory.
 *
 * @param {any} type - JSX tag or component function.
 * @param {any} props - Root props object.
 * @param {any} [key] - Optional JSX key.
 * @returns {JSX.Element | Promise<JSX.Element>}
 * The root JSX element tree.
 */
export function createRoot(type: any, props: any, key?: any) {
    props ??= {};
    const children = props.children;

    if (key !== undefined) props.key = key;

    return createElement(type, props, children);
}
