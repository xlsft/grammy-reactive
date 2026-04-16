import { useMemo } from "./memo.hooks";

/**
 * Creates a persistent mutable reference object.
 *
 * The returned object remains stable between renders and can be
 * used to store mutable values without triggering rerenders.
 *
 * This is useful for caching instance-like values, storing
 * timers, preserving previous values, or keeping mutable
 * references to async resources.
 *
 * @template T
 * @param {T} initial - The initial reference value.
 * @returns {{ current: T }}
 * A stable mutable reference object.
 *
 * @example
 * ```tsx
 * const timer = useRef<NodeJS.Timeout | null>(null)
 *
 * timer.current = setTimeout(...)
 * ```
 */
export function useRef<T>(initial: T) {
    return useMemo(() => ({ current: initial }), []);
}
