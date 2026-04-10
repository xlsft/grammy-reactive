import type { MemoHook } from "~/types/hooks.types";
import { createHook } from "./create";

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
