import { useMemo } from "./memo.hooks";

/**
 * Memoizes a callback function between renders.
 *
 * The same function reference is preserved until one of the
 * provided dependencies changes.
 *
 * This is useful for preventing unnecessary rerenders,
 * preserving stable event handlers, and avoiding repeated
 * callback recreation inside reactive components.
 *
 * @template T
 * @param {T} callback - The function to memoize.
 * @param {unknown[]} [deps] - Optional dependency list.
 * @returns {T}
 * The memoized callback reference.
 *
 * @example
 * ```tsx
 * const onClick = useCallback(() => {
 *   setCount(v => v + 1)
 * }, [])
 * ```
 */
export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: unknown[]): T {
    return useMemo(() => callback, deps);
}
