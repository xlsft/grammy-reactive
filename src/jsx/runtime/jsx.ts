import { withComponentScope } from '~/utils/withComponentScope.ts';
import type {
    Component,
    IntrinsicElements,
    FragmentElement,
    Node,
    IntrinsicElementOptions,
    PlainNode,
    EntityPropsMap,
    EntityFactoryMap,
    WithChildren,
    JSX,
} from '../../types/jsx.types.ts'
import { generateUniqueId, isIntrinsicElement } from 'src/utils';
import { InternalError } from '~/lib/render/components/Error.tsx';

export async function createChildren(node: Node): Promise<JSX.Element[]> {
    return withComponentScope(async () => {
        const resolved = await node;

        if (resolved == null) {
            return [];
        }

        const type = typeof resolved;

        if (type === "string" || type === "number" || typeof resolved === "boolean") {
            return [{ type: "plain", value: (resolved as PlainNode)?.toString() }];
        }

        if (Array.isArray(resolved)) {
            const children = await Promise.all(
                resolved.map(createChildren)
            );

            return children.flat();
        }

        return [resolved as JSX.Element];
    });
}

export function createEntity<K extends keyof IntrinsicElements>(tag: K, props: EntityPropsMap[K]): EntityFactoryMap[K] {
    return {
        type: tag,
        ...props,
    } as EntityFactoryMap[K];
}

export async function createIntrinsicElement<T extends IntrinsicElementOptions>(options: T): Promise<JSX.Element> {
    if (!isIntrinsicElement(options.tag)) throw new Error(`Invalid intrinsic element: ${options.tag}`);
    const children = "children" in options.props ? options.props.children ?? [] : [];
    const { children: _, ...props } = (options.props as WithChildren);
    return {
        id: generateUniqueId(),
        type: "intrinsic",
        entity: createEntity(options.tag, props as EntityPropsMap[T["tag"]]),
        children: await createChildren(children),
    };
}

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

export async function createFragment(props?: { children?: Node }): Promise<FragmentElement> {
    return {
        type: 'fragment',
        children: await createChildren(props?.children ?? []),
    }
}

export function createRoot(type: any, props: any, key?: any) {
    props ??= {};
    const children = props.children;

    if (key !== undefined) props.key = key;

    return createElement(type, props, children);
}
