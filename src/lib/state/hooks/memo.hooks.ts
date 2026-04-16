import type { MemoHook } from "../../../types/hooks.types";
import { createHook } from "./create";

/**
 * Memoizes a computed value between renders.
 *
 * The factory function is only re-executed when one of the
 * provided dependencies changes.
 *
 * This is useful for caching expensive calculations,
 * preserving derived values, and avoiding unnecessary
 * recomputation during rerenders.
 *
 * @template T
 * @param {() => T} factory - The value factory function.
 * @param {unknown[]} [deps] - Optional dependency list.
 * @returns {T}
 * The memoized computed value.
 *
 * @example
 * ```tsx
 * const doubled = useMemo(() => count * 2, [count])
 * ```
 */
export function useMemo<T>(factory: () => T, deps?: unknown[]): T {
    const { hooks, index } = createHook();
    const prev = hooks[index] as MemoHook<T> | undefined;
    const changed = !prev || !deps || !prev.deps || deps.length !== prev.deps.length || deps.some((dep, i) => !Object.is(dep, prev.deps![i]));
    if (changed) {
        const value = factory();
        hooks[index] = { value, deps } satisfies MemoHook<T>;
        return value;
    }
    return prev.value;
}
